// [BE] Route Handler xuất tập dữ liệu nghiên cứu đã giả danh hóa.
import { createHmac } from "node:crypto";
import { z } from "zod";
import { createClient } from "@/server/supabase/server";
import { createAdminClient } from "@/server/supabase/admin";
import { serverEnv } from "@/server/env";

const paramsSchema = z.string().uuid();

type FinalScoreRow = {
  student_id: string;
  group_id: string;
  group_score: number;
  peer_score: number | null;
  peer_missing: boolean;
  computed_score: number;
  adjusted_score: number | null;
  final_score: number;
  progress_snapshot: Record<string, unknown>;
};

function csvCell(value: unknown): string {
  const text = value == null ? "" : typeof value === "object" ? JSON.stringify(value) : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  if (!paramsSchema.safeParse(projectId).success) {
    return Response.json({ error: "Project not found" }, { status: 404, headers: { "Cache-Control": "no-store" } });
  }
  const format = new URL(request.url).searchParams.get("format") ?? "csv";
  if (format !== "csv" && format !== "json") {
    return Response.json({ error: "format must be csv or json" }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }

  try {
    const sessionClient = await createClient();
    const { data: authData, error: authError } = await sessionClient.auth.getUser();
    if (authError || !authData.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401, headers: { "Cache-Control": "no-store" } });
    }

    const admin = createAdminClient();
    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("role,is_active")
      .eq("id", authData.user.id)
      .maybeSingle();
    if (profileError || profile?.role !== "admin" || !profile.is_active) {
      return Response.json({ error: "Forbidden" }, { status: 403, headers: { "Cache-Control": "no-store" } });
    }

    const { data: project, error: projectError } = await admin
      .from("projects")
      .select("id,title")
      .eq("id", projectId)
      .maybeSingle();
    if (projectError || !project) {
      return Response.json({ error: "Project not found" }, { status: 404, headers: { "Cache-Control": "no-store" } });
    }

    const { data: scoreData, error: scoreError } = await admin
      .from("final_scores")
      .select("student_id,group_id,group_score,peer_score,peer_missing,computed_score,adjusted_score,final_score,progress_snapshot")
      .eq("project_id", projectId);
    if (scoreError) {
      return Response.json({ error: "Could not load research dataset" }, { status: 500, headers: { "Cache-Control": "no-store" } });
    }

    const scores = (scoreData ?? []) as FinalScoreRow[];
    const studentIds = [...new Set(scores.map((row) => row.student_id))];
    const { data: consents, error: consentError } = studentIds.length
      ? await admin.from("research_consents").select("student_id").eq("status", "granted").in("student_id", studentIds)
      : { data: [], error: null };
    if (consentError) {
      return Response.json({ error: "Could not verify research consent" }, { status: 500, headers: { "Cache-Control": "no-store" } });
    }

    const consented = new Set((consents ?? []).map((row) => row.student_id));
    const included = scores.filter((row) => consented.has(row.student_id));
    const secret = serverEnv.EXPORT_PSEUDONYM_SECRET;
    const pseudo = (kind: "student" | "group", id: string) =>
      createHmac("sha256", secret).update(`${kind}:${projectId}:${id}`).digest("hex");
    const rows = included.map((row) => ({
      pseudo_student_id: pseudo("student", row.student_id),
      pseudo_group_id: pseudo("group", row.group_id),
      group_score: row.group_score,
      peer_score: row.peer_score,
      peer_missing: row.peer_missing,
      computed_score: row.computed_score,
      adjusted_score: row.adjusted_score,
      final_score: row.final_score,
      progress_snapshot: row.progress_snapshot,
    }));

    const { error: logError } = await admin.from("research_exports").insert({
      project_id: projectId,
      exported_by: authData.user.id,
      key_version: serverEnv.EXPORT_PSEUDONYM_KEY_VERSION,
      included_student_ids: included.map((row) => row.student_id),
      row_count: rows.length,
      note: `Research dataset export: ${project.title}`,
    });
    if (logError) {
      return Response.json({ error: "Could not record export audit" }, { status: 500, headers: { "Cache-Control": "no-store" } });
    }

    if (format === "json") {
      return Response.json(rows, { headers: { "Cache-Control": "no-store", "Content-Disposition": `attachment; filename="research-${projectId}.json"` } });
    }
    const columns = ["pseudo_student_id", "pseudo_group_id", "group_score", "peer_score", "peer_missing", "computed_score", "adjusted_score", "final_score", "progress_snapshot"] as const;
    const csv = [columns.join(","), ...rows.map((row) => columns.map((key) => csvCell(row[key])).join(","))].join("\r\n");
    return new Response(`\uFEFF${csv}`, {
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="research-${projectId}.csv"`,
      },
    });
  } catch {
    return Response.json({ error: "Export is not configured" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
