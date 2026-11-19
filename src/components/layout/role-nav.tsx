// [FE] Danh mục điều hướng theo vai trò · tài liệu mục 4.7
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@/shared/config/roles";
import { routes } from "@/shared/config/routes";

export interface RoleNavProps {
  role: Role;
  onNavigate?: () => void;
}

interface NavItem {
  label: string;
  href: string;
  section?: string;
}

export function RoleNav({ role, onNavigate }: RoleNavProps) {
  const pathname = usePathname() || "";

  // Trích xuất projectId / classId ngữ cảnh từ URL nếu người dùng đang ở trong một dự án hoặc lớp học
  const studentProjectMatch = pathname.match(/\/student\/projects\/([^/]+)/);
  const teacherProjectMatch = pathname.match(/\/teacher\/projects\/([^/]+)/);
  const teacherClassMatch = pathname.match(/\/teacher\/classes\/([^/]+)/);
  const studentProjectId = studentProjectMatch ? studentProjectMatch[1] : null;
  const teacherProjectId = teacherProjectMatch ? teacherProjectMatch[1] : null;
  const teacherClassId =
    teacherClassMatch && teacherClassMatch[1] !== "classes" ? teacherClassMatch[1] : null;

  let navItems: NavItem[] = [];

  if (role === "admin") {
    navItems = [
      { label: "📊 Tổng quan Admin", href: routes.admin.dashboard },
      { label: "👥 Quản lý tài khoản", href: routes.admin.users },
      { label: "🏫 Quản lý lớp học", href: routes.admin.classes },
      { label: "📚 Danh mục YCCĐ", href: routes.admin.curriculum },
      { label: "📋 Bộ mẫu BARS", href: routes.admin.barsTemplates },
      { label: "🔬 Đạo đức nghiên cứu", href: routes.admin.research },
      { label: "📜 Nhật ký hệ thống", href: routes.admin.auditLog },
    ];
  } else if (role === "teacher") {
    navItems = [
      { label: "📊 Bàn làm việc GV", href: routes.teacher.dashboard },
      { label: "🏫 Lớp học & Học sinh", href: routes.teacher.classesList },
      { label: "📁 Tất cả dự án", href: routes.teacher.projects },
    ];

    if (teacherClassId) {
      navItems.push(
        {
          section: "Lớp học đang chọn",
          label: "👥 Quản lý học sinh",
          href: routes.teacher.classes(teacherClassId),
        },
        {
          label: "📥 Nhập từ Excel / CSV",
          href: routes.teacher.importStudents(teacherClassId),
        }
      );
    }

    if (teacherProjectId) {
      navItems.push(
        { section: "Dự án đang chọn", label: "⚙️ Chi tiết dự án", href: routes.teacher.projectDetail(teacherProjectId) },
        { label: "👥 Nhóm & phân công", href: routes.teacher.groups(teacherProjectId) },
        { label: "📈 Bảng tiến độ dự án", href: routes.teacher.projectDashboard(teacherProjectId) },
        { label: "⭐ Đợt đánh giá BARS", href: routes.teacher.evaluation(teacherProjectId) },
        { label: "📝 Chấm điểm & tổng kết", href: routes.teacher.grading(teacherProjectId) }
      );
    }
  } else {
    // student
    navItems = [
      { label: "📌 Bàn làm việc của tôi", href: routes.student.dashboard },
    ];

    if (studentProjectId) {
      navItems.push(
        { section: "Dự án hiện tại", label: "📁 Tổng quan dự án", href: routes.student.projectDetail(studentProjectId) },
        { label: "📋 Bảng Kanban nhóm", href: routes.student.board(studentProjectId) },
        { label: "⭐ Chấm điểm đồng đẳng", href: routes.student.review(studentProjectId) },
        { label: "📊 Kết quả tổng kết", href: routes.student.results(studentProjectId) }
      );
    }

    navItems.push({ label: "👤 Hồ sơ & Mật khẩu", href: routes.student.profile });
  }

  const isItemActive = (href: string) => {
    if (pathname === href) return true;
    // Đối với các link gốc, chỉ match chính xác
    if (href === "/student" || href === "/teacher" || href === "/admin" || href === "/teacher/projects") {
      return false;
    }
    return pathname.startsWith(href + "/");
  };

  return (
    <nav className="flex flex-col gap-1 p-3" aria-label="Điều hướng chính">
      {navItems.map((item) => {
        const active = isItemActive(item.href);
        return (
          <React.Fragment key={item.href}>
            {item.section && (
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-3 pt-3 pb-1">
                {item.section}
              </div>
            )}
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                active
                  ? "bg-blue-50 text-blue-700 font-semibold border-l-4 border-blue-600 pl-2 shadow-2xs"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <span>{item.label}</span>
            </Link>
          </React.Fragment>
        );
      })}
    </nav>
  );
}
