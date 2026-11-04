// [FE] Tạo tài khoản giáo viên mới · tài liệu mục 3.3, 4.5 và A3.2
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NewUserPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Kiểm tra định dạng username
    const usernameRegex = /^[a-z0-9._-]{3,30}$/;
    if (!usernameRegex.test(username)) {
      setError("Tên đăng nhập phải gồm 3-30 ký tự thường, số, chấm (.), gạch dưới (_) hoặc gạch ngang (-).");
      return;
    }

    if (fullName.trim().length < 2) {
      setError("Họ và tên giáo viên phải có ít nhất 2 ký tự.");
      return;
    }

    setSubmitting(true);

    // Giả lập sinh mật khẩu ngẫu nhiên tạm thời (8 ký tự)
    setTimeout(() => {
      const generatedPass = "Pbl@" + Math.random().toString(36).substring(2, 8).toUpperCase();
      setTempPassword(generatedPass);
      setSubmitting(false);
    }, 400);
  };

  const handleCopy = () => {
    if (tempPassword) {
      navigator.clipboard.writeText(tempPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/admin/users" className="hover:underline">
              Quản lý người dùng
            </Link>
            <span>/</span>
            <span>Tạo mới</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Tạo tài khoản Giáo viên mới
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Tài khoản giáo viên có quyền quản lý lớp học, thiết lập dự án và chấm điểm
          </p>
        </div>
        <Link
          href="/admin/users"
          className="text-sm text-slate-600 hover:text-slate-900 font-medium"
        >
          ← Quay lại danh sách
        </Link>
      </div>

      {/* Hiển thị mật khẩu tạm khi tạo xong */}
      {tempPassword ? (
        <div className="bg-emerald-50 border-2 border-emerald-500/40 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🎉</span>
            <div>
              <h3 className="text-base font-bold text-emerald-900">
                Tài khoản giáo viên đã được tạo thành công!
              </h3>
              <p className="text-xs text-emerald-700 mt-1">
                Dưới đây là mật khẩu tạm thời. Hãy sao chép và gửi trực tiếp cho giáo viên.
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-emerald-200 space-y-2">
            <div className="text-xs text-slate-500">Tên đăng nhập:</div>
            <div className="font-mono font-bold text-slate-900 text-sm">@{username}</div>

            <div className="text-xs text-slate-500 mt-2">Mật khẩu tạm thời:</div>
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono font-extrabold text-lg text-indigo-700 tracking-wider bg-slate-50 px-3 py-1.5 rounded border border-slate-200">
                {tempPassword}
              </span>
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
              >
                {copied ? "Đã sao chép! ✓" : "Sao chép mật khẩu"}
              </button>
            </div>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg flex items-center gap-2">
            <span>⚠️</span>
            <span>
              <strong>Lưu ý quan trọng:</strong> Mật khẩu này chỉ hiển thị duy nhất một lần. Khi bạn rời khỏi hoặc làm mới trang này, mật khẩu sẽ bị hủy và chỉ có thể đặt lại (reset) tài khoản.
            </span>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => {
                setTempPassword(null);
                setUsername("");
                setFullName("");
                setEmail("");
              }}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-medium rounded-lg"
            >
              + Tiếp tục tạo giáo viên khác
            </button>
            <button
              onClick={() => router.push("/admin/users")}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg"
            >
              Về trang danh sách
            </button>
          </div>
        </div>
      ) : (
        /* Form nhập thông tin */
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Tên đăng nhập (Username) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-sm">@</span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  placeholder="gv.nguyenvanan"
                  className="w-full pl-8 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Quy ước: 3-30 ký tự thường, số, dấu chấm (.). Ví dụ: <code className="text-indigo-600 font-mono">gv.nguyenvanan</code>
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Họ và tên giáo viên <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn An"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Địa chỉ Email liên hệ (tùy chọn)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="an.nguyen@thpt.edu.vn"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Dùng để thông báo hoặc khôi phục quyền truy cập nếu cần thiết
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Vai trò hệ thống
              </label>
              <div className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium flex items-center justify-between">
                <span>Giáo viên (Teacher)</span>
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-semibold">
                  Cố định
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Tài khoản học sinh được nhập hàng loạt qua tệp CSV tại trang Nhập học sinh
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <Link
                href="/admin/users"
                className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-sm font-medium rounded-lg"
              >
                Hủy bỏ
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
              >
                {submitting ? "Đang xử lý..." : "Khởi tạo tài khoản"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
