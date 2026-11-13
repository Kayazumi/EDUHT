// [BE] Server Action quản lý nhóm học sinh · tài liệu mục 4.6, 5.3 và 7.1
'use server';

import type { ActionResult } from "@/shared/utils/errors";
import { createClient } from "@/server/supabase/server";
import { requireRole } from "@/server/auth/guards";
import { z } from "zod";

const createGroupSchema = z.object({
  projectId: z.string().uuid("Mã dự án không hợp lệ"),
  name: z.string().trim().min(1, "Tên nhóm không được để trống").max(50),
});

export async function createGroup(input: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    await requireRole("teacher");
    const parsed = createGroupSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.errors[0]?.message || "Dữ liệu nhóm không hợp lệ" };
    }

    const { projectId, name } = parsed.data;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("groups")
      .insert({
        project_id: projectId,
        name,
      })
      .select("id")
      .single();

    if (error || !data) {
      return { ok: false, error: error?.message || "Không thể tạo nhóm mới" };
    }

    return { ok: true, data: { id: data.id } };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi tạo nhóm";
    return { ok: false, error: msg };
  }
}

const renameGroupSchema = z.object({
  groupId: z.string().uuid("Mã nhóm không hợp lệ"),
  name: z.string().trim().min(1).max(50),
});

export async function renameGroup(input: unknown): Promise<ActionResult> {
  try {
    await requireRole("teacher");
    const parsed = renameGroupSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "Tên nhóm không hợp lệ" };
    }

    const { groupId, name } = parsed.data;
    const supabase = await createClient();

    const { error } = await supabase
      .from("groups")
      .update({ name })
      .eq("id", groupId);

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, data: undefined };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi đổi tên nhóm";
    return { ok: false, error: msg };
  }
}

const assignMemberSchema = z.object({
  groupId: z.string().uuid("Mã nhóm không hợp lệ"),
  studentId: z.string().uuid("Mã học sinh không hợp lệ"),
  projectId: z.string().uuid("Mã dự án không hợp lệ"),
});

export async function assignMember(input: unknown): Promise<ActionResult> {
  try {
    const parsed = assignMemberSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "Dữ liệu phân nhóm không hợp lệ" };
    }

    const { groupId, studentId, projectId } = parsed.data;
    await requireRole("teacher");
    const supabase = await createClient();
    const { error } = await supabase.rpc("assign_project_member", {
      p_project_id: projectId,
      p_group_id: groupId,
      p_student_id: studentId,
    });

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, data: undefined };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi phân học sinh vào nhóm";
    return { ok: false, error: msg };
  }
}

const removeMemberSchema = z.object({
  groupId: z.string().uuid(),
  studentId: z.string().uuid(),
});

export async function removeMember(input: unknown): Promise<ActionResult> {
  try {
    await requireRole("teacher");
    const parsed = removeMemberSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "Dữ liệu không hợp lệ" };
    }

    const { groupId, studentId } = parsed.data;
    const supabase = await createClient();

    const { error } = await supabase
      .from("group_members")
      .delete()
      .eq("group_id", groupId)
      .eq("student_id", studentId);

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, data: undefined };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi xóa thành viên khỏi nhóm";
    return { ok: false, error: msg };
  }
}

const lockGroupsSchema = z.object({
  projectId: z.string().uuid(),
});

export async function lockGroups(input: unknown): Promise<ActionResult> {
  try {
    await requireRole("teacher");
    const parsed = lockGroupsSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "Mã dự án không hợp lệ" };
    }

    const { projectId } = parsed.data;
    const supabase = await createClient();

    const { error: rpcErr } = await supabase.rpc("lock_project_groups", {
      p_project_id: projectId,
    });

    if (rpcErr) {
      return { ok: false, error: rpcErr.message };
    }

    return { ok: true, data: undefined };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi khóa nhóm dự án";
    return { ok: false, error: msg };
  }
}
