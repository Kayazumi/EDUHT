// [BE] Route Handler Vercel Cron keepalive · tài liệu mục 4.5 · TODO: hiện thực
import { createAdminClient } from "@/server/supabase/admin";

export async function GET() {
  const _admin = createAdminClient();
  return Response.json({ error: "NOT_IMPLEMENTED" }, { status: 501 });
}
