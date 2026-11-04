// [BE] Server Action quản lý tài khoản người dùng · tài liệu mục 4.6 và 7.7
'use server';

import type { ActionResult } from "@/shared/utils/errors";
import { createAdminClient } from "@/server/supabase/admin";
import { requireRole } from "@/server/auth/guards";
import {
  createTeacherSchema,
  createStudentSchema,
  studentCsvRowSchema,
} from "@/shared/validation/user";
import { z } from "zod";
import type { Role } from "@/shared/config/roles";

function generateTempPassword(prefix: "Hs" | "Gv"): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let randomStr = "";
  for (let i = 0; i < 6; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}@${randomStr}!`;
}

export async function createTeacher(
  input: unknown
): Promise<ActionResult<{ id: string; tempPassword?: string }>> {
  try {
    await requireRole("admin");
    const parsed = createTeacherSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.errors[0]?.message || "Dữ liệu không hợp lệ" };
    }

    const { username, full_name } = parsed.data;
    const admin = createAdminClient();
    const tempPassword = generateTempPassword("Gv");
    const email = `${username}@pbl.internal`;

    const { data: authUser, error: authError } = await admin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        role: "teacher",
        username,
        full_name,
        must_change_password: true,
      },
    });

    if (authError || !authUser.user) {
      return { ok: false, error: authError?.message || "Không thể tạo tài khoản giáo viên" };
    }

    return {
      ok: true,
      data: { id: authUser.user.id, tempPassword },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi tạo giáo viên";
    return { ok: false, error: msg };
  }
}

export async function createStudent(
  input: unknown
): Promise<ActionResult<{ id: string; tempPassword?: string }>> {
  try {
    const parsed = createStudentSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.errors[0]?.message || "Dữ liệu không hợp lệ" };
    }

    const { username, full_name, class_id } = parsed.data;
    const admin = createAdminClient();
    const tempPassword = generateTempPassword("Hs");
    const email = `${username}@pbl.internal`;

    const { data: authUser, error: authError } = await admin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        role: "student",
        username,
        full_name,
        must_change_password: true,
      },
    });

    if (authError || !authUser.user) {
      return { ok: false, error: authError?.message || "Không thể tạo tài khoản học sinh" };
    }

    // Ghi danh học sinh vào lớp học
    const { error: enrollError } = await admin.from("class_students").insert({
      class_id,
      student_id: authUser.user.id,
    });

    if (enrollError) {
      return { ok: false, error: "Đã tạo tài khoản nhưng lỗi ghi danh vào lớp: " + enrollError.message };
    }

    return {
      ok: true,
      data: { id: authUser.user.id, tempPassword },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi tạo học sinh";
    return { ok: false, error: msg };
  }
}

const importStudentsBatchSchema = z.object({
  classId: z.string().uuid("Mã lớp không hợp lệ"),
  students: z.array(studentCsvRowSchema).max(200, "Tối đa 200 học sinh mỗi lần nhập"),
});

export async function importStudents(
  input: unknown
): Promise<ActionResult<{ importedCount: number; errors?: string[] }>> {
  try {
    const parsed = importStudentsBatchSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.errors[0]?.message || "Dữ liệu danh sách không hợp lệ" };
    }

    const { classId, students } = parsed.data;
    const admin = createAdminClient();
    const errors: string[] = [];
    let successCount = 0;

    for (const student of students) {
      try {
        const tempPassword = generateTempPassword("Hs");
        const email = `${student.username}@pbl.internal`;

        const { data: authUser, error: authError } = await admin.auth.admin.createUser({
          email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            role: "student",
            username: student.username,
            full_name: student.full_name,
            must_change_password: true,
          },
        });

        if (authError || !authUser.user) {
          errors.push(`Học sinh @${student.username}: ${authError?.message || "Lỗi tạo tài khoản"}`);
          continue;
        }

        await admin.from("class_students").insert({
          class_id: classId,
          student_id: authUser.user.id,
        });

        successCount++;
      } catch (e: unknown) {
        errors.push(`Học sinh @${student.username}: ${e instanceof Error ? e.message : "Lỗi không xác định"}`);
      }
    }

    return {
      ok: true,
      data: { importedCount: successCount, errors: errors.length > 0 ? errors : undefined },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi nhập danh sách học sinh";
    return { ok: false, error: msg };
  }
}

const resetPasswordSchema = z.object({
  userId: z.string().uuid(),
});

export async function resetPassword(
  input: unknown
): Promise<ActionResult<{ tempPassword: string }>> {
  try {
    const parsed = resetPasswordSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "Mã người dùng không hợp lệ" };
    }

    const admin = createAdminClient();
    const tempPassword = generateTempPassword("Hs");

    const { error } = await admin.auth.admin.updateUserById(parsed.data.userId, {
      password: tempPassword,
      user_metadata: { must_change_password: true },
    });

    if (error) {
      return { ok: false, error: error.message };
    }

    // Cập nhật trạng thái must_change_password trên profiles
    await admin
      .from("profiles")
      .update({ must_change_password: true })
      .eq("id", parsed.data.userId);

    return { ok: true, data: { tempPassword } };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi đặt lại mật khẩu";
    return { ok: false, error: msg };
  }
}

const setActiveSchema = z.object({
  userId: z.string().uuid(),
  isActive: z.boolean(),
});

export async function setActive(input: unknown): Promise<ActionResult> {
  try {
    await requireRole("admin");
    const parsed = setActiveSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "Dữ liệu trạng thái không hợp lệ" };
    }

    const admin = createAdminClient();
    const { error } = await admin
      .from("profiles")
      .update({ is_active: parsed.data.isActive })
      .eq("id", parsed.data.userId);

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, data: undefined };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi cập nhật trạng thái";
    return { ok: false, error: msg };
  }
}

const setRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["admin", "teacher", "student"] as [Role, ...Role[]]),
});

export async function setRole(input: unknown): Promise<ActionResult> {
  try {
    const currentAdmin = await requireRole("admin");
    const parsed = setRoleSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "Dữ liệu vai trò không hợp lệ" };
    }

    if (parsed.data.userId === currentAdmin.id) {
      return { ok: false, error: "Quản trị viên không thể tự thay đổi vai trò của chính mình" };
    }

    const admin = createAdminClient();
    const { error } = await admin
      .from("profiles")
      .update({ role: parsed.data.role })
      .eq("id", parsed.data.userId);

    if (error) {
      return { ok: false, error: error.message };
    }

    await admin.auth.admin.updateUserById(parsed.data.userId, {
      user_metadata: { role: parsed.data.role },
    });

    return { ok: true, data: undefined };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi phân quyền vai trò";
    return { ok: false, error: msg };
  }
}
