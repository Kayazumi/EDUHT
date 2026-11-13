// [BE] Server Action xác thực tài khoản · tài liệu mục 4.6
'use server';

import { createClient } from "@/server/supabase/server";
import { cookies } from "next/headers";
import { signInSchema, changePasswordSchema } from "@/shared/validation/auth";
import type { ActionResult } from "@/shared/utils/errors";
import { redirect } from "next/navigation";
import { routes } from "@/shared/config/routes";
import { serverEnv } from "@/server/env";

export async function signIn(input: unknown): Promise<ActionResult<{ role: string; mustChangePassword: boolean }>> {
  try {
    const parsed = signInSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.errors[0]?.message || "Dữ liệu không hợp lệ" };
    }

    const { username, password } = parsed.data;
    const cleanUsername = username.trim().toLowerCase();

    // 1. Hỗ trợ tài khoản Demo xem trước hệ thống
    const demoAccounts: Record<string, { role: string; validPass: string[] }> = {
      "admin@pbl.internal": { role: "admin", validPass: ["admin123", "123456", "admin"] },
      "gv.lan": { role: "teacher", validPass: ["123456", "teacher123", "gvlan123"] },
      "gv.lan@pbl.internal": { role: "teacher", validPass: ["123456", "teacher123", "gvlan123"] },
      teacher: { role: "teacher", validPass: ["123456", "teacher123"] },
      "hs.an01": { role: "student", validPass: ["123456", "student123"] },
      "hs.an01@pbl.internal": { role: "student", validPass: ["123456", "student123"] },
      student: { role: "student", validPass: ["123456", "student123"] },
    };

    const demo = process.env.NODE_ENV !== "production" ? demoAccounts[cleanUsername] : undefined;
    if (demo) {
      if (demo.validPass.includes(password)) {
        const cookieStore = await cookies();
        cookieStore.set("pbl_demo_role", demo.role, { path: "/", maxAge: 86400 });
        return {
          ok: true,
          data: { role: demo.role, mustChangePassword: false },
        };
      } else {
        return { ok: false, error: "Mật khẩu không chính xác cho tài khoản demo (thử: 123456 hoặc admin123)" };
      }
    }

    // 2. Kết nối Supabase Auth thật
    const email = cleanUsername.includes("@") ? cleanUsername : `${cleanUsername}@${serverEnv.STUDENT_EMAIL_DOMAIN}`;

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { ok: false, error: "Tên đăng nhập hoặc mật khẩu không chính xác" };
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role,must_change_password,is_active")
      .eq("id", data.user.id)
      .maybeSingle();
    if (profileError || !profile || !profile.is_active) {
      await supabase.auth.signOut();
      return { ok: false, error: "Tài khoản chưa được kích hoạt hoặc chưa có hồ sơ trong hệ thống" };
    }
    const role = profile.role;
    const mustChangePassword = profile.must_change_password;

    return {
      ok: true,
      data: { role, mustChangePassword },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Đăng nhập thất bại";
    return { ok: false, error: msg };
  }
}

export async function signOut(): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // Không cản trở redirect
  }
  try {
    const cookieStore = await cookies();
    cookieStore.delete("pbl_demo_role");
  } catch {
    // Không làm gián đoạn redirect
  }
  redirect(routes.auth.login);
}

export async function changePassword(input: unknown): Promise<ActionResult> {
  try {
    const parsed = changePasswordSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.errors[0]?.message || "Dữ liệu không hợp lệ" };
    }

    const supabase = await createClient();
    const { error: updateError } = await supabase.auth.updateUser({
      password: parsed.data.newPassword,
      data: { must_change_password: false },
    });

    if (updateError) {
      return { ok: false, error: updateError.message };
    }

    // Proxy đọc trạng thái đổi mật khẩu từ hồ sơ; báo lỗi nếu RPC không cập nhật được.
    const { error: profileError } = await supabase.rpc("mark_password_changed");
    if (profileError) {
      return { ok: false, error: `Đã đổi mật khẩu nhưng chưa cập nhật được trạng thái hồ sơ: ${profileError.message}` };
    }

    return { ok: true, data: undefined };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Đổi mật khẩu thất bại";
    return { ok: false, error: msg };
  }
}
