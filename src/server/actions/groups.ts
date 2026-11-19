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
        name: name.trim(),
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
      .update({ name: name.trim() })
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

const deleteGroupSchema = z.object({
  groupId: z.string().uuid("Mã nhóm không hợp lệ"),
});

export async function deleteGroup(input: unknown): Promise<ActionResult> {
  try {
    await requireRole("teacher");
    const parsed = deleteGroupSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "Mã nhóm không hợp lệ" };
    }
    const { groupId } = parsed.data;
    const supabase = await createClient();

    // Xóa các thành viên nhóm trước
    await supabase.from("group_members").delete().eq("group_id", groupId);
    // Xóa các thẻ nhiệm vụ của nhóm nếu có
    await supabase.from("tasks").delete().eq("group_id", groupId);

    const { error } = await supabase
      .from("groups")
      .delete()
      .eq("id", groupId);

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, data: undefined };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi xóa nhóm";
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
    await requireRole("teacher");
    const parsed = assignMemberSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "Dữ liệu phân nhóm không hợp lệ" };
    }

    const { groupId, studentId, projectId } = parsed.data;
    const supabase = await createClient();

    // Lấy thông tin dự án và lớp học
    const { data: project, error: projErr } = await supabase
      .from("projects")
      .select("id, class_id")
      .eq("id", projectId)
      .maybeSingle();

    if (projErr || !project) {
      return { ok: false, error: "Không tìm thấy dự án học tập" };
    }

    // Kiểm tra học sinh có thuộc lớp không
    const { data: enrolled } = await supabase
      .from("class_students")
      .select("student_id")
      .eq("class_id", project.class_id)
      .eq("student_id", studentId)
      .maybeSingle();

    if (!enrolled) {
      return { ok: false, error: "Học sinh không thuộc lớp học của dự án này" };
    }

    // Cập nhật hoặc thêm thành viên vào nhóm (upsert đảm bảo mỗi học sinh chỉ thuộc 1 nhóm trong 1 dự án)
    const { error: upsertErr } = await supabase
      .from("group_members")
      .upsert({
        group_id: groupId,
        student_id: studentId,
        project_id: projectId,
        class_id: project.class_id,
      }, { onConflict: "project_id,student_id" });

    if (upsertErr) {
      return { ok: false, error: "Lỗi ghi nhận thành viên vào CSDL: " + upsertErr.message };
    }

    return { ok: true, data: undefined };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi phân học sinh vào nhóm";
    return { ok: false, error: msg };
  }
}

const removeMemberSchema = z.object({
  groupId: z.string().uuid("Mã nhóm không hợp lệ"),
  studentId: z.string().uuid("Mã học sinh không hợp lệ"),
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
    const msg = err instanceof Error ? err.message : "Lỗi gỡ học sinh khỏi nhóm";
    return { ok: false, error: msg };
  }
}

const lockGroupsSchema = z.object({
  projectId: z.string().uuid("Mã dự án không hợp lệ"),
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

    const { error: lockErr } = await supabase
      .from("groups")
      .update({ locked_at: new Date().toISOString() })
      .eq("project_id", projectId);

    if (lockErr) {
      return { ok: false, error: lockErr.message };
    }

    return { ok: true, data: undefined };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi khóa nhóm";
    return { ok: false, error: msg };
  }
}
