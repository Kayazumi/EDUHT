// [BE] Server Action quản lý dự án · tài liệu mục 4.6, 5.3 và 7.1
'use server';

import type { ActionResult } from "@/shared/utils/errors";
import { createClient } from "@/server/supabase/server";
import { z } from "zod";

const createProjectSchema = z
  .object({
    classId: z.string().uuid("Mã lớp không hợp lệ"),
    name: z.string().trim().min(3, "Tên dự án tối thiểu 3 ký tự").max(150),
    description: z.string().trim().optional(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày bắt đầu không hợp lệ (YYYY-MM-DD)"),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày kết thúc không hợp lệ (YYYY-MM-DD)"),
    minGroupSize: z.coerce.number().int().min(2, "Số thành viên tối thiểu >= 2").max(8),
    maxGroupSize: z.coerce.number().int().min(2).max(8, "Số thành viên tối đa <= 8"),
    weightA: z.coerce.number().min(0, "Trọng số a >= 0").max(1, "Trọng số a <= 1"),
    allowStudentCreateTasks: z.boolean().default(true),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "Ngày kết thúc không được trước ngày bắt đầu",
    path: ["endDate"],
  })
  .refine((data) => data.maxGroupSize >= data.minGroupSize, {
    message: "Số thành viên tối đa phải lớn hơn hoặc bằng số thành viên tối thiểu",
    path: ["maxGroupSize"],
  });

export async function createProject(input: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    const parsed = createProjectSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.errors[0]?.message || "Dữ liệu dự án không hợp lệ" };
    }

    const {
      classId,
      name,
      description,
      startDate,
      endDate,
      minGroupSize,
      maxGroupSize,
      weightA,
      allowStudentCreateTasks,
    } = parsed.data;

    const weightB = Number((1.0 - weightA).toFixed(2));
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("projects")
      .insert({
        class_id: classId,
        name,
        description: description || null,
        start_date: startDate,
        end_date: endDate,
        min_group_size: minGroupSize,
        max_group_size: maxGroupSize,
        weight_group: weightA,
        weight_peer: weightB,
        allow_student_create_tasks: allowStudentCreateTasks,
        status: "draft",
      })
      .select("id")
      .single();

    if (error || !data) {
      return { ok: false, error: error?.message || "Không thể tạo dự án" };
    }

    return { ok: true, data: { id: data.id } };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi tạo dự án";
    return { ok: false, error: msg };
  }
}

const updateProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(3).max(150),
  description: z.string().trim().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function updateProject(input: unknown): Promise<ActionResult> {
  try {
    const parsed = updateProjectSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "Dữ liệu cập nhật không hợp lệ" };
    }

    const { id, name, description, startDate, endDate } = parsed.data;
    const supabase = await createClient();

    const { error } = await supabase
      .from("projects")
      .update({
        name,
        description: description || null,
        start_date: startDate,
        end_date: endDate,
      })
      .eq("id", id)
      .eq("status", "draft");

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, data: undefined };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi cập nhật dự án";
    return { ok: false, error: msg };
  }
}

const projectIdSchema = z.object({
  projectId: z.string().uuid(),
});

export async function activateProject(input: unknown): Promise<ActionResult> {
  try {
    const parsed = projectIdSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "Mã dự án không hợp lệ" };
    }

    const supabase = await createClient();
    // Gọi RPC set_project_status (kiểm tra đầy đủ 5 điều kiện kích hoạt mục 7.1)
    const { error } = await supabase.rpc("set_project_status", {
      p_project_id: parsed.data.projectId,
      p_status: "active",
    });

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, data: undefined };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi kích hoạt dự án";
    return { ok: false, error: msg };
  }
}

export async function closeProject(input: unknown): Promise<ActionResult> {
  try {
    const parsed = projectIdSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "Mã dự án không hợp lệ" };
    }

    const supabase = await createClient();
    const { error } = await supabase.rpc("set_project_status", {
      p_project_id: parsed.data.projectId,
      p_status: "closed",
    });

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, data: undefined };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi đóng dự án";
    return { ok: false, error: msg };
  }
}

export async function deleteProject(input: unknown): Promise<ActionResult> {
  try {
    const parsed = projectIdSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "Mã dự án không hợp lệ" };
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", parsed.data.projectId)
      .eq("status", "draft");

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, data: undefined };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi xóa dự án";
    return { ok: false, error: msg };
  }
}
