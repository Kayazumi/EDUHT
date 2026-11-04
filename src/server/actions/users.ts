// [BE] Server Action quản lý tài khoản người dùng · tài liệu mục 4.6 · TODO: hiện thực
'use server';

import type { ActionResult } from "@/shared/utils/errors";
import { createAdminClient } from "@/server/supabase/admin";

export async function createTeacher(_input: unknown): Promise<ActionResult> {
  const _admin = createAdminClient();
  return { ok: false, error: "NOT_IMPLEMENTED" };
}

export async function createStudent(_input: unknown): Promise<ActionResult> {
  const _admin = createAdminClient();
  return { ok: false, error: "NOT_IMPLEMENTED" };
}

export async function importStudents(_input: unknown): Promise<ActionResult> {
  const _admin = createAdminClient();
  return { ok: false, error: "NOT_IMPLEMENTED" };
}

export async function resetPassword(_input: unknown): Promise<ActionResult> {
  const _admin = createAdminClient();
  return { ok: false, error: "NOT_IMPLEMENTED" };
}

export async function setActive(_input: unknown): Promise<ActionResult> {
  const _admin = createAdminClient();
  return { ok: false, error: "NOT_IMPLEMENTED" };
}

export async function setRole(_input: unknown): Promise<ActionResult> {
  const _admin = createAdminClient();
  return { ok: false, error: "NOT_IMPLEMENTED" };
}
