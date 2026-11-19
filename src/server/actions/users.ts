// [BE] Server Action quản lý tài khoản người dùng · tài liệu mục 4.6 và 7.7
'use server';

import { randomInt } from "node:crypto";
import type { ActionResult } from "@/shared/utils/errors";
import { createAdminClient } from "@/server/supabase/admin";
import { requireAuthenticatedRole } from "@/server/auth/guards";
import { getProfile } from "@/server/auth/session";
import { serverEnv } from "@/server/env";
import {
  createTeacherSchema,
  createStudentSchema,
  studentCsvRowSchema,
} from "@/shared/validation/user";
import { parseStudentsExcel } from "@/server/csv/parse-students";
import { z } from "zod";
import type { Role } from "@/shared/config/roles";

import { DEFAULT_STUDENT_PASSWORD } from "@/shared/config/defaults";

function generateTempPassword(prefix: "Hs" | "Gv"): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let randomStr = "";
  for (let i = 0; i < 6; i++) {
    randomStr += chars.charAt(randomInt(chars.length));
  }
  return `${prefix}@${randomStr}!`;
}

function internalEmail(username: string): string {
  return `${username}@${serverEnv.STUDENT_EMAIL_DOMAIN}`;
}

async function syncUserRole(userId: string, role: Role, admin: ReturnType<typeof createAdminClient>) {
  const { error: authError } = await admin.auth.admin.updateUserById(userId, {
    app_metadata: { role, must_change_password: true },
    user_metadata: { role, must_change_password: true },
  });
  if (authError) return authError.message;
  const { error: profileError } = await admin.from("profiles").update({ role, must_change_password: true }).eq("id", userId);
  return profileError?.message ?? null;
}

export async function createTeacher(
  input: unknown
): Promise<ActionResult<{ id: string; tempPassword?: string }>> {
  try {
    await requireAuthenticatedRole("admin");
    const parsed = createTeacherSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.errors[0]?.message || "Dữ liệu không hợp lệ" };
    }

    const { username, full_name } = parsed.data;
    const admin = createAdminClient();
    const tempPassword = generateTempPassword("Gv");
    const email = internalEmail(username);

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
    const syncError = await syncUserRole(authUser.user.id, "teacher", admin);
    if (syncError) {
      await admin.auth.admin.deleteUser(authUser.user.id);
      return { ok: false, error: `Không thể thiết lập vai trò giáo viên: ${syncError}` };
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
): Promise<ActionResult<{ id: string; username: string; fullName: string; tempPassword?: string }>> {
  try {
    const actor = await getProfile();
    if (!actor || !actor.isActive || !["admin", "teacher"].includes(actor.role)) {
      return { ok: false, error: "Bạn không có quyền tạo tài khoản học sinh" };
    }

    const parsed = createStudentSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.errors[0]?.message || "Dữ liệu không hợp lệ" };
    }

    const { username, full_name, class_id, password } = parsed.data;
    const admin = createAdminClient();

    if (actor.role === "teacher") {
      const { data: ownedClass, error: classError } = await admin
        .from("classes")
        .select("id")
        .eq("id", class_id)
        .eq("teacher_id", actor.id)
        .is("archived_at", null)
        .maybeSingle();
      if (classError || !ownedClass) {
        return { ok: false, error: "Bạn không được phân công phụ trách lớp học này" };
      }
    }

    const tempPassword = password || DEFAULT_STUDENT_PASSWORD;
    const email = internalEmail(username);

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

    const syncError = await syncUserRole(authUser.user.id, "student", admin);
    if (syncError) {
      await admin.auth.admin.deleteUser(authUser.user.id);
      return { ok: false, error: `Không thể thiết lập hồ sơ học sinh: ${syncError}` };
    }

    // Ghi danh học sinh vào lớp học
    const { error: enrollError } = await admin.from("class_students").insert({
      class_id,
      student_id: authUser.user.id,
    });

    if (enrollError) {
      await admin.auth.admin.deleteUser(authUser.user.id);
      return { ok: false, error: "Đã tạo tài khoản nhưng lỗi ghi danh vào lớp: " + enrollError.message };
    }

    return {
      ok: true,
      data: { id: authUser.user.id, username, fullName: full_name, tempPassword },
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
): Promise<ActionResult<{ importedCount: number; defaultPassword: string; errors?: string[] }>> {
  try {
    const parsed = importStudentsBatchSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.errors[0]?.message || "Dữ liệu danh sách không hợp lệ" };
    }

    const actor = await getProfile();
    if (!actor || !actor.isActive || !["admin", "teacher"].includes(actor.role)) {
      return { ok: false, error: "Bạn không có quyền nhập học sinh" };
    }
    const admin = createAdminClient();
    if (actor.role === "teacher") {
      const { data: ownedClass, error: classError } = await admin
        .from("classes").select("id").eq("id", parsed.data.classId).eq("teacher_id", actor.id).is("archived_at", null).maybeSingle();
      if (classError || !ownedClass) return { ok: false, error: "Bạn không được phân công phụ trách lớp này" };
    }
    const { classId, students } = parsed.data;
    const errors: string[] = [];
    let successCount = 0;

    for (const student of students) {
      try {
        const tempPassword = DEFAULT_STUDENT_PASSWORD;
        const email = internalEmail(student.username);

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

        const roleError = await syncUserRole(authUser.user.id, "student", admin);
        if (roleError) {
          await admin.auth.admin.deleteUser(authUser.user.id);
          errors.push(`Học sinh @${student.username}: ${roleError}`);
          continue;
        }
        const { error: enrollError } = await admin.from("class_students").insert({
          class_id: classId,
          student_id: authUser.user.id,
        });

        if (enrollError) {
          await admin.auth.admin.deleteUser(authUser.user.id);
          errors.push(`Học sinh @${student.username}: ${enrollError.message}`);
          continue;
        }

        successCount++;
      } catch (e: unknown) {
        errors.push(`Học sinh @${student.username}: ${e instanceof Error ? e.message : "Lỗi không xác định"}`);
      }
    }

    return {
      ok: true,
      data: {
        importedCount: successCount,
        defaultPassword: DEFAULT_STUDENT_PASSWORD,
        errors: errors.length > 0 ? errors : undefined,
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi nhập danh sách học sinh";
    return { ok: false, error: msg };
  }
}

