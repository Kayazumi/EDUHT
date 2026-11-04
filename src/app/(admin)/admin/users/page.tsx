// [FE] Danh sách tài khoản · tài liệu mục 3.3, 4.5 và A3.2
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface UserItem {
  id: string;
  username: string;
  fullName: string;
  role: "admin" | "teacher" | "student";
  classes: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [classFilter, setClassFilter] = useState<string>("all");

  const [users, setUsers] = useState<UserItem[]>([
    {
      id: "u-adm-01",
      username: "admin",
      fullName: "Nguyễn Văn Admin",
      role: "admin",
      classes: "Toàn trường",
      isActive: true,
      createdAt: "2026-09-01",
    },
    {
      id: "u-tea-01",
      username: "gv.nguyenvana",
      fullName: "Nguyễn Văn An",
      role: "teacher",
      classes: "10A1, 10A2",
      isActive: true,
      createdAt: "2026-09-02",
    },
    {
      id: "u-tea-02",
      username: "gv.tranthib",
      fullName: "Trần Thị Bích",
      role: "teacher",
      classes: "11A1, 11A2",
      isActive: true,
      createdAt: "2026-09-02",
    },
    {
      id: "u-tea-03",
      username: "gv.lequangc",
      fullName: "Lê Quang Cường",
      role: "teacher",
      classes: "12A1",
      isActive: true,
      createdAt: "2026-09-03",
    },
    {
      id: "u-stu-01",
      username: "hs.mau01",
      fullName: "Học Sinh Mẫu 1",
      role: "student",
      classes: "10A1",
      isActive: true,
      createdAt: "2026-09-05",
    },
    {
      id: "u-stu-02",
      username: "hs.mau02",
      fullName: "Học Sinh Mẫu 2",
      role: "student",
      classes: "10A1",
      isActive: true,
      createdAt: "2026-09-05",
    },
    {
      id: "u-stu-03",
      username: "hs.phamthid",
      fullName: "Phạm Thị Dung",
      role: "student",
      classes: "10A2",
      isActive: false,
      createdAt: "2026-09-05",
    },
    {
      id: "u-stu-04",
      username: "hs.vuvanh",
      fullName: "Vũ Văn Hùng",
      role: "student",
      classes: "11A1",
      isActive: true,
      createdAt: "2026-09-06",
    },
  ]);

  const handleToggleActive = (id: string, currentStatus: boolean, username: string) => {
    if (username === "admin") {
      alert("Không thể khóa tài khoản Quản trị viên hệ thống.");
      return;
    }
    const action = currentStatus ? "khóa" : "kích hoạt lại";
    if (confirm(`Bạn có chắc chắn muốn ${action} tài khoản @${username}?`)) {
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, isActive: !currentStatus } : u))
      );
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && u.isActive) ||
      (statusFilter === "inactive" && !u.isActive);
    const matchClass = classFilter === "all" || u.classes.includes(classFilter);

    return matchSearch && matchRole && matchStatus && matchClass;
  });

  return (
    <div className="space-y-6">
      {/* Tiêu đề & Hành động */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Quản lý tài khoản người dùng
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Danh sách giáo viên, học sinh và quản trị viên trong hệ thống PBL
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/users/new"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
          >
            + Tạo giáo viên
          </Link>
          <Link
            href="/admin/users/import"
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-sm font-medium rounded-lg shadow-sm transition-colors"
          >
            Nhập CSV học sinh
          </Link>
        </div>
      </div>

      {/* Thanh công cụ tìm kiếm và lọc */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
            Tìm kiếm
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Username hoặc họ tên..."
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
            Vai trò
          </label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="all">Tất cả vai trò</option>
            <option value="admin">Quản trị viên (Admin)</option>
            <option value="teacher">Giáo viên (Teacher)</option>
            <option value="student">Học sinh (Student)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
            Lớp học
          </label>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="all">Tất cả các lớp</option>
            <option value="10A1">10A1</option>
            <option value="10A2">10A2</option>
            <option value="11A1">11A1</option>
            <option value="11A2">11A2</option>
            <option value="12A1">12A1</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
            Trạng thái
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Đã khóa</option>
          </select>
        </div>
      </div>

      {/* Bảng danh sách người dùng */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Tên đăng nhập</th>
                <th className="py-3.5 px-4">Họ và tên</th>
                <th className="py-3.5 px-4">Vai trò</th>
                <th className="py-3.5 px-4">Lớp / Phụ trách</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4">Ngày tạo</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Không tìm thấy tài khoản nào khớp với điều kiện lọc
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-900">
                      @{user.username}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {user.fullName}
                    </td>
                    <td className="py-3 px-4">
                      {user.role === "admin" && (
                        <Badge variant="danger">Quản trị viên</Badge>
                      )}
                      {user.role === "teacher" && (
                        <Badge variant="info">Giáo viên</Badge>
                      )}
                      {user.role === "student" && (
                        <Badge variant="default">Học sinh</Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {user.classes}
                    </td>
                    <td className="py-3 px-4">
                      {user.isActive ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs text-rose-700 font-semibold bg-rose-50 px-2.5 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          Đã khóa
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-xs">
                      {user.createdAt}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                      >
                        Chi tiết
                      </Link>
                      {user.role !== "admin" && (
                        <button
                          onClick={() => handleToggleActive(user.id, user.isActive, user.username)}
                          className={`text-xs font-semibold hover:underline ${
                            user.isActive
                              ? "text-rose-600 hover:text-rose-800"
                              : "text-emerald-600 hover:text-emerald-800"
                          }`}
                        >
                          {user.isActive ? "Khóa" : "Mở khóa"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Hiển thị <strong>{filteredUsers.length}</strong> / <strong>{users.length}</strong> người dùng
          </span>
          <span className="italic">
            Mật khẩu không bao giờ được lưu dưới dạng văn bản rõ hay hiển thị trên giao diện.
          </span>
        </div>
      </div>
    </div>
  );
}
