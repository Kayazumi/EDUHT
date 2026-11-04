// [BE] Server Action quản lý nhóm và sinh thẻ · tài liệu mục 4.6 · TODO: hiện thực
'use server';

import type { ActionResult } from "@/shared/utils/errors";

export async function createGroup(_input: unknown): Promise<ActionResult> {
  return { ok: false, error: "NOT_IMPLEMENTED" };
}

export async function renameGroup(_input: unknown): Promise<ActionResult> {
  return { ok: false, error: "NOT_IMPLEMENTED" };
}

export async function addMember(_input: unknown): Promise<ActionResult> {
  return { ok: false, error: "NOT_IMPLEMENTED" };
}

export async function moveMember(_input: unknown): Promise<ActionResult> {
  return { ok: false, error: "NOT_IMPLEMENTED" };
}

export async function removeMember(_input: unknown): Promise<ActionResult> {
  return { ok: false, error: "NOT_IMPLEMENTED" };
}

export async function lockGroups(_input: unknown): Promise<ActionResult> {
  return { ok: false, error: "NOT_IMPLEMENTED" };
}

export async function instantiateTasks(_input: unknown): Promise<ActionResult> {
  return { ok: false, error: "NOT_IMPLEMENTED" };
}
