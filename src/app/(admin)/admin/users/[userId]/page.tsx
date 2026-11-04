// [FE] Chi tiết một tài khoản · tài liệu mục 3.3, 4.5 và A3.2
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const [resolvedUserId, setResolvedUserId] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(true);
  const [role, setRole] = useState<"admin" | "teacher" | "student">("teacher");
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [roleModalOpen, setRoleModalOpen] = useState<boolean>(false);
  const [selectedNewRole, setSelectedNewRole] = useState<"admin" | "teacher" | "student">("student");
  const [roleConfirmStep, setRoleConfirmStep] = useState<1 | 2>(1);

  React.useEffect(() => {
    params.then((p) => {
      setResolvedUserId(p.userId);
      // Giả lập trạng thái theo ID
      if (p.userId.includes("adm")) setRole("admin");
      else if (p.userId.includes("stu")) setRole("student");
      else setRole("teacher");
    });
  }, [params]);

  const user = {
    id: resolvedUserId || "u-tea-01",
    username: "gv.nguyenvana",
    fullName: "Nguyễn Văn An",
    email: "an.nguyen@thpt.edu.vn",
    role: role,
    classes: ["10A1", "10A2"],
    createdAt: "2026-09-02 08:30:00",
    lastSignIn: "13:40 - Hôm nay",
  };

  // 20 Dòng nhật ký kiểm toán liên quan
  const userAuditLogs = Array.from({ length: 20 }, (_, i) => ({
    id: `log-${i + 1}`,
    time: `2026-11-04 13:${40 - i}:12`,
    action: i % 3 === 0 ? "auth.sign_in" : i % 3 === 1 ? "task.update" : "score.evaluate",
    target: i % 2 === 0 ? "projects: P01-WEB" : "evaluation_rounds: R1",
    detail: i % 3 === 0 ? "Đăng nhập thành công từ IP 192.168.1.45" : "Cập nhật tiến trình nhóm 02",
  }));

  const handleResetPassword = () => {
    if (confirm(`Đặt lại mật khẩu cho tài khoản @${user.username}? Mật khẩu mới sẽ hiển thị duy nhất một lần.`)) {
      const generated = "Reset@" + Math.random().toString(36).substring(2, 8).toUpperCase();
      setTempPassword(generated);
    }
  };

  const handleCopy = () => {
    if (tempPassword) {
      navigator.clipboard.writeText(tempPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleToggleActive = () => {
    if (user.username === "admin") {
      alert("Không thể khóa tài khoản Quản trị viên hệ thống.");
      return;
    }
    const action = isActive ? "khóa" : "mở khóa";
    if (confirm(`Bạn có chắc chắn muốn ${action} tài khoản này?`)) {
      setIsActive(!isActive);
    }
  };

  const handleChangeRole = () => {
    if (role === "teacher" && user.classes.length > 0) {
      alert("Không thể đổi vai trò của giáo viên đang phụ trách lớp chưa lưu trữ (Ràng buộc RESTRICT A3.2). Vui lòng chuyển giao lớp trước.");
      setRoleModalOpen(false);
      return;
    }
    setRole(selectedNewRole);
    setRoleModalOpen(false);
    setRoleConfirmStep(1);
    alert(`Đã đổi vai trò sang ${selectedNewRole} thành công.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/admin/users" className="hover:underline">
              Quản lý người dùng
            </Link>
            <span>/</span>
            <span className="font-mono">@{user.username}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <span>Hồ sơ người dùng: {user.fullName}</span>
            {isActive ? (
              <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full font-semibold">
                Đang hoạt động
              </span>
            ) : (
              <span className="text-xs bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-full font-semibold">
                Đã bị khóa
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Mã định danh hệ thống (UUID): <code className="text-xs font-mono text-indigo-700">{user.id}</code>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetPassword}
            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            🔑 Đặt lại mật khẩu
          </button>
          <button
            onClick={() => {
              setRoleModalOpen(true);
              setRoleConfirmStep(1);
            }}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            Đổi vai trò
          </button>
          <button
            onClick={handleToggleActive}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg shadow-sm transition-colors ${
              isActive
                ? "bg-rose-600 hover:bg-rose-700 text-white"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            }`}
          >
            {isActive ? "Khóa tài khoản" : "Kích hoạt lại"}
          </button>
        </div>
      </div>

      {/* Hiển thị mật khẩu tạm nếu vừa reset */}
      {tempPassword && (
        <div className="bg-amber-50 border-2 border-amber-400 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <span>⚠️</span>
              <span>Mật khẩu tạm thời mới vừa được tạo</span>
            </div>
            <button
              onClick={() => setTempPassword(null)}
              className="text-xs text-amber-800 hover:underline font-medium"
            >
              Đóng thông báo ✕
            </button>
          </div>
          <div className="flex items-center justify-between bg-white p-3.5 rounded-lg border border-amber-200">
            <span className="font-mono text-xl font-extrabold text-indigo-700 tracking-wider">
              {tempPassword}
            </span>
            <button
              onClick={handleCopy}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-md shadow-sm"
            >
              {copied ? "Đã sao chép! ✓" : "Sao chép mật khẩu"}
            </button>
          </div>
          <p className="text-xs text-amber-800">
            Mật khẩu này chỉ xuất hiện một lần và tài khoản sẽ được gắn cờ bắt buộc đổi mật khẩu khi đăng nhập.
          </p>
        </div>
      )}

      {/* Chi tiết thông tin tài khoản */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
            Thông tin hồ sơ
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Tên đăng nhập:</span>
              <span className="font-mono font-bold text-slate-900">@{user.username}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Họ và tên:</span>
              <span className="font-medium text-slate-900">{user.fullName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Địa chỉ Email:</span>
              <span className="text-slate-700">{user.email}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Vai trò hiện tại:</span>
              <div>
                {user.role === "admin" && <Badge variant="danger">Quản trị viên</Badge>}
                {user.role === "teacher" && <Badge variant="info">Giáo viên</Badge>}
                {user.role === "student" && <Badge variant="default">Học sinh</Badge>}
              </div>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Lớp liên kết / Phụ trách:</span>
              <span className="font-semibold text-slate-800">{user.classes.join(", ")}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Ngày tạo tài khoản:</span>
              <span className="text-slate-600 font-mono text-xs">{user.createdAt}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Lần đăng nhập gần nhất:</span>
              <span className="text-emerald-700 font-medium">{user.lastSignIn}</span>
            </div>
          </div>
        </div>

        {/* Phân quyền và an toàn dữ liệu */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
            Ràng buộc bảo mật & Quyền hạn
          </h2>
          <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-800 block mb-1">
                Nguyên tắc bất biến RLS & Trigger:
              </span>
              Trigger <code className="font-mono text-indigo-700">guard_profile_update</code> chặn tự nâng quyền. Chỉ quản trị viên mới có thể thay đổi trạng thái hoặc vai trò của tài khoản này.
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-800 block mb-1">
                Hiệu lực khóa tài khoản:
              </span>
              Khi khóa tài khoản, trạng thái <code className="font-mono text-indigo-700">is_active = false</code> có hiệu lực ngay lập tức tại tầng RLS PostgreSQL và Server Actions, vô hiệu hóa mọi phiên truy cập.
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-800 block mb-1">
                Lớp học đang phụ trách:
              </span>
              Tài khoản này đang phụ trách 2 lớp học (10A1, 10A2). Muốn hạ vai trò hoặc xóa phụ trách, cần bàn giao các lớp học này cho giáo viên khác trước.
            </div>
          </div>
        </div>
      </div>

      {/* 20 Dòng nhật ký kiểm toán liên quan */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              20 Thao tác nhật ký kiểm toán liên quan
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Lịch sử các lần đăng nhập, thay đổi dữ liệu hoặc tác vụ của tài khoản này
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">actor_id: {user.id}</span>
        </div>
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 sticky top-0">
              <tr>
                <th className="py-2.5 px-4">Thời gian</th>
                <th className="py-2.5 px-4">Hành động</th>
                <th className="py-2.5 px-4">Đối tượng</th>
                <th className="py-2.5 px-4">Chi tiết thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {userAuditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-2 px-4 font-mono text-slate-500 whitespace-nowrap">
                    {log.time}
                  </td>
                  <td className="py-2 px-4">
                    <span className="font-mono bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-semibold text-[11px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2 px-4 font-mono text-slate-700 text-[11px]">
                    {log.target}
                  </td>
                  <td className="py-2 px-4 text-slate-600">
                    {log.detail}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal xác nhận đổi vai trò 2 bước */}
      {roleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              {roleConfirmStep === 1
                ? "Bước 1/2: Chọn vai trò mới"
                : "Bước 2/2: Xác nhận thay đổi quyền hạn quan trọng"}
            </h3>

            {roleConfirmStep === 1 ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">
                  Chọn vai trò mới bạn muốn gán cho tài khoản <strong>@{user.username}</strong>:
                </p>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                    <input
                      type="radio"
                      name="role"
                      value="teacher"
                      checked={selectedNewRole === "teacher"}
                      onChange={() => setSelectedNewRole("teacher")}
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Giáo viên (Teacher)</span>
                      <span className="text-[11px] text-slate-500">Quản lý lớp học, dự án, chấm điểm</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                    <input
                      type="radio"
                      name="role"
                      value="student"
                      checked={selectedNewRole === "student"}
                      onChange={() => setSelectedNewRole("student")}
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Học sinh (Student)</span>
                      <span className="text-[11px] text-slate-500">Tham gia làm dự án, đánh giá đồng đẳng</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                    <input
                      type="radio"
                      name="role"
                      value="admin"
                      checked={selectedNewRole === "admin"}
                      onChange={() => setSelectedNewRole("admin")}
                    />
                    <div>
                      <span className="text-xs font-bold text-rose-800 block">Quản trị viên (Admin)</span>
                      <span className="text-[11px] text-rose-600">Toàn quyền cấu hình và xuất dữ liệu nghiên cứu</span>
                    </div>
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs text-slate-600">
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg">
                  <strong>Cảnh báo phân quyền:</strong> Bạn đang chuyển vai trò từ{" "}
                  <strong>{user.role}</strong> sang <strong>{selectedNewRole}</strong>.
                  Người dùng sẽ nhận ngay các quyền hạn tương ứng của vai trò mới và mất đi các quyền cũ.
                </div>
                <p>
                  Bạn có chắc chắn muốn thực hiện thay đổi này không?
                </p>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setRoleModalOpen(false)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Hủy
              </button>
              {roleConfirmStep === 1 ? (
                <button
                  onClick={() => setRoleConfirmStep(2)}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg"
                >
                  Tiếp tục →
                </button>
              ) : (
                <button
                  onClick={handleChangeRole}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg"
                >
                  Xác nhận đổi vai trò
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
