// [FE] Thanh điều hướng trên cùng · tài liệu mục 4.7
import React from "react";
import Link from "next/link";
import type { Role } from "@/shared/config/roles";
import { signOut } from "@/server/actions/auth";

export interface TopbarProps {
  role?: Role;
  userName?: string;
}

export function Topbar({ role, userName = "Người dùng" }: TopbarProps) {
  const roleLabel = {
    admin: "Quản trị viên",
    teacher: "Giáo viên",
    student: "Học sinh",
  }[role || "student"];

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between no-print">
      <div className="flex items-center gap-3">
        <Link href="/" className="font-bold text-lg text-blue-600">
          PBL Platform
        </Link>
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-100">
          {roleLabel}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-700 font-medium hidden sm:inline">{userName}</span>
        <form action={signOut}>
          <button
            type="submit"
            className="text-xs text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-md transition-colors flex items-center gap-1"
            title="Đăng xuất để đăng nhập bằng tài khoản khác"
          >
            <span>🔄</span> <span>Đổi tài khoản</span>
          </button>
        </form>
        <form action={signOut}>
          <button
            type="submit"
            className="text-xs text-red-600 hover:text-red-700 font-medium"
            title="Đăng xuất tài khoản hiện tại"
          >
            Đăng xuất
          </button>
        </form>
      </div>
    </header>
  );
}
