"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { completePasswordReset, requestPasswordReset } from "@/server/actions/auth";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSendCode(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const result = await requestPasswordReset({ email });
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setEmail(result.data.email);
    setCodeSent(true);
    setMessage("Nếu email này gắn với tài khoản, mã khôi phục sẽ được gửi đến hộp thư.");
  }

  async function handleReset(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const result = await completePasswordReset({ email, token, newPassword, confirmPassword });
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push("/login?reset=success");
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-md bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 text-center">Khôi phục mật khẩu</h1>
        <p className="mt-2 mb-6 text-sm text-slate-500 text-center">Nhập email đã xác minh để nhận mã dùng một lần.</p>

        {error && <div role="alert" className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
        {message && <div role="status" className="mb-4 p-3 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-800 text-sm">{message}</div>}

        {!codeSent ? (
          <form onSubmit={handleSendCode} className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Email
              <input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg" placeholder="ban@gmail.com" />
            </label>
            <button disabled={loading} className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2.5">
              {loading ? "Đang gửi..." : "Gửi mã khôi phục"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Mã xác minh (6–10 chữ số)
              <input required inputMode="numeric" pattern="[0-9]{6,10}" maxLength={10} autoComplete="one-time-code" value={token} onChange={(e) => setToken(e.target.value.replace(/\D/g, "").slice(0, 10))} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg tracking-widest" />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Mật khẩu mới
              <input required minLength={8} type={showPassword ? "text" : "password"} autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Nhập lại mật khẩu mới
              <input required minLength={8} type={showPassword ? "text" : "password"} autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} />
              Hiện mật khẩu đã nhập
            </label>
            <button disabled={loading} className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2.5">
              {loading ? "Đang cập nhật..." : "Xác minh mã và đổi mật khẩu"}
            </button>
            <button type="button" onClick={handleSendCode} disabled={loading} className="w-full text-sm text-indigo-600 hover:underline">Gửi lại mã</button>
          </form>
        )}

        <p className="mt-5 text-center text-sm text-slate-600"><Link href="/login" className="text-indigo-600 hover:underline">Quay lại đăng nhập</Link></p>
      </div>
    </main>
  );
}