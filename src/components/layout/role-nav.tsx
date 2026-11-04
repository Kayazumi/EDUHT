// [FE] Danh mục điều hướng theo vai trò · tài liệu mục 4.7
import React from "react";
import Link from "next/link";
import type { Role } from "@/shared/config/roles";
import { routes } from "@/shared/config/routes";

export function RoleNav({ role }: { role: Role }) {
  const navItems = {
    admin: [
      { label: "📊 Tổng quan Admin", href: routes.admin.dashboard },
      { label: "👥 Quản lý tài khoản", href: routes.admin.users },
      { label: "🏫 Quản lý lớp học", href: routes.admin.classes },
      { label: "📚 Danh mục YCCĐ", href: routes.admin.curriculum },
      { label: "📋 Bộ mẫu BARS", href: routes.admin.barsTemplates },
      { label: "🔬 Đạo đức nghiên cứu", href: routes.admin.research },
      { label: "📜 Nhật ký hệ thống", href: routes.admin.auditLog },
    ],
    teacher: [
      { label: "📊 Bàn làm việc GV", href: routes.teacher.dashboard },
      { label: "📁 Dự án của tôi", href: routes.teacher.projects },
      { label: "🏫 Lớp học mẫu (12A1)", href: routes.teacher.classes("cls-12a1") },
    ],
    student: [
      { label: "📌 Việc của tôi", href: routes.student.dashboard },
      { label: "📁 Dự án đang tham gia", href: routes.student.projectDetail("p01") },
      { label: "📋 Bảng Kanban nhóm", href: routes.student.board("p01") },
      { label: "⭐ Chấm bạn cùng nhóm", href: routes.student.review("p01") },
      { label: "📊 Kết quả tổng kết", href: routes.student.results("p01") },
      { label: "👤 Hồ sơ & Mật khẩu", href: routes.student.profile },
    ],
  }[role];

  return (
    <nav className="flex flex-col gap-1 p-4">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
