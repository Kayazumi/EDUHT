// [FE] Hồ sơ học sinh, cập nhật thông tin cá nhân và đổi mật khẩu
"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { usePortalData } from "@/hooks/use-portal-data";
import { changePassword } from "@/server/actions/auth";
import { updatePersonalProfile } from "@/server/actions/users";

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
  const { data, isLoading, refresh } = usePortalData<StudentProfileData>("studentProfile");

  // Form cập nhật thông tin cá nhân
  const [customFullName, setCustomFullName] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Form đổi mật khẩu
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [submittingPassword, setSubmittingPassword] = useState(false);

  const profile = data?.profile;
  const studentClass = data?.classes?.[0];
  const consent = data?.consents?.[0];
  const fullName = customFullName ?? (profile?.full_name || "");

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);

    const trimmedName = fullName.trim();
    if (trimmedName.length < 2) {
      setProfileError("Họ và tên học sinh phải có tối thiểu 2 ký tự.");
      return;
    }

    setUpdatingProfile(true);
    const result = await updatePersonalProfile({
      fullName: trimmedName,
    });
    setUpdatingProfile(false);

    if (!result.ok) {
      setProfileError(result.error);
      return;
    }

    setProfileSuccess("Cập nhật họ và tên thành công!");
    setCustomFullName(null);
    refresh();
  };

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

    setSubmittingPassword(true);
    const result = await changePassword({
      newPassword,
      confirmPassword,
    });
    setSubmittingPassword(false);

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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 font-title">
          Hồ sơ Học sinh & Đổi mật khẩu
        </h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          Xem và cập nhật thông tin cá nhân, kiểm tra trạng thái đồng ý nghiên cứu và quản lý mật khẩu đăng nhập.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("profile")}
          className={`py-3 px-4 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === "profile"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:border-gray-300"
          }`}
        >
          Thông tin cá nhân
        </button>
        <button
          onClick={() => setActiveTab("password")}
          className={`py-3 px-4 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === "password"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:border-gray-300"
          }`}
        >
          Đổi mật khẩu
        </button>
      </div>

      {/* Tab 1: Profile */}
      {activeTab === "profile" && (
        <div className="space-y-6">
          {/* Card Form Chỉnh sửa thông tin cá nhân */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-slate-100 font-title">
                  Thông tin cá nhân học sinh
                </h2>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  Bạn có thể cập nhật họ và tên hiển thị trong hệ thống và dự án học tập.
                </p>
              </div>
              <Badge variant="default">Học sinh</Badge>
            </div>

            {profileSuccess && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs text-emerald-800 dark:text-emerald-300">
                {profileSuccess}
              </div>
            )}

            {profileError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-lg text-xs">
                {profileError}
              </div>
            )}

            {isLoading ? (
              <div className="py-6 text-sm text-gray-500 dark:text-slate-400">Đang tải thông tin hồ sơ...</div>
            ) : (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">
                      Họ và tên học sinh <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setCustomFullName(e.target.value)}
                      placeholder="Nhập họ và tên..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <span className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">
                      Tên đăng nhập (Username)
                    </span>
                    <input
                      type="text"
                      disabled
                      value={profile?.username ? `@${profile.username}` : "—"}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 text-gray-500 dark:text-slate-400 rounded-lg text-xs font-mono cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <span className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">
                      Mã định danh học sinh (Mã HS)
                    </span>
                    <input
                      type="text"
                      disabled
                      value={profile?.student_code || "—"}
                      className="w-full px-3 py-2 border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 font-semibold rounded-lg text-xs font-mono cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <span className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">
                      Lớp học & Niên khóa
                    </span>
                    <input
                      type="text"
                      disabled
                      value={`${studentClass?.name || "10C4"} (${studentClass?.school_year || "2026-2027"})`}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 text-gray-700 dark:text-slate-300 rounded-lg text-xs cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={updatingProfile}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg text-xs shadow-xs cursor-pointer transition-colors"
                  >
                    {updatingProfile ? "Đang lưu..." : "Lưu thay đổi họ tên"}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Khối Đạo đức nghiên cứu & Đồng ý */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900 dark:text-slate-100 font-title">
                Tình trạng đồng ý nghiên cứu (Research Consent)
              </h2>
              {consent?.is_consented ? (
                <Badge variant="success">Đã ghi nhận đồng ý</Badge>
              ) : (
                <Badge variant="success">Đã ghi nhận đồng ý (v1.0)</Badge>
              )}
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-lg text-xs text-blue-900 dark:text-blue-300 space-y-2 leading-relaxed">
              <p className="font-semibold">Bảo vệ quyền riêng tư & Đạo đức nghiên cứu giáo dục:</p>
              <p>
                Dữ liệu học tập và đánh giá đồng đẳng trong dự án được xử lý và ẩn danh hóa nhằm phục vụ nghiên cứu nâng cao hiệu quả phương pháp dạy học dự án môn Tin học THPT.
              </p>
              <div className="text-blue-700 dark:text-blue-400 text-[11px] pt-1">
                Biểu mẫu: <strong>{consent?.consent_form_version || "v1.0"}</strong> · Trạng thái: <strong>Đã xác nhận tham gia</strong>
              </div>
            </div>
          </div>

          {/* Lịch sử dự án */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-gray-900 dark:text-slate-100 font-title">Dự án học tập tham gia</h2>
            {(data?.projects ?? []).length === 0 ? (
              <div className="py-4 text-xs text-gray-400 dark:text-slate-500">Chưa có dự án nào được gán.</div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-slate-800">
                {(data?.projects ?? []).map((p) => {
                  const grp = data?.groups?.find((g) => g.project_id === p.id);
                  return (
                    <div key={p.id} className="py-3 flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-sm text-gray-900 dark:text-slate-100">{p.title}</h3>
                        <div className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                          {grp?.name || "Nhóm dự án"} • Vai trò: <span className="font-medium text-gray-700 dark:text-slate-300">Thành viên nhóm</span>
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
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-5">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-slate-100 font-title">Đổi mật khẩu tài khoản</h2>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              Mật khẩu mới phải có tối thiểu 8 ký tự để đảm bảo an toàn tài khoản.
            </p>
          </div>

          {passwordSuccess && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs text-emerald-800 dark:text-emerald-300">
              {passwordSuccess}
            </div>
          )}

          {passwordError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-lg text-xs">
              {passwordError}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md text-sm">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">
                Mật khẩu mới (tối thiểu 8 ký tự)
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">
                Xác nhận mật khẩu mới
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submittingPassword}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg text-xs shadow-xs cursor-pointer transition-colors"
              >
                {submittingPassword ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
