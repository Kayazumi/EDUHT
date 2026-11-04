// [BE] Server Action phiếu đánh giá đồng đẳng · tài liệu mục 4.6 · TODO: hiện thực
'use server';

import type { ActionResult } from "@/shared/utils/errors";

export async function saveDraftReview(_input: unknown): Promise<ActionResult> {
  return { ok: false, error: "NOT_IMPLEMENTED" };
}

export async function submitReview(_input: unknown): Promise<ActionResult> {
  return { ok: false, error: "NOT_IMPLEMENTED" };
}
