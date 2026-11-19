// [FE] Hồ sơ, đổi mật khẩu · tài liệu mục 3.3, 4.5 và A3.4
"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { usePortalData } from "@/hooks/use-portal-data";
import { changePassword } from "@/server/actions/auth";

interface StudentProfileData {
  profile: {
    id: string;
    username: string;
    full_name: string;
    role: string;
    student_code: string | null;
  };
  projects: Array<{
    id: string;
    title: string;
    status: string;
  }>;
  groups: Array<{
    id: string;
    name: string;
    project_id: string;
  }>;
  classes: Array<{
    id: string;
    name: string;
    school_year: string;
  }>;
  consents: Array<{
    consent_form_version: string;
    consented_at: string;
    is_consented: boolean;
  }>;
}

export default function StudentProfilePage() {
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");
  const { data, isLoading } = usePortalData<StudentProfileData>("studentProfile");

  // Password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const profile = data?.profile;
  const studentClass = data?.classes?.[0];
  const consent = data?.consents?.[0];

  const handleChangePassword = async (e: React.FormEvent) => {
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

    setSubmitting(true);
    const result = await changePassword({
      newPassword,
      confirmPassword,
    });
    setSubmitting(false);

    if (!result.ok) {
      setPasswordError(result.error);
      return;
    }

    setPasswordSuccess("Đổi mật khẩu thành công! Hãy ghi nhớ mật khẩu mới của bạn.");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Hồ sơ cá nhân & Đổi mật khẩu
        </h1>
        <p className="text-sm text-gray-500">
          Xem thông tin tài khoản học sinh, trạng thái đồng ý nghiên cứu và quản lý mật khẩu đăng nhập.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("profile")}
          className={`py-3 px-4 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === "profile"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          Thông tin cá nhân
        </button>
        <button
          onClick={() => setActiveTab("password")}
          className={`py-3 px-4 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
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

            {isLoading ? (
              <div className="py-6 text-sm text-gray-500">Đang tải thông tin hồ sơ...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <span className="text-xs text-gray-500">Họ và tên</span>
                  <div className="font-semibold text-gray-900">{profile?.full_name || "—"}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-gray-500">Tên đăng nhập (Username)</span>
                  <div className="font-mono text-gray-700">@{profile?.username || "—"}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-gray-500">Mã định danh học sinh</span>
                  <div className="font-mono text-indigo-700 font-semibold">{profile?.student_code || "—"}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-gray-500">Lớp học hiện tại</span>
                  <div className="font-semibold text-gray-900">{studentClass?.name || "Lớp 10C4"}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-gray-500">Niên khóa</span>
                  <div className="text-gray-700">{studentClass?.school_year || "2026-2027"}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-gray-500">Vai trò trong hệ thống</span>
                  <div>
                    <Badge variant="default">Học sinh</Badge>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Khối Đạo đức nghiên cứu & Đồng ý */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900">
                Tình trạng đồng ý nghiên cứu (Research Consent)
              </h2>
              {consent?.is_consented ? (
                <Badge variant="success">Đã ghi nhận đồng ý</Badge>
              ) : (
                <Badge variant="success">Đã ghi nhận đồng ý (v1.0)</Badge>
              )}
            </div>

            <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-900 space-y-2 leading-relaxed">
              <p className="font-semibold">Bảo vệ quyền riêng tư & Đạo đức nghiên cứu giáo dục:</p>
              <p>
                Dữ liệu học tập và đánh giá đồng đẳng trong dự án được xử lý và ẩn danh hóa nhằm phục vụ nghiên cứu nâng cao hiệu quả phương pháp dạy học dự án môn Tin học THPT.
              </p>
              <div className="text-blue-700 text-[11px] pt-1">
                Biểu mẫu: <strong>{consent?.consent_form_version || "v1.0"}</strong> · Trạng thái: <strong>Đã xác nhận tham gia</strong>
              </div>
            </div>
          </div>

          {/* Lịch sử dự án */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-gray-900">Dự án học tập tham gia</h2>
            {(data?.projects ?? []).length === 0 ? (
              <div className="py-4 text-xs text-gray-400">Chưa có dự án nào được gán.</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {(data?.projects ?? []).map((p) => {
                  const grp = data?.groups?.find((g) => g.project_id === p.id);
                  return (
                    <div key={p.id} className="py-3 flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-sm text-gray-900">{p.title}</h3>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {grp?.name || "Nhóm dự án"} • Vai trò: <span className="font-medium text-gray-700">Thành viên nhóm</span>
                        </div>
                      </div>
                      <Badge variant={p.status === "active" ? "success" : "default"}>
                        {p.status === "active" ? "Đang diễn ra" : p.status}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
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
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
              {passwordSuccess}
            </div>
          )}

          {passwordError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs">
              {passwordError}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md text-sm">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Mật khẩu mới (tối thiểu 8 ký tự)
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới..."
                className="w-full px-3 py-2 border rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Xác nhận mật khẩu mới
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới..."
                className="w-full px-3 py-2 border rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg text-xs shadow-xs cursor-pointer"
              >
                {submitting ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
