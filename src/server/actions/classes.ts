// [BE] Server Action quản lý lớp học · tài liệu mục 4.6 · TODO: hiện thực
'use server';

import type { ActionResult } from "@/shared/utils/errors";

export async function createClass(_input: unknown): Promise<ActionResult> {
  return { ok: false, error: "NOT_IMPLEMENTED" };
}

export async function assignTeacher(_input: unknown): Promise<ActionResult> {
  return { ok: false, error: "NOT_IMPLEMENTED" };
}

export async function enrollStudents(_input: unknown): Promise<ActionResult> {
  return { ok: false, error: "NOT_IMPLEMENTED" };
}

export async function removeStudent(_input: unknown): Promise<ActionResult> {
  return { ok: false, error: "NOT_IMPLEMENTED" };
}

export async function archiveClass(_input: unknown): Promise<ActionResult> {
  return { ok: false, error: "NOT_IMPLEMENTED" };
}
