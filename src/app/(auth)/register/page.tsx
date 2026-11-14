"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerAccount, verifySignupCode } from "@/server/actions/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [stage, setStage] = useState<"form" | "verify" | "done">("form");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token, setToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleRegister(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    const result = await registerAccount({ username, fullName, email, role, password, confirmPassword });
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setEmail(result.data.email);
    setRole(result.data.role);
    setStage("verify");
    setMessage("Nếu email hợp lệ và chưa được đăng ký, mã xác minh sẽ được gửi đến hộp thư.");
  }

  async function handleVerify(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const result = await verifySignupCode({ email, token });
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (result.data.pendingApproval) {
      setStage("done");
      setMessage("Email đã xác minh. Tài khoản giáo viên đang chờ admin duyệt; bạn sẽ đăng nhập được sau khi tài khoản được kích hoạt.");
      return;
    }
    router.push(result.data.role === "teacher" ? "/teacher" : "/student");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-lg bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 text-center">Tạo tài khoản EDUHT</h1>
        <p className="mt-2 mb-6 text-sm text-slate-500 text-center">Chỉ học sinh và giáo viên mới có thể tự đăng ký.</p>

        {error && <div role="alert" className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
        {message && <div role="status" className="mb-4 p-3 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-800 text-sm">{message}</div>}

        {stage === "form" && (
          <form onSubmit={handleRegister} className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Vai trò
              <select value={role} onChange={(e) => setRole(e.target.value as "student" | "teacher")} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg">
                <option value="student">Học sinh</option>
                <option value="teacher">Giáo viên (cần admin kích hoạt sau khi xác minh email)</option>
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Họ và tên
              <input required maxLength={100} value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Tên đăng nhập
              <input required minLength={3} maxLength={30} autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase())} placeholder="ten.dang.nhap" className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Gmail
              <input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ban@gmail.com" className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Mật khẩu
              <input required minLength={8} type={showPassword ? "text" : "password"} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Nhập lại mật khẩu
              <input required minLength={8} type={showPassword ? "text" : "password"} autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} />
              Hiện mật khẩu đã nhập
            </label>
            <button disabled={loading} className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2.5">
              {loading ? "Đang gửi..." : "Đăng ký và gửi mã xác minh"}
            </button>
          </form>
        )}

        {stage === "verify" && (
          <form onSubmit={handleVerify} className="space-y-4">
            <p className="text-sm text-slate-600">Nhập mã 6 chữ số gửi tới <strong>{email}</strong>.</p>
            <label className="block text-sm font-medium text-slate-700">
              Mã xác minh email (6–10 chữ số)
              <input required inputMode="numeric" pattern="[0-9]{6,10}" maxLength={10} autoComplete="one-time-code" value={token} onChange={(e) => setToken(e.target.value.replace(/\D/g, "").slice(0, 10))} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg tracking-widest" />
            </label>
            <button disabled={loading} className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2.5">
              {loading ? "Đang xác minh..." : "Xác minh email"}
            </button>
          </form>
        )}

        {stage === "done" && <button onClick={() => router.push("/login")} className="w-full rounded-lg bg-indigo-600 text-white py-2.5">Tới đăng nhập</button>}

        <p className="mt-5 text-center text-sm text-slate-600">Đã có tài khoản? <Link href="/login" className="text-indigo-600 hover:underline">Đăng nhập</Link></p>
      </div>
    </main>
  );
}