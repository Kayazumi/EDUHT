// [BE] Route Handler Vercel Cron keepalive · tài liệu mục 4.5
import { timingSafeEqual } from "node:crypto";
import { createAdminClient } from "@/server/supabase/admin";
import { serverEnv } from "@/server/env";

function validCronRequest(request: Request): boolean {
  const authorization = request.headers.get("authorization") ?? "";
  const supplied = Buffer.from(authorization.replace(/^Bearer\s+/i, ""));
  const expected = Buffer.from(serverEnv.CRON_SECRET);
  return /^Bearer\s+/i.test(authorization) && supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

export async function GET(request: Request) {
  try {
    if (!validCronRequest(request)) {
      return Response.json({ error: "Unauthorized" }, { status: 401, headers: { "Cache-Control": "no-store" } });
    }

    const admin = createAdminClient();
    const { error } = await admin.from("profiles").select("id", { count: "exact", head: true }).limit(1);
    if (error) {
      return Response.json({ error: "Database keepalive failed" }, { status: 503, headers: { "Cache-Control": "no-store" } });
    }

    return Response.json({ ok: true, checkedAt: new Date().toISOString() }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Cron is not configured" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
