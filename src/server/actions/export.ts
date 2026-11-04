// [BE] Server Action xuất dữ liệu dự án · tài liệu mục 4.6, 5.3 và 7.10
'use server';

import type { ActionResult } from "@/shared/utils/errors";
import { createClient } from "@/server/supabase/server";
import { z } from "zod";

interface ExportScoreItem {
  student_id: string;
  computed_score: number | null;
  adjusted_score: number | null;
  final_score: number | null;
  adjust_reason: string | null;
  result_version: number;
  group_score: number | null;
  peer_score: number | null;
  profiles?: { username?: string; full_name?: string } | null;
  groups?: { name?: string } | null;
}

const exportSchema = z.object({
  projectId: z.string().uuid("Mã dự án không hợp lệ"),
  format: z.enum(["csv", "json"]).default("csv"),
});

export async function exportProjectData(
  input: unknown
): Promise<ActionResult<{ filename: string; content: string }>> {
  try {
    const parsed = exportSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.errors[0]?.message || "Dữ liệu yêu cầu xuất không hợp lệ" };
    }

    const { projectId, format } = parsed.data;
    const supabase = await createClient();

    // Lấy bảng điểm tổng kết dự án
    const { data: scores, error } = await supabase
      .from("final_scores")
      .select(`
        student_id,
        computed_score,
        adjusted_score,
        final_score,
        adjust_reason,
        result_version,
        group_score,
        peer_score,
        profiles:student_id (username, full_name),
        groups:group_id (name)
      `)
      .eq("project_id", projectId);

    if (error) {
      return { ok: false, error: "Không thể lấy dữ liệu điểm dự án: " + error.message };
    }

    const rows = ((scores as unknown as ExportScoreItem[]) || []).map((s) => ({
      username: s.profiles?.username || s.student_id,
      fullName: s.profiles?.full_name || "N/A",
      groupName: s.groups?.name || "N/A",
      groupScore: s.group_score ?? "",
      peerScore: s.peer_score ?? "",
      computedScore: s.computed_score ?? "",
      adjustedScore: s.adjusted_score ?? "",
      finalScore: s.final_score ?? s.computed_score ?? "",
      adjustReason: s.adjust_reason || "",
      version: s.result_version || 1,
    }));

    if (format === "json") {
      return {
        ok: true,
        data: {
          filename: `bang_diem_${projectId}.json`,
          content: JSON.stringify(rows, null, 2),
        },
      };
    }

    // Xuất CSV UTF-8 BOM
    const header = [
      "Tên đăng nhập",
      "Họ và tên",
      "Nhóm",
      "Điểm nhóm",
      "Điểm BARS",
      "Điểm tính toán",
      "Điểm điều chỉnh",
      "Điểm chính thức",
      "Lý do điều chỉnh",
      "Phiên bản",
    ];

    const csvLines = rows.map((r) =>
      [
        r.username,
        `"${r.fullName}"`,
        `"${r.groupName}"`,
        r.groupScore,
        r.peerScore,
        r.computedScore,
        r.adjustedScore,
        r.finalScore,
        `"${r.adjustReason.replace(/"/g, '""')}"`,
        `v${r.version}`,
      ].join(",")
    );

    const csvContent = "\uFEFF" + [header.join(","), ...csvLines].join("\n");

    return {
      ok: true,
      data: {
        filename: `bang_diem_${projectId}.csv`,
        content: csvContent,
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi xuất báo cáo dự án";
    return { ok: false, error: msg };
  }
}
