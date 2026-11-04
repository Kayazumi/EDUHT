// [BE] Server Action xác thực tài khoản · tài liệu mục 4.6
'use server';

import { createClient } from "@/server/supabase/server";
import { cookies } from "next/headers";
import { signInSchema, changePasswordSchema } from "@/shared/validation/auth";
import type { ActionResult } from "@/shared/utils/errors";
import { redirect } from "next/navigation";
import { routes } from "@/shared/config/routes";

export async function signIn(input: unknown): Promise<ActionResult<{ role: string; mustChangePassword: boolean }>> {
  try {
    const parsed = signInSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.errors[0]?.message || "Dữ liệu không hợp lệ" };
    }

    const { username, password } = parsed.data;
    const email = username.includes("@") ? username : `${username}@pbl.internal`;

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { ok: false, error: "Tên đăng nhập hoặc mật khẩu không chính xác" };
    }

    const role = (data.user.app_metadata?.role as string) || "student";
    const mustChangePassword = !!data.user.app_metadata?.must_change_password;

    return {
      ok: true,
      data: { role, mustChangePassword },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Đăng nhập thất bại";
    return { ok: false, error: msg };
  }
}

export async function signOut(): Promise<ActionResult> {
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

    // Đánh dấu must_change_password = false trên bảng profiles qua RPC
    await supabase.rpc("mark_password_changed");

    return { ok: true, data: undefined };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Đổi mật khẩu thất bại";
    return { ok: false, error: msg };
  }
}
