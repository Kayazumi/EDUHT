// [FE] Hồ sơ quản trị viên, cập nhật thông tin cá nhân và đổi mật khẩu
"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { usePortalData } from "@/hooks/use-portal-data";
import { changePassword } from "@/server/actions/auth";
import { updatePersonalProfile } from "@/server/actions/users";

interface AdminProfileData {
  profile: {
    id: string;
    username: string;
    full_name: string;
    role: string;
    staff_code: string | null;
  };
}

export default function AdminProfilePage() {
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");
  const { data, isLoading, refresh } = usePortalData<AdminProfileData>("adminProfile");

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
  const fullName = customFullName ?? (profile?.full_name || "");

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);

    const trimmedName = fullName.trim();
    if (trimmedName.length < 2) {
      setProfileError("Họ và tên phải có tối thiểu 2 ký tự.");
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

    setProfileSuccess("Cập nhật thông tin quản trị viên thành công!");
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
          Hồ sơ Quản trị viên & Đổi mật khẩu
        </h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          Quản lý tài khoản quản trị hệ thống, cập nhật họ tên và đổi mật khẩu an toàn.
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
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-slate-100 font-title">
                  Thông tin cá nhân Quản trị viên
                </h2>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  Thông tin danh tính tài khoản quản trị viên cấp cao trong hệ thống EDUHT.
                </p>
              </div>
              <Badge variant="info">Quản trị viên</Badge>
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
              <div className="py-6 text-sm text-gray-500 dark:text-slate-400">Đang tải thông tin...</div>
            ) : (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">
                      Họ và tên Quản trị viên <span className="text-rose-500">*</span>
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
                      Mã cán bộ quản trị
                    </span>
                    <input
                      type="text"
                      disabled
                      value={profile?.staff_code || "AD01"}
                      className="w-full px-3 py-2 border border-purple-200 dark:border-purple-900/50 bg-purple-50/50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400 font-semibold rounded-lg text-xs font-mono cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <span className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">
                      Quyền hạn phân cấp
                    </span>
                    <input
                      type="text"
                      disabled
                      value="Toàn quyền hệ thống (Super Admin)"
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
        </div>
      )}

      {/* Tab 2: Change Password */}
      {activeTab === "password" && (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-5">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-slate-100 font-title">Đổi mật khẩu tài khoản</h2>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              Mật khẩu mới phải có tối thiểu 8 ký tự để đảm bảo an toàn tài khoản Quản trị.
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
