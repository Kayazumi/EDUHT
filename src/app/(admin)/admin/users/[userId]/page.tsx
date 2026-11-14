"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loadPortalData } from "@/server/actions/portal-data";
import { resetPassword, setActive, setRole } from "@/server/actions/users";
import type { Role } from "@/shared/config/roles";

type Row = Record<string, unknown>;
interface UserDetailsData {
  profile: Row | null;
  memberships: Row[];
  classes: Row[];
  currentUserId: string;
}
const text = (row: Row, key: string) => typeof row[key] === "string" ? row[key] as string : "";
const roles: Role[] = ["admin", "teacher", "student"];

export default function AdminUserDetailPage({ params }: { params: Promise<{ userId: string }> }) {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [data, setData] = useState<UserDetailsData | null>(null);
  const [role, setRoleValue] = useState<Role>("student");
  const [selectedRole, setSelectedRole] = useState<Role>("student");
  const [isActive, setIsActiveValue] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  useEffect(() => { params.then((value) => setUserId(value.userId)); }, [params]);
  useEffect(() => {
    if (!userId) return;
    let active = true;
    loadPortalData({ view: "adminUser", id: userId }).then((result) => {
      if (!active) return;
      if (!result.ok) {
        setError(result.error);
        setLoading(false);
        return;
      }
      const details = result.data as UserDetailsData;
      if (!details.profile) {
        setError("Không tìm thấy hồ sơ tài khoản.");
        setLoading(false);
        return;
      }
      const userRole = roles.includes(details.profile.role as Role) ? details.profile.role as Role : "student";
      setData(details);
      setRoleValue(userRole);
      setSelectedRole(userRole);
      setIsActiveValue(details.profile.is_active === true);
      setCurrentUserId(details.currentUserId);
      setError(null);
      setLoading(false);
    }).catch(() => {
      if (active) {
        setError("Không thể tải hồ sơ tài khoản.");
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, [userId]);

  const profile = data?.profile;
  const self = userId === currentUserId;
  const classesByUser = (data?.memberships ?? []).map((membership) => {
    const cls = data?.classes.find((item) => text(item, "id") === text(membership, "class_id"));
    return cls ? text(cls, "name") : "";
  }).filter(Boolean);

  async function applyRole() {
    if (self || selectedRole === role) return;
    if (!window.confirm(`Đổi vai trò @${text(profile ?? {}, "username")} từ ${role} sang ${selectedRole}?`)) return;
    setBusy(true);
    setError(null);
    const result = await setRole({ userId, role: selectedRole });
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      setSelectedRole(role);
      return;
    }
    setRoleValue(selectedRole);
    router.refresh();
  }

  async function toggleActive() {
    if (self) return;
    const next = !isActive;
    if (!window.confirm(`${next ? "Kích hoạt" : "Khóa"} tài khoản @${text(profile ?? {}, "username")}?`)) return;
    setBusy(true);
    setError(null);
    const result = await setActive({ userId, isActive: next });
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setIsActiveValue(next);
  }

  async function handleResetPassword() {
    if (!window.confirm("Đặt mật khẩu tạm mới? Người dùng sẽ phải đổi mật khẩu khi đăng nhập tiếp theo.")) return;
    setBusy(true);
    setError(null);
    const result = await resetPassword({ userId });
    setBusy(false);
    if (!result.ok) setError(result.error);
    else setTempPassword(result.data.tempPassword);
  }

  if (loading) return <p className="p-6 text-sm text-slate-500">Đang tải hồ sơ...</p>;
  if (!profile) return <div className="space-y-4"><p role="alert" className="text-rose-700">{error ?? "Không tìm thấy tài khoản."}</p><Link href="/admin/users" className="text-indigo-600 hover:underline">Quay lại danh sách</Link></div>;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/users" className="text-sm text-indigo-600 hover:underline">← Quản lý tài khoản</Link>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Hồ sơ @{text(profile, "username")}</h1>
          <p className="text-sm text-slate-500">{text(profile, "full_name")} · {text(profile, "id")}</p>
        </div>
        <span className={isActive ? "rounded-full bg-emerald-50 px-3 py-1 text-sm text-emerald-700" : "rounded-full bg-amber-50 px-3 py-1 text-sm text-amber-800"}>{isActive ? "Đang hoạt động" : "Chờ duyệt/đã khóa"}</span>
      </div>

      {error && <div role="alert" className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">{error}</div>}
      {tempPassword && <div className="p-4 rounded-lg border border-amber-300 bg-amber-50">
        <p className="text-sm font-semibold text-amber-900">Mật khẩu tạm — chỉ hiển thị lần này</p>
        <p className="mt-2 font-mono text-lg select-all">{tempPassword}</p>
        <p className="mt-1 text-xs text-amber-800">Chuyển cho chủ tài khoản qua kênh riêng. Họ sẽ phải đổi mật khẩu sau khi đăng nhập.</p>
      </div>}

      <section className="rounded-xl border bg-white p-5 space-y-4">
        <h2 className="font-semibold text-slate-900">Phân quyền và trạng thái</h2>
        <label className="block text-sm text-slate-700">Vai trò
          <select value={selectedRole} disabled={self || busy} onChange={(e) => setSelectedRole(e.target.value as Role)} className="mt-1 w-full rounded-lg border px-3 py-2 bg-white disabled:opacity-50">
            <option value="admin">Admin</option><option value="teacher">Giáo viên</option><option value="student">Học sinh</option>
          </select>
        </label>
        <div className="flex flex-wrap gap-2">
          <button onClick={applyRole} disabled={self || busy || selectedRole === role} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white disabled:opacity-50">Lưu vai trò</button>
          <button onClick={toggleActive} disabled={self || busy} className="rounded-lg border px-4 py-2 text-sm disabled:opacity-50">{isActive ? "Khóa tài khoản" : "Kích hoạt tài khoản"}</button>
          <button onClick={handleResetPassword} disabled={busy} className="rounded-lg border border-amber-300 px-4 py-2 text-sm text-amber-800 disabled:opacity-50">Đặt mật khẩu tạm</button>
        </div>
        {self && <p className="text-xs text-slate-500">Để tránh tự khóa quyền quản trị, bạn không thể đổi vai trò hoặc trạng thái tài khoản đang đăng nhập.</p>}
        <p className="text-xs text-slate-500">Tài khoản Admin có quyền ngang nhau. Hệ thống giữ lại tối thiểu một Admin đang hoạt động.</p>
      </section>

      <section className="rounded-xl border bg-white p-5 space-y-2">
        <h2 className="font-semibold text-slate-900">Thông tin tài khoản</h2>
        <p className="text-sm text-slate-600">Mã học sinh: {text(profile, "student_code") || "—"}</p>
        <p className="text-sm text-slate-600">Mã nhân sự: {text(profile, "staff_code") || "—"}</p>
        <p className="text-sm text-slate-600">Lớp liên quan: {classesByUser.join(", ") || "—"}</p>
        <p className="text-sm text-slate-600">Ngày tạo: {text(profile, "created_at") ? new Date(text(profile, "created_at")).toLocaleString("vi-VN") : "—"}</p>
        {role === "teacher" && data?.classes.some((item) => text(item, "teacher_id") === userId && !item.archived_at) && <p className="text-sm text-amber-800">Giáo viên này đang phụ trách lớp chưa lưu trữ; cần chuyển giao hoặc lưu trữ lớp trước khi đổi vai trò.</p>}
      </section>
    </div>
  );
}