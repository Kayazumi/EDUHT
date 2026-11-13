// [FE] Trang đăng nhập · tài liệu mục A3.1 và 4.5
"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "@/server/actions/auth";

export default function LoginPage() {
  const demoModeEnabled = process.env.NODE_ENV !== "production";
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await signIn({ username, password });
      if (!res.ok) {
        setError(res.error);
        setLoading(false);
        return;
      }

      if (res.data?.mustChangePassword) {
        router.push("/change-password");
        return;
      }

      const nextUrl = searchParams.get("next");
      if (nextUrl) {
        router.push(nextUrl);
      } else {
        router.push(`/${res.data?.role || "student"}`);
      }
    } catch {
      setError("Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.");
      setLoading(false);
    }
  };

  const handleQuickDemo = (role: "admin" | "teacher" | "student") => {
    document.cookie = `pbl_demo_role=${role}; path=/; max-age=86400`;
    router.push(`/${role}`);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-md bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Đăng nhập</h1>
          <p className="text-sm text-slate-500">
            Hệ thống quản lý tiến trình và đánh giá đồng đẳng PBL môn Tin học
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tên đăng nhập
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="hs.an01 hoặc gv.lan hoặc admin"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Mật khẩu
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium text-sm rounded-lg transition-colors shadow-sm"
          >
            {loading ? "Đang xử lý..." : "Đăng nhập"}
          </button>
        </form>

        {demoModeEnabled && <>
        {/* Hướng dẫn tài khoản demo chỉ dùng trong môi trường phát triển */}
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
          <p className="font-semibold mb-1.5 flex items-center gap-1.5">
            <span>🔑</span> <span>Tài khoản mẫu dùng thử:</span>
          </p>
          <div className="space-y-1 font-mono text-[11px]">
            <div 
              onClick={() => { setUsername("admin"); setPassword("admin123"); }}
              className="flex justify-between items-center p-1 rounded hover:bg-amber-100 cursor-pointer transition-colors"
              title="Bấm để điền nhanh"
            >
              <span>🛡️ Admin: <strong>admin</strong></span>
              <span className="text-amber-700">Pass: <strong>admin123</strong> (điền ↗)</span>
            </div>
            <div 
              onClick={() => { setUsername("gv.lan"); setPassword("123456"); }}
              className="flex justify-between items-center p-1 rounded hover:bg-amber-100 cursor-pointer transition-colors"
              title="Bấm để điền nhanh"
            >
              <span>👨‍🏫 GV: <strong>gv.lan</strong></span>
              <span className="text-amber-700">Pass: <strong>123456</strong> (điền ↗)</span>
            </div>
            <div 
              onClick={() => { setUsername("hs.an01"); setPassword("123456"); }}
              className="flex justify-between items-center p-1 rounded hover:bg-amber-100 cursor-pointer transition-colors"
              title="Bấm để điền nhanh"
            >
              <span>🎓 HS: <strong>hs.an01</strong></span>
              <span className="text-amber-700">Pass: <strong>123456</strong> (điền ↗)</span>
            </div>
          </div>
        </div>

        {/* Khối xem thử nhanh theo vai trò */}
        <div className="mt-6 pt-6 border-t border-slate-200 space-y-3">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              ⚡ Xem trước giao diện theo vai trò
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Chọn vai trò để vào thẳng trải nghiệm ngay:
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo("admin")}
              className="w-full py-2 px-3 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg flex items-center justify-between transition-colors"
            >
              <span className="flex items-center gap-2">
                <span>🛡️</span> <strong>Quản trị viên (Admin)</strong>
              </span>
              <span className="text-slate-400 font-mono text-[11px]">/admin →</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo("teacher")}
              className="w-full py-2 px-3 text-xs font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg flex items-center justify-between transition-colors"
            >
              <span className="flex items-center gap-2">
                <span>👨‍🏫</span> <strong>Giáo viên (Teacher)</strong>
              </span>
              <span className="text-blue-500 font-mono text-[11px]">/teacher →</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo("student")}
              className="w-full py-2 px-3 text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg flex items-center justify-between transition-colors"
            >
              <span className="flex items-center gap-2">
                <span>🎓</span> <strong>Học sinh (Student)</strong>
              </span>
              <span className="text-emerald-500 font-mono text-[11px]">/student →</span>
            </button>
          </div>
        </div>
        </>}
      </div>
    </main>
  );
}
