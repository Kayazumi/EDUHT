// [BE] Server Action quản lý thẻ Kanban · tài liệu mục 4.6, 5.3 và 7.1
'use server';

import type { ActionResult } from "@/shared/utils/errors";
import { createClient } from "@/server/supabase/server";
import { z } from "zod";

const createTaskSchema = z.object({
  groupId: z.string().uuid("Mã nhóm không hợp lệ"),
  projectId: z.string().uuid("Mã dự án không hợp lệ"),
  title: z.string().trim().min(3, "Tiêu đề nhiệm vụ tối thiểu 3 ký tự").max(150),
  description: z.string().trim().optional(),
  assigneeId: z.string().uuid().nullable().optional(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Hạn chót phải có định dạng YYYY-MM-DD").nullable().optional(),
  position: z.coerce.number().default(0),
});

export async function createTask(input: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    const parsed = createTaskSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.errors[0]?.message || "Dữ liệu thẻ không hợp lệ" };
    }

    const { groupId, projectId, title, description, assigneeId, dueDate, position } = parsed.data;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        group_id: groupId,
        project_id: projectId,
        title,
        description: description || null,
        status: "todo",
        assignee_id: assigneeId || null,
        due_date: dueDate || null,
        position,
      })
      .select("id")
      .single();

    if (error || !data) {
      return { ok: false, error: error?.message || "Không thể tạo thẻ nhiệm vụ" };
    }

    return { ok: true, data: { id: data.id } };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi tạo thẻ nhiệm vụ";
    return { ok: false, error: msg };
  }
}

const updateTaskSchema = z.object({
  id: z.string().uuid("Mã thẻ không hợp lệ"),
  title: z.string().trim().min(3).max(150),
  description: z.string().trim().optional(),
  assigneeId: z.string().uuid().nullable().optional(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
});

export async function updateTask(input: unknown): Promise<ActionResult> {
  try {
    const parsed = updateTaskSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "Dữ liệu cập nhật không hợp lệ" };
    }

    const { id, title, description, assigneeId, dueDate } = parsed.data;
    const supabase = await createClient();

    const { error } = await supabase
      .from("tasks")
      .update({
        title,
        description: description || null,
        assignee_id: assigneeId || null,
        due_date: dueDate || null,
      })
      .eq("id", id);

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, data: undefined };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi cập nhật thẻ nhiệm vụ";
    return { ok: false, error: msg };
  }
}

const moveTaskSchema = z.object({
  taskId: z.string().uuid("Mã thẻ không hợp lệ"),
  status: z.enum(["todo", "doing", "done"]),
  assigneeId: z.string().uuid().nullable().optional(),
  position: z.coerce.number().optional(),
});

export async function moveTask(input: unknown): Promise<ActionResult> {
  try {
    const parsed = moveTaskSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "Dữ liệu di chuyển thẻ không hợp lệ" };
    }

    const { taskId, status, assigneeId, position } = parsed.data;

    // Ràng buộc Scenario 3: Chuyển sang doing bắt buộc có assignee
    if (status === "doing" && !assigneeId) {
      return { ok: false, error: "Nhiệm vụ chuyển sang DOING bắt buộc phải có người phụ trách (Scenario 3)" };
    }

    const supabase = await createClient();
    const updatePayload: Record<string, unknown> = { status };
    if (assigneeId !== undefined) {
      updatePayload.assignee_id = assigneeId;
    }
    if (position !== undefined) {
      updatePayload.position = position;
    }

    const { error } = await supabase
      .from("tasks")
      .update(updatePayload)
      .eq("id", taskId);

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, data: undefined };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi di chuyển thẻ Kanban";
    return { ok: false, error: msg };
  }
}

const assignTaskSchema = z.object({
  taskId: z.string().uuid("Mã thẻ không hợp lệ"),
  assigneeId: z.string().uuid().nullable(),
});

export async function assignTask(input: unknown): Promise<ActionResult> {
  try {
    const parsed = assignTaskSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "Dữ liệu gán người phụ trách không hợp lệ" };
    }

    const { taskId, assigneeId } = parsed.data;
    const supabase = await createClient();

    const { error } = await supabase
      .from("tasks")
      .update({ assignee_id: assigneeId })
      .eq("id", taskId);

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, data: undefined };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi gán người phụ trách";
    return { ok: false, error: msg };
  }
}

const setDueDateSchema = z.object({
  taskId: z.string().uuid("Mã thẻ không hợp lệ"),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Hạn chót phải có định dạng YYYY-MM-DD").nullable(),
});

export async function setDueDate(input: unknown): Promise<ActionResult> {
  try {
    const parsed = setDueDateSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "Hạn chót không hợp lệ" };
    }

    const { taskId, dueDate } = parsed.data;
    const supabase = await createClient();

    const { error } = await supabase
      .from("tasks")
      .update({ due_date: dueDate })
      .eq("id", taskId);

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, data: undefined };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi đổi hạn hoàn thành";
    return { ok: false, error: msg };
  }
}

const archiveTaskSchema = z.object({
  taskId: z.string().uuid("Mã thẻ không hợp lệ"),
});

export async function archiveTask(input: unknown): Promise<ActionResult> {
  try {
    const parsed = archiveTaskSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "Mã thẻ không hợp lệ" };
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("tasks")
      .update({ archived_at: new Date().toISOString() })
      .eq("id", parsed.data.taskId);

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, data: undefined };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi lưu trữ thẻ nhiệm vụ";
    return { ok: false, error: msg };
  }
}
