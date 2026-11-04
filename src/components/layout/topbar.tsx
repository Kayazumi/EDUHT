// [FE] Thanh điều hướng trên cùng · tài liệu mục 4.7
import React from "react";
import Link from "next/link";
import type { Role } from "@/shared/config/roles";

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
        <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">
          {roleLabel}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-700 font-medium">{userName}</span>
        <button className="text-sm text-red-600 hover:text-red-700 font-medium">
          Đăng xuất
        </button>
      </div>
    </header>
  );
}
