// [FE] Hồ sơ giáo viên, cập nhật thông tin và đổi mật khẩu
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { usePortalData } from "@/hooks/use-portal-data";
import { changePassword } from "@/server/actions/auth";
import { updatePersonalProfile } from "@/server/actions/users";

interface TeacherProfileData {
  profile: {
    id: string;
    username: string;
    full_name: string;
    role: string;
    staff_code: string | null;
    department: string | null;
    subject_area: string | null;
  };
  classes: Array<{
    id: string;
    name: string;
    school_year: string;
    grade: number;
  }>;
  projects: Array<{
    id: string;
    title: string;
    status: string;
  }>;
}

export default function TeacherProfilePage() {
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");
  const { data, isLoading, refresh } = usePortalData<TeacherProfileData>("teacherProfile");

  // Form cập nhật thông tin cá nhân
  const [customFullName, setCustomFullName] = useState<string | null>(null);
  const [customDepartment, setCustomDepartment] = useState<string | null>(null);
  const [customSubjectArea, setCustomSubjectArea] = useState<string | null>(null);
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
  const fullName = customFullName ?? (profile?.full_name || "");
  const department = customDepartment ?? (profile?.department || "Sư phạm Tin học");
  const subjectArea = customSubjectArea ?? (profile?.subject_area || "Tin học");

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);

    if (fullName.trim().length < 2) {
      setProfileError("Họ và tên phải có tối thiểu 2 ký tự.");
      return;
    }

    setUpdatingProfile(true);
    const result = await updatePersonalProfile({
      fullName: fullName.trim(),
      department: department.trim(),
      subjectArea: subjectArea.trim(),
    });
    setUpdatingProfile(false);

    if (!result.ok) {
      setProfileError(result.error);
      return;
    }

    setProfileSuccess("Cập nhật thông tin cá nhân thành công!");
    setCustomFullName(null);
    setCustomDepartment(null);
    setCustomSubjectArea(null);
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

    setPasswordSuccess("Đổi mật khẩu thành công! Vui lòng ghi nhớ mật khẩu mới của bạn.");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 font-title">
          Hồ sơ Giáo viên & Đổi mật khẩu
        </h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          Quản lý thông tin cá nhân, phân công giảng dạy và bảo mật tài khoản giáo viên.
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
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-slate-100">
                  Thông tin Giáo viên
                </h2>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  Bạn có thể chỉnh sửa họ tên và thông tin chuyên môn của mình.
                </p>
              </div>
              <Badge variant="info">Giáo viên phụ trách</Badge>
            </div>

            {profileSuccess && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs rounded-lg">
                {profileSuccess}
              </div>
            )}

            {profileError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-lg">
                {profileError}
              </div>
            )}

            {isLoading ? (
              <div className="py-6 text-sm text-gray-500">Đang tải thông tin hồ sơ...</div>
            ) : (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                      Họ và tên giáo viên <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setCustomFullName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                      Tên đăng nhập (Username)
                    </label>
                    <input
                      type="text"
                      disabled
                      value={profile?.username ? `@${profile.username}` : "—"}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-sm bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400 font-mono cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                      Mã cán bộ / giáo viên
                    </label>
                    <input
                      type="text"
                      disabled
                      value={profile?.staff_code || "GV01"}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-sm bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400 font-mono cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                      Tổ chuyên môn
                    </label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setCustomDepartment(e.target.value)}
                      placeholder="VD: Sư phạm Tin học"
                      className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                      Bộ môn giảng dạy
                    </label>
                    <input
                      type="text"
                      value={subjectArea}
                      onChange={(e) => setCustomSubjectArea(e.target.value)}
                      placeholder="VD: Tin học THPT"
                      className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={updatingProfile}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium text-xs rounded-lg shadow-sm cursor-pointer"
                  >
                    {updatingProfile ? "Đang lưu..." : "Lưu thay đổi hồ sơ"}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Danh sách lớp phụ trách */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-gray-900 dark:text-slate-100">
              Lớp học được phân công phụ trách
            </h2>
            {(data?.classes ?? []).length === 0 ? (
              <p className="text-xs text-gray-500">Chưa được phân công phụ trách lớp nào.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(data?.classes ?? []).map((cls) => (
                  <Link
                    key={cls.id}
                    href={`/teacher/classes/${cls.id}`}
                    className="p-4 border border-gray-100 dark:border-slate-800 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <span className="font-bold text-sm text-gray-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors">
                        Lớp {cls.name}
                      </span>
                      <div className="text-xs text-gray-500 mt-0.5">Khối {cls.grade} • Niên khóa {cls.school_year}</div>
                    </div>
                    <span className="text-xs text-blue-600 font-semibold group-hover:translate-x-1 transition-transform">Quản lý →</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Dự án PBL đang phụ trách */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-gray-900 dark:text-slate-100">
              Dự án PBL Tin học đang triển khai
            </h2>
            {(data?.projects ?? []).length === 0 ? (
              <p className="text-xs text-gray-500">Chưa có dự án nào.</p>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-slate-800">
                {(data?.projects ?? []).map((p) => (
                  <div key={p.id} className="py-3 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-sm text-gray-900 dark:text-slate-100">{p.title}</h3>
                      <span className="text-xs text-gray-500">Trạng thái dự án</span>
                    </div>
                    <Badge variant={p.status === "active" ? "success" : "default"}>
                      {p.status === "active" ? "Đang diễn ra" : p.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Change Password */}
      {activeTab === "password" && (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-5">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-slate-100">
              Đổi mật khẩu tài khoản Giáo viên
            </h2>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              Mật khẩu mới phải có tối thiểu 8 ký tự để bảo đảm an toàn dữ liệu học sinh và điểm số.
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
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submittingPassword}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg text-xs shadow-xs cursor-pointer"
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
