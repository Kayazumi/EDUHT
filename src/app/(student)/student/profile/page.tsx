// [FE] Hồ sơ, đổi mật khẩu · tài liệu mục 3.3, 4.5 và A3.4
"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";

export default function StudentProfilePage() {
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");

  // Profile state
  const [profile] = useState({
    fullName: "Nguyễn Văn An",
    username: "hs.an01",
    className: "12A1",
    schoolYear: "2025-2026",
    role: "Học sinh",
    consentGiven: true,
    consentDate: "05/09/2026",
    consentFormVersion: "v1.0",
  });

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [projectHistory] = useState([
    {
      id: "p01",
      name: "Dự án Tin học 12: Xây dựng Hệ thống Trợ lý AI và Chatbot",
      group: "Nhóm 01",
      role: "Trưởng nhóm",
      status: "Đang diễn ra",
    },
    {
      id: "p00",
      name: "Dự án Tin học 11: Thiết kế Cơ sở dữ liệu Quản lý Thư viện trường học",
      group: "Nhóm 03",
      role: "Thành viên",
      status: "Đã hoàn thành",
    },
  ]);

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword.length < 8) {
      setPasswordError("Mật khẩu mới phải có ít nhất 8 ký tự.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Xác nhận mật khẩu mới không khớp.");
      return;
    }

    // Success
    setPasswordSuccess("Đổi mật khẩu thành công! Vui lòng ghi nhớ mật khẩu mới của bạn.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Hồ sơ cá nhân & Đổi mật khẩu</h1>
        <p className="text-sm text-gray-500">
          Xem thông tin tài khoản học sinh, trạng thái đồng ý tham gia nghiên cứu và quản lý mật khẩu đăng nhập.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("profile")}
          className={`py-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "profile"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          Thông tin cá nhân
        </button>
        <button
          onClick={() => setActiveTab("password")}
          className={`py-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "password"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          Đổi mật khẩu
        </button>
      </div>

      {/* Tab 1: Profile */}
      {activeTab === "profile" && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-gray-900">Thông tin học sinh</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <span className="text-xs text-gray-500">Họ và tên</span>
                <div className="font-semibold text-gray-900">{profile.fullName}</div>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-gray-500">Tên đăng nhập (Username)</span>
                <div className="font-mono text-gray-700">@{profile.username}</div>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-gray-500">Lớp học</span>
                <div className="font-semibold text-gray-900">{profile.className}</div>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-gray-500">Niên khóa</span>
                <div className="text-gray-700">{profile.schoolYear}</div>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-gray-500">Vai trò trong hệ thống</span>
                <div>
                  <Badge variant="default">{profile.role}</Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Khối Đạo đức nghiên cứu & Đồng ý */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900">Tình trạng đồng ý nghiên cứu (Research Consent)</h2>
              {profile.consentGiven ? (
                <Badge variant="success">Đã ghi nhận đồng ý</Badge>
              ) : (
                <Badge variant="warning">Chưa ghi nhận</Badge>
              )}
            </div>

            <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-900 space-y-2 leading-relaxed">
              <p className="font-semibold">Bảo vệ quyền riêng tư & Đạo đức nghiên cứu giáo dục:</p>
              <p>
                Dữ liệu học tập và đánh giá đồng đẳng trong dự án được xử lý và ẩn danh hóa nhằm phục vụ nghiên cứu nâng cao hiệu quả phương pháp dạy học dự án môn Tin học THPT.
              </p>
              <div className="text-blue-700 text-[11px] pt-1">
                Biểu mẫu: <strong>{profile.consentFormVersion}</strong> · Ngày xác nhận: <strong>{profile.consentDate}</strong>
              </div>
            </div>
          </div>

          {/* Lịch sử dự án */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-gray-900">Lịch sử dự án tham gia</h2>
            <div className="divide-y divide-gray-100">
              {projectHistory.map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-sm text-gray-900">{p.name}</h3>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {p.group} • Vai trò: <span className="font-medium text-gray-700">{p.role}</span>
                    </div>
                  </div>
                  <Badge variant={p.status === "Đang diễn ra" ? "info" : "default"}>
                    {p.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Change Password */}
      {activeTab === "password" && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-5">
          <div>
            <h2 className="text-base font-bold text-gray-900">Đổi mật khẩu tài khoản</h2>
            <p className="text-xs text-gray-500">Mật khẩu mới phải có tối thiểu 8 ký tự để đảm bảo an toàn.</p>
          </div>

          {passwordSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-xs text-green-800">
              {passwordSuccess}
            </div>
          )}

          {passwordError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800">
              {passwordError}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md text-sm">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Mật khẩu hiện tại</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Mật khẩu mới (tối thiểu 8 ký tự)</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-xs shadow-xs"
              >
                Cập nhật mật khẩu
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
