// [BE] Server Action ghi nhận đồng ý nghiên cứu · tài liệu mục 4.6 · TODO: hiện thực
'use server';

import type { ActionResult } from "@/shared/utils/errors";

export async function recordConsent(_input: unknown): Promise<ActionResult> {
  return { ok: false, error: "NOT_IMPLEMENTED" };
}
