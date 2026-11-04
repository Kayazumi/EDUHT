// [BE] Server Action gom dữ liệu xuất báo cáo · tài liệu mục 4.6 · TODO: hiện thực
'use server';

import type { ActionResult } from "@/shared/utils/errors";

export async function getExportRows(_input: unknown): Promise<ActionResult<unknown[]>> {
  return { ok: false, error: "NOT_IMPLEMENTED" };
}
