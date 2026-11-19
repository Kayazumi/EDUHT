// [FE] Lớp của tôi, quản lý học sinh và tài khoản · tài liệu mục 3.3, 4.5 và A3.3
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { PortalDataState } from "@/components/ui/portal-data-state";
import { usePortalData } from "@/hooks/use-portal-data";
import {
  createStudent,
  resetStudentPassword,
  resetClassStudentsPassword,
} from "@/server/actions/users";
import { DEFAULT_STUDENT_PASSWORD } from "@/shared/config/defaults";

type DataRow = Record<string, unknown>;

interface TeacherClassData {
  class: DataRow | null;
  students: DataRow[];
  projects: DataRow[];
}

function readString(row: DataRow | null | undefined, key: string, fallback = "") {
  const value = row?.[key];
  return typeof value === "string" ? value : fallback;
}

function readNumber(row: DataRow | null | undefined, key: string, fallback = 0) {
  const value = row?.[key];
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export default function TeacherClassDetailPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const [resolvedClassId, setResolvedClassId] = useState("");
  const { data, error, isLoading, refresh } = usePortalData<TeacherClassData>(
    "teacherClass",
    resolvedClassId
  );

  // State cho Modal tạo thủ công 1 học sinh
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newStudentFullName, setNewStudentFullName] = useState("");
  const [newStudentUsername, setNewStudentUsername] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createdStudentInfo, setCreatedStudentInfo] = useState<{
    username: string;
    fullName: string;
    password: string;
  } | null>(null);

  // State cho Modal đặt lại mật khẩu cả lớp
  const [showResetAllModal, setShowResetAllModal] = useState(false);
  const [isResettingAll, setIsResettingAll] = useState(false);
  const [resetAllMessage, setResetAllMessage] = useState<string | null>(null);

  // State cho thông báo đặt lại mật khẩu 1 học sinh
  const [singleResetSuccess, setSingleResetSuccess] = useState<{
    username: string;
    fullName: string;
  } | null>(null);
  const [isResettingSingle, setIsResettingSingle] = useState<string | null>(null);

  // State tìm kiếm học sinh trong lớp
  const [studentSearchTerm, setStudentSearchTerm] = useState("");

  React.useEffect(() => {
    params.then((p) => setResolvedClassId(p.classId));
  }, [params]);

  if (!resolvedClassId || isLoading) return <PortalDataState label="lớp học và học sinh" />;
  if (error) return <PortalDataState label="lớp học và học sinh" error={error} onRetry={refresh} />;
  if (!data) return <PortalDataState label="lớp học và học sinh" error="Không tìm thấy thông tin lớp học." onRetry={refresh} />;

  const className = readString(data.class, "name", "Lớp học");
  const classGrade = readNumber(data.class, "grade", 10);
  const schoolYear = readString(data.class, "school_year", "2026-2027");
  const students = data.students ?? [];
  const projects = data.projects ?? [];

  const filteredStudents = students.filter((s) => {
    const q = studentSearchTerm.toLowerCase().trim();
    if (!q) return true;
    const fullName = readString(s, "full_name").toLowerCase();
    const username = readString(s, "username").toLowerCase();
    const studentCode = readString(s, "student_code").toLowerCase();
    return fullName.includes(q) || username.includes(q) || studentCode.includes(q);
  });

  // Xử lý tạo thủ công 1 học sinh
  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    if (newStudentFullName.trim().length < 2) {
      setCreateError("Họ và tên học sinh phải có tối thiểu 2 ký tự.");
      return;
    }

    if (!newStudentUsername.trim()) {
      setCreateError("Vui lòng nhập mã học sinh / tên đăng nhập.");
      return;
    }

    setIsCreating(true);
    const result = await createStudent({
      class_id: resolvedClassId,
      full_name: newStudentFullName.trim(),
      username: newStudentUsername.trim().toLowerCase(),
    });
    setIsCreating(false);

    if (!result.ok) {
      setCreateError(result.error);
      return;
    }

    setCreatedStudentInfo({
      username: result.data.username,
      fullName: result.data.fullName,
      password: result.data.tempPassword || DEFAULT_STUDENT_PASSWORD,
    });
    setNewStudentFullName("");
    setNewStudentUsername("");
    refresh();
  };

  // Xử lý đặt lại mật khẩu 1 học sinh về Abc_1111
  const handleResetSinglePassword = async (studentId: string, studentUsername: string, studentFullName: string) => {
    if (
      !confirm(
        `Bạn có chắc chắn muốn đặt lại mật khẩu của học sinh "${studentFullName}" (@${studentUsername}) về mật khẩu mặc định "${DEFAULT_STUDENT_PASSWORD}"?`
      )
    ) {
      return;
    }

    setIsResettingSingle(studentId);
    const result = await resetStudentPassword({
      studentId,
      classId: resolvedClassId,
    });
    setIsResettingSingle(null);

    if (!result.ok) {
      alert(`Lỗi đặt lại mật khẩu: ${result.error}`);
      return;
    }

    setSingleResetSuccess({
      username: studentUsername,
      fullName: studentFullName,
    });
  };

  // Xử lý đặt lại mật khẩu cả lớp về Abc_1111
  const handleConfirmResetAll = async () => {
    setIsResettingAll(true);
    setResetAllMessage(null);

    const result = await resetClassStudentsPassword({
      classId: resolvedClassId,
    });
    setIsResettingAll(false);

    if (!result.ok) {
      alert(`Lỗi: ${result.error}`);
      return;
    }

    setShowResetAllModal(false);
    setResetAllMessage(`Đã đặt lại mật khẩu cho toàn bộ ${result.data.resetCount} học sinh về "${result.data.defaultPassword}".`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/teacher" className="hover:underline">
              Bàn làm việc
            </Link>
            <span>/</span>
            <span>Lớp phụ trách</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <span>Lớp {className}</span>
            <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full font-semibold border border-blue-100">
              Khối {classGrade} • Năm học {schoolYear}
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Quản lý tài khoản học sinh, cấp mật khẩu ban đầu và thiết lập lại mật khẩu mặc định ({DEFAULT_STUDENT_PASSWORD})
          </p>
        </div>

        {/* Nút hành động chính */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setCreateError(null);
              setShowCreateModal(true);
            }}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <span>+</span> <span>Thêm 1 học sinh</span>
          </button>

          <Link
            href={`/teacher/classes/${resolvedClassId}/students/import`}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <span>📥</span> <span>Nhập từ Excel / CSV</span>
          </Link>

          <button
            type="button"
            onClick={() => setShowResetAllModal(true)}
            disabled={students.length === 0}
            className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <span>🔄</span> <span>Đặt lại mật khẩu cả lớp</span>
          </button>
        </div>
      </div>

      {/* Thông báo kết quả đặt lại cả lớp */}
      {resetAllMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">✓</span>
            <span>{resetAllMessage}</span>
          </div>
          <button onClick={() => setResetAllMessage(null)} className="text-emerald-700 hover:underline">
            Đóng ✕
          </button>
        </div>
      )}

      {/* Thông báo đặt lại lẻ thành công */}
      {singleResetSuccess && (
        <div className="p-4 bg-blue-50 border border-blue-200 text-blue-900 text-xs rounded-xl flex items-center justify-between">
          <div>
            Đã đặt lại mật khẩu của học sinh <strong>{singleResetSuccess.fullName}</strong> (@{singleResetSuccess.username}) về mặc định:{" "}
            <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-blue-300 text-blue-700">
              {DEFAULT_STUDENT_PASSWORD}
            </span>
          </div>
          <button onClick={() => setSingleResetSuccess(null)} className="text-blue-700 hover:underline">
            Đóng ✕
          </button>
        </div>
      )}

      {/* Khối Dự án PBL của lớp */}
      {projects.length > 0 && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
            Dự án PBL của lớp {className} ({projects.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {projects.map((proj) => (
              <Link
                key={readString(proj, "id")}
                href={`/teacher/projects/${readString(proj, "id")}`}
                className="p-3 border border-slate-200 rounded-lg hover:border-blue-400 transition-colors flex flex-col justify-between gap-2"
              >
                <div>
                  <span className="font-semibold text-xs text-slate-900 block line-clamp-1">
                    {readString(proj, "title", "Dự án")}
                  </span>
                  <span className="text-[11px] text-emerald-600 font-medium">
                    {readString(proj, "status") === "active" ? "Đang diễn ra" : "Bản nháp"}
                  </span>
                </div>
                <span className="text-xs text-blue-600 font-semibold self-end">Xem chi tiết →</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Bảng danh sách học sinh */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-title">
              Danh sách học sinh lớp {className} ({students.length})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Mật khẩu khởi tạo mặc định cho học sinh: <span className="font-mono font-bold text-blue-600">{DEFAULT_STUDENT_PASSWORD}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Ô tìm kiếm học sinh */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={studentSearchTerm}
                onChange={(e) => setStudentSearchTerm(e.target.value)}
                placeholder="🔍 Tìm theo tên, mã HS..."
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
              />
              {studentSearchTerm && (
                <button
                  type="button"
                  onClick={() => setStudentSearchTerm("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0 hidden sm:inline">
              Hiển thị: <strong>{filteredStudents.length}</strong> / {students.length} em
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4 w-12 text-center">STT</th>
                <th className="py-3 px-4">Mã học sinh</th>
                <th className="py-3 px-4">Họ và tên</th>
                <th className="py-3 px-4">Trạng thái tài khoản</th>
                <th className="py-3 px-4 text-right">Thao tác mật khẩu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 dark:text-slate-400">
                    Lớp chưa có học sinh nào. Bạn có thể bấm <strong>“+ Thêm 1 học sinh”</strong> hoặc{" "}
                    <strong>“Nhập từ Excel / CSV”</strong> để tạo tài khoản.
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 dark:text-slate-400">
                    Không tìm thấy học sinh nào khớp với từ khóa &quot;{studentSearchTerm}&quot;.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => {
                  const sId = readString(student, "id");
                  const sUsername = readString(student, "username");
                  const sFullName = readString(student, "full_name");
                  const isActive = student.is_active !== false;

                  return (
                    <tr key={sId} className="hover:bg-slate-50">
                      <td className="py-3 px-4 text-center font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">@{sUsername}</td>
                      <td className="py-3 px-4 font-medium text-slate-800">{sFullName}</td>
                      <td className="py-3 px-4">
                        <Badge variant={isActive ? "success" : "danger"}>
                          {isActive ? "Hoạt động" : "Bị khóa"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          disabled={isResettingSingle === sId}
                          onClick={() => handleResetSinglePassword(sId, sUsername, sFullName)}
                          className="px-2.5 py-1 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors disabled:opacity-50"
                          title="Đặt lại mật khẩu của học sinh này về Abc_1111"
                        >
                          {isResettingSingle === sId ? "Đang xử lý..." : "🔑 Đặt lại về Abc_1111"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: TẠO THỦ CÔNG 1 HỌC SINH */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div
            role="dialog"
            aria-modal="true"
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-slate-900">Thêm học sinh mới vào lớp {className}</h3>
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setCreatedStudentInfo(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {createError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl" role="alert">
                {createError}
              </div>
            )}

            {createdStudentInfo ? (
              <div className="space-y-4 py-2">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-xs text-emerald-950">
                  <div className="font-bold text-sm text-emerald-800 flex items-center gap-1.5">
                    <span>✓</span> Tạo tài khoản học sinh thành công!
                  </div>
                  <div>Học sinh: <strong>{createdStudentInfo.fullName}</strong></div>
                  <div>Mã đăng nhập: <strong className="font-mono text-slate-900">@{createdStudentInfo.username}</strong></div>
                  <div>
                    Mật khẩu mặc định:{" "}
                    <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-emerald-300 text-emerald-700">
                      {createdStudentInfo.password}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `Tài khoản: @${createdStudentInfo.username}\nMật khẩu: ${createdStudentInfo.password}\nĐăng nhập tại hệ thống EDUHT.`
                      );
                      alert("Đã sao chép thông tin tài khoản!");
                    }}
                    className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                  >
                    Sao chép thông tin
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCreatedStudentInfo(null);
                    }}
                    className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                  >
                    + Thêm tiếp học sinh khác
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateStudent} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Họ và tên học sinh <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newStudentFullName}
                    onChange={(e) => setNewStudentFullName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Văn An"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mã học sinh / Tên đăng nhập <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newStudentUsername}
                    onChange={(e) => setNewStudentUsername(e.target.value)}
                    placeholder="Ví dụ: hs.240101 hoặc an.nv"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Gồm 3–30 ký tự, không chứa dấu cách hoặc ký tự đặc biệt.</p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 space-y-1">
                  <div>Lớp ghi danh: <strong>{className}</strong> (Khối {classGrade})</div>
                  <div>
                    Mật khẩu mặc định: <strong className="font-mono text-blue-600">{DEFAULT_STUDENT_PASSWORD}</strong>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Học sinh sẽ đăng nhập bằng tài khoản này và đổi mật khẩu ở lần đăng nhập đầu tiên.
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
                  >
                    {isCreating ? "Đang tạo..." : "Khởi tạo tài khoản"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: ĐẶT LẠI MẬT KHẨU CẢ LỚP */}
      {showResetAllModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div
            role="dialog"
            aria-modal="true"
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150"
          >
            <h3 className="font-bold text-base text-slate-900">
              Xác nhận đặt lại mật khẩu cho cả lớp {className}
            </h3>

            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-2">
              <div className="font-bold flex items-center gap-1.5">
                <span>⚠️</span> Thao tác áp dụng cho toàn bộ {students.length} học sinh
              </div>
              <div>
                Tất cả học sinh trong lớp sẽ được đặt lại mật khẩu về mặc định:{" "}
                <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-amber-300 text-amber-800">
                  {DEFAULT_STUDENT_PASSWORD}
                </span>
                .
              </div>
              <div>Khi đăng nhập lại, học sinh sẽ được yêu cầu đổi mật khẩu mới.</div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isResettingAll}
                onClick={() => setShowResetAllModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={isResettingAll}
                onClick={handleConfirmResetAll}
                className="px-5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
              >
                {isResettingAll ? "Đang xử lý..." : "Xác nhận đặt lại cả lớp"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
