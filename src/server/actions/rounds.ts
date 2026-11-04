// [BE] Server Action điều khiển đợt đánh giá · tài liệu mục 4.6 · TODO: hiện thực
'use server';

import type { ActionResult } from "@/shared/utils/errors";

export async function createRound(_input: unknown): Promise<ActionResult> {
  return { ok: false, error: "NOT_IMPLEMENTED" };
}

export async function openRound(_input: unknown): Promise<ActionResult> {
  return { ok: false, error: "NOT_IMPLEMENTED" };
}

export async function closeRound(_input: unknown): Promise<ActionResult> {
  return { ok: false, error: "NOT_IMPLEMENTED" };
}
