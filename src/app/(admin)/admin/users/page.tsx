"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { setActive, setRole } from "@/server/actions/users";
import { usePortalData } from "@/hooks/use-portal-data";
import type { Role } from "@/shared/config/roles";

type Row = Record<string, unknown>;
interface AdminUsersData {
  profiles: Row[];
  memberships: Row[];
  classes: Row[];
  currentUserId: string;
}
interface UserItem {
  id: string;
  username: string;
  fullName: string;
  role: Role;
  classes: string;
  isActive: boolean;
  createdAt: string;
}
const roles: Role[] = ["admin", "teacher", "student"];
const text = (row: Row, key: string) => typeof row[key] === "string" ? row[key] as string : "";
const flag = (row: Row, key: string) => row[key] === true;

export default function AdminUsersPage() {
  const { data, error: loadError, isLoading, refresh } = usePortalData<AdminUsersData>("adminUsers");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [error, setError] = useState<string | null>(null);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);

  const users = useMemo(() => {
    if (!data) return [];
    const classNames = new Map(data.classes.map((row) => [text(row, "id"), text(row, "name")]));
    const classesByStudent = new Map<string, string[]>();
    for (const membership of data.memberships) {
      const studentId = text(membership, "student_id");
      const className = classNames.get(text(membership, "class_id"));
      if (!className) continue;
      classesByStudent.set(studentId, [...(classesByStudent.get(studentId) ?? []), className]);
    }
    return data.profiles.map((profile) => {
      const id = text(profile, "id");
      const role = roles.includes(profile.role as Role) ? profile.role as Role : "student";
      const assignedClasses = role === "teacher"
        ? data.classes.filter((row) => text(row, "teacher_id") === id && !row.archived_at).map((row) => text(row, "name"))
        : classesByStudent.get(id) ?? [];
      return {
        id,
        username: text(profile, "username"),
        fullName: text(profile, "full_name"),
        role,
        classes: role === "admin" ? "Toàn hệ thống" : assignedClasses.join(", ") || "Chưa phân lớp",
        isActive: flag(profile, "is_active"),
        createdAt: text(profile, "created_at"),
      };
    });
  }, [data]);
  const currentUserId = data?.currentUserId ?? "";

  const classOptions = useMemo(() => [...new Set(users.flatMap((user) => user.classes.split(", ").filter((name) => name && name !== "Toàn hệ thống" && name !== "Chưa phân lớp")))].sort(), [users]);
  const filteredUsers = users.filter((user) => {
    const matchText = user.username.toLowerCase().includes(searchTerm.toLowerCase()) || user.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === "all" || user.role === roleFilter;
    const matchStatus = statusFilter === "all" || (statusFilter === "active" && user.isActive) || (statusFilter === "inactive" && !user.isActive);
    const matchClass = classFilter === "all" || user.classes.split(", ").includes(classFilter);
    return matchText && matchRole && matchStatus && matchClass;
  });

  async function changeRole(user: UserItem, nextRole: Role) {
    if (nextRole === user.role) return;
    if (!window.confirm(`Đổi vai trò @${user.username} từ ${user.role} sang ${nextRole}? Quyền truy cập sẽ đổi ngay.`)) return;
    setError(null);
    setBusyUserId(user.id);
    const result = await setRole({ userId: user.id, role: nextRole });
    setBusyUserId(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    refresh();
  }

  async function toggleActive(user: UserItem) {
    if (user.id === currentUserId) return;
    const nextStatus = !user.isActive;
    if (!window.confirm(`${nextStatus ? "Kích hoạt" : "Khóa"} tài khoản @${user.username}?`)) return;
    setError(null);
    setBusyUserId(user.id);
    const result = await setActive({ userId: user.id, isActive: nextStatus });
    setBusyUserId(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý tài khoản</h1>
          <p className="text-sm text-slate-500 mt-1">Danh sách được tải từ Supabase. Admin có thể điều chỉnh vai trò các tài khoản khác.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/register" className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg">+ Đăng ký tài khoản</Link>
          <Link href="/admin/users/import" className="px-4 py-2 bg-white text-slate-700 border border-slate-300 text-sm font-medium rounded-lg">Nhập CSV học sinh</Link>
        </div>
      </div>

      {(error || loadError) && <div role="alert" className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">{error || loadError}</div>}
      {isLoading ? <p className="text-sm text-slate-500">Đang tải tài khoản...</p> : (
        <>
          <div className="bg-white p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <label className="text-xs font-semibold text-slate-500">Tìm kiếm
              <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Username hoặc họ tên" className="mt-1 w-full px-3 py-2 text-sm border rounded-lg" />
            </label>
            <label className="text-xs font-semibold text-slate-500">Vai trò
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="mt-1 w-full px-3 py-2 text-sm border rounded-lg bg-white">
                <option value="all">Tất cả</option><option value="admin">Admin</option><option value="teacher">Giáo viên</option><option value="student">Học sinh</option>
              </select>
            </label>
            <label className="text-xs font-semibold text-slate-500">Lớp học
              <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} className="mt-1 w-full px-3 py-2 text-sm border rounded-lg bg-white">
                <option value="all">Tất cả lớp</option>{classOptions.map((name) => <option key={name}>{name}</option>)}
              </select>
            </label>
            <label className="text-xs font-semibold text-slate-500">Trạng thái
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="mt-1 w-full px-3 py-2 text-sm border rounded-lg bg-white">
                <option value="all">Tất cả</option><option value="active">Đang hoạt động</option><option value="inactive">Chờ duyệt/đã khóa</option>
              </select>
            </label>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold"><tr>
                  <th className="py-3 px-4">Username</th><th className="py-3 px-4">Họ tên</th><th className="py-3 px-4">Vai trò</th><th className="py-3 px-4">Lớp/phụ trách</th><th className="py-3 px-4">Trạng thái</th><th className="py-3 px-4">Ngày tạo</th><th className="py-3 px-4">Thao tác</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.length === 0 ? <tr><td colSpan={7} className="py-8 text-center text-slate-400">Không có tài khoản phù hợp.</td></tr> : filteredUsers.map((user) => {
                    const isSelf = user.id === currentUserId;
                    return <tr key={user.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-medium text-slate-900">@{user.username}</td>
                      <td className="py-3 px-4">{user.fullName}</td>
                      <td className="py-3 px-4">
                        <select aria-label={`Vai trò của ${user.username}`} value={user.role} disabled={isSelf || busyUserId === user.id} onChange={(e) => changeRole(user, e.target.value as Role)} className="px-2 py-1 border rounded bg-white disabled:opacity-50">
                          <option value="admin">Admin</option><option value="teacher">Giáo viên</option><option value="student">Học sinh</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">{user.classes}</td>
                      <td className="py-3 px-4">{user.isActive ? <span className="text-emerald-700">Hoạt động</span> : <span className="text-amber-700">Chờ duyệt/đã khóa</span>}</td>
                      <td className="py-3 px-4 text-xs">{user.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : "—"}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <Link href={`/admin/users/${user.id}`} className="text-indigo-600 hover:underline mr-3">Chi tiết</Link>
                        <button disabled={isSelf || busyUserId === user.id} onClick={() => toggleActive(user)} className="text-rose-600 hover:underline disabled:opacity-50">{user.isActive ? "Khóa" : "Kích hoạt"}</button>
                      </td>
                    </tr>;
                  })}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t text-xs text-slate-500">Hiển thị {filteredUsers.length} / {users.length} tài khoản. Bạn không thể tự đổi vai trò hoặc tự khóa tài khoản.</div>
          </div>
        </>
      )}
    </div>
  );
}