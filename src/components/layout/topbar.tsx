// [FE] Thanh điều hướng trên cùng · tài liệu mục 4.7
import React from "react";
import Link from "next/link";
import type { Role } from "@/shared/config/roles";
import { signOut } from "@/server/actions/auth";

export interface TopbarProps {
  role?: Role;
  userName?: string;
  onToggleMobileMenu?: () => void;
}

export function Topbar({ role, userName = "Người dùng", onToggleMobileMenu }: TopbarProps) {
  const roleLabel = {
    admin: "Quản trị viên",
    teacher: "Giáo viên",
    student: "Học sinh",
  }[role || "student"];

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-4 sm:px-6 flex items-center justify-between no-print sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="p-2 -ml-2 text-gray-600 hover:text-gray-900 md:hidden rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Mở danh mục điều hướng"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="font-extrabold text-xl tracking-tight text-blue-600 group-hover:text-blue-700 transition-colors">
            EDUHT
          </span>
          <span className="text-[11px] font-medium text-gray-400 hidden sm:inline border-l border-gray-200 pl-2">
            PBL Tin học
          </span>
        </Link>
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-100">
          {roleLabel}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
            {userName.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm text-gray-700 font-medium hidden sm:inline max-w-[150px] truncate" title={userName}>
            {userName}
          </span>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="text-xs text-gray-600 hover:text-red-700 bg-gray-50 hover:bg-red-50 border border-gray-200 hover:border-red-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-medium shadow-2xs"
            title="Đăng xuất khỏi hệ thống"
          >
            <span>Đăng xuất</span>
            <svg
              className="w-3.5 h-3.5 text-gray-400 group-hover:text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>
        </form>
      </div>
    </header>
  );
}
