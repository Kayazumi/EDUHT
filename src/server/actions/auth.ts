// [BE] Server Action xác thực tài khoản · tài liệu mục 4.6
'use server';

import { createClient } from "@/server/supabase/server";
import {
  changePasswordSchema,
  recoveryCompleteSchema,
  recoveryRequestSchema,
  signInSchema,
  signupSchema,
  signupVerificationSchema,
} from "@/shared/validation/auth";
import type { ActionResult } from "@/shared/utils/errors";
import { redirect } from "next/navigation";
import { routes } from "@/shared/config/routes";
import { publicEnv } from "@/shared/config/public-env";
import { createAdminClient } from "@/server/supabase/admin";

export async function signIn(input: unknown): Promise<ActionResult<{ role: string; mustChangePassword: boolean }>> {
  try {
    const parsed = signInSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.errors[0]?.message || "Dữ liệu không hợp lệ" };
    }

    const { username, password } = parsed.data;
    let email = username;

    // Existing accounts use usernames while new registrations use real emails.
    // Resolve usernames on the server so auth.users emails never reach the client.
    if (!username.includes("@")) {
      const admin = createAdminClient();
      const { data: profile } = await admin.from("profiles").select("id").eq("username", username).maybeSingle();
      if (!profile) return { ok: false, error: "Tên đăng nhập/email hoặc mật khẩu không chính xác" };
      const { data: authUser, error: authUserError } = await admin.auth.admin.getUserById(profile.id);
      if (authUserError || !authUser.user?.email) {
        return { ok: false, error: "Tên đăng nhập/email hoặc mật khẩu không chính xác" };
      }
      email = authUser.user.email.toLowerCase();
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { ok: false, error: "Tên đăng nhập/email hoặc mật khẩu không chính xác" };
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
  redirect(routes.auth.login);
}

export async function registerAccount(input: unknown): Promise<ActionResult<{ email: string; role: "student" | "teacher" }>> {
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.errors[0]?.message ?? "Thông tin đăng ký không hợp lệ" };

  try {
    const { username, fullName, email, password, role } = parsed.data;
    const supabase = await createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, full_name: fullName, requested_role: role },
      },
    });

    if (error) {
      return { ok: false, error: "Không thể bắt đầu đăng ký. Hãy kiểm tra thông tin hoặc liên hệ quản trị viên." };
    }

    return { ok: true, data: { email, role } };
  } catch {
    return { ok: false, error: "Không thể kết nối để đăng ký. Vui lòng thử lại sau." };
  }
}

export async function verifySignupCode(input: unknown): Promise<ActionResult<{ role: "student" | "teacher"; pendingApproval: boolean }>> {
  const parsed = signupVerificationSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.errors[0]?.message ?? "Mã xác nhận không hợp lệ" };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({
    email: parsed.data.email,
    token: parsed.data.token,
    type: "signup",
  });
  if (error || !data.user) return { ok: false, error: "Mã xác nhận không đúng hoặc đã hết hạn." };

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role,is_active")
    .eq("id", data.user.id)
    .maybeSingle();
  if (profileError || !profile) {
    await supabase.auth.signOut();
    return { ok: false, error: "Không thể tải hồ sơ tài khoản. Vui lòng liên hệ quản trị viên." };
  }

  if (profile.role === "teacher" && !profile.is_active) {
    await supabase.auth.signOut();
    return { ok: true, data: { role: "teacher", pendingApproval: true } };
  }

  return {
    ok: true,
    data: { role: profile.role === "teacher" ? "teacher" : "student", pendingApproval: false },
  };
}

export async function requestPasswordReset(input: unknown): Promise<ActionResult<{ email: string }>> {
  const parsed = recoveryRequestSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.errors[0]?.message ?? "Email không hợp lệ" };

  try {
    const supabase = await createClient();
    await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${publicEnv.NEXT_PUBLIC_SITE_URL}/forgot-password`,
    });
  } catch {
    // Keep the response identical whether the email exists or the provider is unavailable.
  }

  // Keep the response identical whether the email exists, to avoid account enumeration.
  return { ok: true, data: { email: parsed.data.email } };
}

export async function completePasswordReset(input: unknown): Promise<ActionResult> {
  const parsed = recoveryCompleteSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.errors[0]?.message ?? "Dữ liệu khôi phục không hợp lệ" };

  try {
    const supabase = await createClient();
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: parsed.data.email,
      token: parsed.data.token,
      type: "recovery",
    });
    if (verifyError) return { ok: false, error: "Mã xác nhận không đúng hoặc đã hết hạn." };

    const { error: updateError } = await supabase.auth.updateUser({ password: parsed.data.newPassword });
    if (updateError) return { ok: false, error: updateError.message };
    await supabase.auth.signOut();
    return { ok: true, data: undefined };
  } catch {
    return { ok: false, error: "Không thể cập nhật mật khẩu. Vui lòng thử lại." };
  }
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
