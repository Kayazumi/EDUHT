// [FE] Danh mục điều hướng theo vai trò · tài liệu mục 4.7
import React from "react";
import Link from "next/link";
import type { Role } from "@/shared/config/roles";
import { routes } from "@/shared/config/routes";

export function RoleNav({ role }: { role: Role }) {
  const navItems = {
    admin: [
      { label: "Tổng quan", href: routes.admin.dashboard },
      { label: "Tài khoản", href: routes.admin.users },
      { label: "Lớp học", href: routes.admin.classes },
      { label: "Danh mục YCCĐ", href: routes.admin.curriculum },
      { label: "Mẫu BARS", href: routes.admin.barsTemplates },
      { label: "Nghiên cứu", href: routes.admin.research },
      { label: "Nhật ký hệ thống", href: routes.admin.auditLog },
    ],
    teacher: [
      { label: "Tổng quan", href: routes.teacher.dashboard },
      { label: "Dự án của tôi", href: routes.teacher.projects },
    ],
    student: [
      { label: "Việc của tôi", href: routes.student.dashboard },
      { label: "Hồ sơ cá nhân", href: routes.student.profile },
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
