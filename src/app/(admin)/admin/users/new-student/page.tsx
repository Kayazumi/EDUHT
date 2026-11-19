// [FE] Tạo tài khoản học sinh đơn lẻ cho Quản trị viên
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PortalDataState } from "@/components/ui/portal-data-state";
import { usePortalData } from "@/hooks/use-portal-data";
import { createStudent } from "@/server/actions/users";
import { DEFAULT_STUDENT_PASSWORD } from "@/shared/config/defaults";

interface AdminClassesData {
  classes: Array<{
    id: string;
    name: string;
    grade: number;
    school_year: string;
  }>;
}

export default function NewStudentPage() {
  const { data, isLoading } = usePortalData<AdminClassesData>("adminClasses");

  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [classId, setClassId] = useState("");
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const classes = data?.classes ?? [];
  const effectiveClassId = classId || (classes[0]?.id ?? "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUsername = username.trim().toLowerCase();
    const cleanFullName = fullName.trim();

    if (!cleanUsername) {
      setError("Vui lòng nhập tên đăng nhập / mã học sinh.");
      return;
    }

    const usernameRegex = /^[a-z0-9._-]{3,30}$/;
    if (!usernameRegex.test(cleanUsername)) {
      setError("Tên đăng nhập học sinh phải gồm 3-30 ký tự thường, số, chấm (.), gạch dưới (_) hoặc gạch ngang (-).");
      return;
    }

    if (cleanFullName.length < 2) {
      setError("Họ và tên học sinh phải có tối thiểu 2 ký tự.");
      return;
    }

    if (!effectiveClassId) {
      setError("Vui lòng chọn lớp học cho học sinh.");
      return;
    }

    setSubmitting(true);

    try {
      const result = await createStudent({
        username: cleanUsername,
        full_name: cleanFullName,
        class_id: effectiveClassId,
      });
      setSubmitting(false);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setTempPassword(result.data.tempPassword || DEFAULT_STUDENT_PASSWORD);
    } catch (err) {
      setSubmitting(false);
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra khi tạo tài khoản học sinh");
    }
  };

  const handleCopy = () => {
    if (tempPassword) {
      navigator.clipboard.writeText(tempPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleResetForm = () => {
    setUsername("");
    setFullName("");
    setTempPassword(null);
    setError(null);
  };

  if (isLoading) return <PortalDataState label="danh sách lớp học" />;

  const selectedClass = classes.find((c) => c.id === effectiveClassId);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <Link href="/admin/users" className="hover:underline">
              Quản lý tài khoản
            </Link>
            <span>/</span>
            <span>Thêm 1 học sinh</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-title">
            Tạo tài khoản Học sinh mới
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Tạo thủ công tài khoản cho 1 học sinh và ghi danh vào lớp học tương ứng.
          </p>
        </div>
        <Link
          href="/admin/users"
          className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 font-medium"
        >
          ← Quay lại danh sách
        </Link>
      </div>

      {/* Thông báo thành công */}
      {tempPassword ? (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500/40 dark:border-emerald-600/40 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🎉</span>
            <div>
              <h3 className="text-base font-bold text-emerald-900 dark:text-emerald-200 font-title">
                Tài khoản học sinh đã được tạo thành công!
              </h3>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                Học sinh đã được kích hoạt và tự động ghi danh vào lớp <strong>{selectedClass?.name || "10C4"}</strong>.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-emerald-200 dark:border-emerald-800 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400">Họ và tên:</span>
                <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{fullName}</div>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Tên đăng nhập:</span>
                <div className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">@{username.toLowerCase()}</div>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Lớp học:</span>
                <div className="font-semibold text-blue-600 dark:text-blue-400">Lớp {selectedClass?.name} ({selectedClass?.school_year})</div>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Mật khẩu mặc định:</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono font-bold text-sm text-indigo-700 dark:text-indigo-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700">
                    {tempPassword}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold rounded shadow-2xs transition-colors cursor-pointer"
                  >
                    {copied ? "Đã chép! ✓" : "Sao chép"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleResetForm}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              + Tạo thêm học sinh khác
            </button>
            <Link
              href="/admin/users"
              className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 text-xs font-semibold rounded-lg transition-colors"
            >
              Quay lại danh sách tài khoản
            </Link>
          </div>
        </div>
      ) : (
        /* Form tạo học sinh */
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5"
        >
          {error && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-4 text-xs">
            {/* Họ và tên */}
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Họ và tên học sinh <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="VD: Nguyễn Văn An"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Tên đăng nhập / Mã học sinh */}
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Tên đăng nhập / Mã học sinh <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono">@</span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  placeholder="spt61"
                  className="w-full pl-7 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Viết liền không dấu, từ 3-30 ký tự (chữ thường, số, dấu chấm hoặc gạch dưới).
              </p>
            </div>

            {/* Chọn lớp học */}
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Lớp học ghi danh <span className="text-rose-500">*</span>
              </label>
              <select
                aria-label="Chọn lớp học ghi danh"
                value={effectiveClassId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    Lớp {cls.name} (Khối {cls.grade} • Năm học {cls.school_year})
                  </option>
                ))}
              </select>
            </div>

            {/* Ghi chú mật khẩu */}
            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 rounded-lg text-blue-900 dark:text-blue-300 space-y-1">
              <span className="font-semibold block">Mật khẩu khởi tạo tự động:</span>
              <p className="text-[11px]">
                Mật khẩu ban đầu mặc định của học sinh là <strong className="font-mono font-bold text-blue-700 dark:text-blue-400">{DEFAULT_STUDENT_PASSWORD}</strong>.
              </p>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Link
              href="/admin/users"
              className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Hủy
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              {submitting ? "Đang tạo..." : "Tạo tài khoản học sinh"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