export async function resetStudentPassword(input: {
  studentId: string;
  classId: string;
}): Promise<ActionResult<{ defaultPassword: string }>> {
  try {
    const actor = await getProfile();
    if (!actor || !actor.isActive || !["admin", "teacher"].includes(actor.role)) {
      return { ok: false, error: "Bạn không có quyền đặt lại mật khẩu học sinh" };
    }
    const admin = createAdminClient();
    if (actor.role === "teacher") {
      const { data: ownedClass, error: classError } = await admin
        .from("classes")
        .select("id")
        .eq("id", input.classId)
        .eq("teacher_id", actor.id)
        .is("archived_at", null)
        .maybeSingle();
      if (classError || !ownedClass) {
        return { ok: false, error: "Bạn không được phân công phụ trách lớp học này" };
      }

      const { data: studentEnrollment } = await admin
        .from("class_students")
        .select("student_id")
        .eq("class_id", input.classId)
        .eq("student_id", input.studentId)
        .maybeSingle();
      if (!studentEnrollment) {
        return { ok: false, error: "Học sinh không thuộc lớp học này" };
      }
    }

    const { error: authError } = await admin.auth.admin.updateUserById(input.studentId, {
      password: DEFAULT_STUDENT_PASSWORD,
      app_metadata: { role: "student", must_change_password: true },
      user_metadata: { must_change_password: true },
    });
    if (authError) return { ok: false, error: authError.message };

    await admin.from("profiles").update({ must_change_password: true }).eq("id", input.studentId);
    return { ok: true, data: { defaultPassword: DEFAULT_STUDENT_PASSWORD } };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi đặt lại mật khẩu học sinh";
    return { ok: false, error: msg };
  }
}

