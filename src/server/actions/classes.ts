// [BE] Server Action quản lý lớp học · tài liệu mục 4.6 và 5.3
'use server';

import type { ActionResult } from "@/shared/utils/errors";
import { createClient } from "@/server/supabase/server";
import { z } from "zod";
import { schoolYearSchema } from "@/shared/validation/user";

const createClassSchema = z.object({
  name: z.string().trim().min(1, "Tên lớp không được để trống").max(30),
  grade: z.coerce.number().int().refine((g) => [10, 11, 12].includes(g), "Khối phải là 10, 11 hoặc 12"),
  schoolYear: schoolYearSchema,
  teacherId: z.string().uuid("Mã giáo viên không hợp lệ"),
});

export async function createClass(input: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    const parsed = createClassSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.errors[0]?.message || "Dữ liệu lớp học không hợp lệ" };
    }

    const { name, grade, schoolYear, teacherId } = parsed.data;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("classes")
      .insert({
        name,
        grade,
        school_year: schoolYear,
        teacher_id: teacherId,
      })
      .select("id")
      .single();

    if (error || !data) {
      return { ok: false, error: error?.message || "Không thể tạo lớp học" };
    }

    return { ok: true, data: { id: data.id } };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi tạo lớp học";
    return { ok: false, error: msg };
  }
}

const assignTeacherSchema = z.object({
  classId: z.string().uuid("Mã lớp không hợp lệ"),
  teacherId: z.string().uuid("Mã giáo viên không hợp lệ"),
});

export async function assignTeacher(input: unknown): Promise<ActionResult> {
  try {
    const parsed = assignTeacherSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "Dữ liệu phân công không hợp lệ" };
    }

    const { classId, teacherId } = parsed.data;
    const supabase = await createClient();

    const { error } = await supabase
      .from("classes")
      .update({ teacher_id: teacherId })
      .eq("id", classId);

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, data: undefined };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi phân công giáo viên";
    return { ok: false, error: msg };
  }
}

const enrollStudentsSchema = z.object({
  classId: z.string().uuid("Mã lớp không hợp lệ"),
  studentIds: z.array(z.string().uuid()).min(1, "Cần chọn ít nhất một học sinh"),
});

export async function enrollStudents(input: unknown): Promise<ActionResult<{ count: number }>> {
  try {
    const parsed = enrollStudentsSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "Dữ liệu ghi danh không hợp lệ" };
    }

    const { classId, studentIds } = parsed.data;
    const supabase = await createClient();

    const rows = studentIds.map((studentId) => ({
      class_id: classId,
      student_id: studentId,
    }));

    const { error } = await supabase
      .from("class_students")
      .upsert(rows, { onConflict: "class_id,student_id" });

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, data: { count: rows.length } };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi ghi danh học sinh";
    return { ok: false, error: msg };
  }
}

const removeStudentSchema = z.object({
  classId: z.string().uuid(),
  studentId: z.string().uuid(),
});

export async function removeStudent(input: unknown): Promise<ActionResult> {
  try {
    const parsed = removeStudentSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "Dữ liệu không hợp lệ" };
    }

    const { classId, studentId } = parsed.data;
    const supabase = await createClient();

    const { error } = await supabase
      .from("class_students")
      .delete()
      .eq("class_id", classId)
      .eq("student_id", studentId);

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, data: undefined };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi xóa học sinh khỏi lớp";
    return { ok: false, error: msg };
  }
}

const archiveClassSchema = z.object({
  classId: z.string().uuid(),
});

export async function archiveClass(input: unknown): Promise<ActionResult> {
  try {
    const parsed = archiveClassSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "Mã lớp không hợp lệ" };
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("classes")
      .update({ archived_at: new Date().toISOString() })
      .eq("id", parsed.data.classId);

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, data: undefined };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi lưu trữ lớp học";
    return { ok: false, error: msg };
  }
}
