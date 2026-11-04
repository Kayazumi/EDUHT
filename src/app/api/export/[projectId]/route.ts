// [BE] Route Handler xuất dữ liệu CSV · tài liệu mục 4.5 · TODO: hiện thực
import { createAdminClient } from "@/server/supabase/admin";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const _admin = createAdminClient();
  const { projectId: _projectId } = await params;
  return Response.json({ error: "NOT_IMPLEMENTED" }, { status: 501 });
}