export async function resetClassStudentsPassword(input: {
  classId: string;
}): Promise<ActionResult<{ resetCount: number; defaultPassword: string }>> {
  try {
    const actor = await getProfile();
    if (!actor || !actor.isActive || !["admin", "teacher"].includes(actor.role)) {
      return { ok: false, error: "Bạn không có quyền quản lý lớp học này" };
    }
    const admin = createAdminClient();
    if (actor.role === "teacher") {
      const { data: ownedClass, error: classError } = await admin
        .from("classes")
        .select("id")
        .eq("id", input.classId)
        .eq("teacher_id", actor.id)
        .is("archived_at", null)
        .maybeSingle();
      if (classError || !ownedClass) {
        return { ok: false, error: "Bạn không được phân công phụ trách lớp học này" };
      }
    }

    const { data: students, error: studentError } = await admin
      .from("class_students")
      .select("student_id")
      .eq("class_id", input.classId);
    if (studentError) return { ok: false, error: studentError.message };
    if (!students || students.length === 0) {
      return { ok: false, error: "Lớp học chưa có học sinh nào" };
    }

    let successCount = 0;
    for (const s of students) {
      const { error } = await admin.auth.admin.updateUserById(s.student_id, {
        password: DEFAULT_STUDENT_PASSWORD,
        app_metadata: { role: "student", must_change_password: true },
        user_metadata: { must_change_password: true },
      });
      if (!error) {
        await admin.from("profiles").update({ must_change_password: true }).eq("id", s.student_id);
        successCount++;
      }
    }

    return {
      ok: true,
      data: { resetCount: successCount, defaultPassword: DEFAULT_STUDENT_PASSWORD },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi đặt lại mật khẩu danh sách học sinh";
    return { ok: false, error: msg };
  }
}

export async function parseStudentFileAction(
  formData: FormData
): Promise<ActionResult<{ validRows: { username: string; full_name: string; class_name?: string }[]; errors: { rowNumber: number; reason: string }[] }>> {
  try {
    const file = formData.get("file") as File | null;
    if (!file) return { ok: false, error: "Vui lòng chọn tệp danh sách học sinh (Excel hoặc CSV)" };

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const result = parseStudentsExcel(buffer);
    return { ok: true, data: result };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi đọc tệp danh sách học sinh";
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
    await requireAuthenticatedRole("admin");
    const parsed = resetPasswordSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "Mã người dùng không hợp lệ" };
    }

    const admin = createAdminClient();
    const tempPassword = generateTempPassword("Hs");
    const { data: targetProfile, error: profileReadError } = await admin
      .from("profiles").select("role").eq("id", parsed.data.userId).maybeSingle();
    if (profileReadError || !targetProfile) return { ok: false, error: "Không tìm thấy tài khoản" };

    const { error } = await admin.auth.admin.updateUserById(parsed.data.userId, {
      password: tempPassword,
      app_metadata: { role: targetProfile.role, must_change_password: true },
      user_metadata: { must_change_password: true },
    });

    if (error) {
      return { ok: false, error: error.message };
    }

    // Cập nhật trạng thái must_change_password trên profiles
    const { error: profileError } = await admin
      .from("profiles")
      .update({ must_change_password: true })
      .eq("id", parsed.data.userId);
    if (profileError) return { ok: false, error: profileError.message };

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
    const actor = await requireAuthenticatedRole("admin");
    const parsed = setActiveSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "Dữ liệu trạng thái không hợp lệ" };
    }

    if (parsed.data.userId === actor.id) {
      return { ok: false, error: "Bạn không thể tự khóa hoặc mở khóa chính tài khoản của mình" };
    }

    const admin = createAdminClient();
    const { error } = await admin.rpc("admin_set_user_active", {
      p_actor_id: actor.id,
      p_target_id: parsed.data.userId,
      p_is_active: parsed.data.isActive,
    });

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
    const currentAdmin = await requireAuthenticatedRole("admin");
    const parsed = setRoleSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "Dữ liệu vai trò không hợp lệ" };
    }

    if (parsed.data.userId === currentAdmin.id) {
      return { ok: false, error: "Quản trị viên không thể tự thay đổi vai trò của chính mình" };
    }

    const admin = createAdminClient();
    const { error } = await admin.rpc("admin_update_user_role", {
      p_actor_id: currentAdmin.id,
      p_target_id: parsed.data.userId,
      p_new_role: parsed.data.role,
    });
    if (error) return { ok: false, error: error.message };

    return { ok: true, data: undefined };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi phân quyền vai trò";
    return { ok: false, error: msg };
  }
}
