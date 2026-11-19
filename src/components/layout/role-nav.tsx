// [FE] Danh mục điều hướng theo vai trò · tài liệu mục 4.7
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@/shared/config/roles";
import { routes } from "@/shared/config/routes";

export interface RoleNavProps {
  role: Role;
  onNavigate?: () => void;
  isCollapsed?: boolean;
}

interface NavItem {
  icon: string;
  label: string;
  href: string;
  section?: string;
}

// Tách icon emoji phía trước và nhãn văn bản
function splitIconAndLabel(rawText: string): { icon: string; label: string } {
  const match = rawText.match(/^([\p{Extended_Pictographic}\u2600-\u27BF\uD83C-\uDBFF\uDC00-\uDFFF]+)\s*(.*)$/u);
  if (match && match[1] && match[2] !== undefined) {
    return { icon: match[1], label: match[2] };
  }
  return { icon: "🔹", label: rawText };
}

export function RoleNav({ role, onNavigate, isCollapsed = false }: RoleNavProps) {
  const pathname = usePathname() || "";
  const [cachedProject] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("eduht-active-student-project");
  });

  // Trích xuất projectId / classId ngữ cảnh từ URL
  const studentProjectMatch = pathname.match(/\/student\/projects\/([^/]+)/);
  const teacherProjectMatch = pathname.match(/\/teacher\/projects\/([^/]+)/);
  const teacherClassMatch = pathname.match(/\/teacher\/classes\/([^/]+)/);

  const currentStudentProjectId = studentProjectMatch ? studentProjectMatch[1] : null;
  const teacherProjectId = teacherProjectMatch ? teacherProjectMatch[1] : null;
  const teacherClassId =
    teacherClassMatch && teacherClassMatch[1] !== "classes" ? teacherClassMatch[1] : null;

  useEffect(() => {
    if (currentStudentProjectId && typeof window !== "undefined") {
      localStorage.setItem("eduht-active-student-project", currentStudentProjectId);
    }
  }, [currentStudentProjectId]);

  const effectiveStudentProjectId = currentStudentProjectId || cachedProject;

  let rawNavItems: Array<{ section?: string; text: string; href: string }> = [];

  if (role === "admin") {
    rawNavItems = [
      { text: "📊 Tổng quan Admin", href: routes.admin.dashboard },
      { text: "👥 Quản lý tài khoản", href: routes.admin.users },
      { text: "🏫 Quản lý lớp học", href: routes.admin.classes },
      { text: "📚 Danh mục YCCĐ", href: routes.admin.curriculum },
      { text: "📋 Bộ mẫu BARS", href: routes.admin.barsTemplates },
      { text: "🔬 Đạo đức nghiên cứu", href: routes.admin.research },
      { text: "📜 Nhật ký hệ thống", href: routes.admin.auditLog },
    ];
  } else if (role === "teacher") {
    rawNavItems = [
      { text: "📊 Bàn làm việc GV", href: routes.teacher.dashboard },
      { text: "🏫 Lớp học & Học sinh", href: routes.teacher.classesList },
      { text: "📁 Tất cả dự án", href: routes.teacher.projects },
    ];

    if (teacherClassId) {
      rawNavItems.push(
        {
          section: "Lớp học đang chọn",
          text: "👥 Quản lý học sinh",
          href: routes.teacher.classes(teacherClassId),
        },
        {
          text: "📥 Nhập từ Excel / CSV",
          href: routes.teacher.importStudents(teacherClassId),
        }
      );
    }

    if (teacherProjectId) {
      rawNavItems.push(
        { section: "Dự án đang chọn", text: "⚙️ Chi tiết dự án", href: routes.teacher.projectDetail(teacherProjectId) },
        { text: "👥 Nhóm & phân công", href: routes.teacher.groups(teacherProjectId) },
        { text: "📈 Bảng tiến độ dự án", href: routes.teacher.projectDashboard(teacherProjectId) },
        { text: "⭐ Đợt đánh giá BARS", href: routes.teacher.evaluation(teacherProjectId) },
        { text: "📝 Chấm điểm & tổng kết", href: routes.teacher.grading(teacherProjectId) }
      );
    }
  } else {
    // student
    rawNavItems = [
      { text: "📌 Bàn làm việc của tôi", href: routes.student.dashboard },
    ];

    if (effectiveStudentProjectId) {
      rawNavItems.push(
        { section: "Dự án đang tham gia", text: "📁 Tổng quan dự án", href: routes.student.projectDetail(effectiveStudentProjectId) },
        { text: "📋 Bảng Kanban nhóm", href: routes.student.board(effectiveStudentProjectId) },
        { text: "⭐ Chấm điểm đồng đẳng", href: routes.student.review(effectiveStudentProjectId) },
        { text: "📊 Kết quả tổng kết", href: routes.student.results(effectiveStudentProjectId) }
      );
    }
  }

  const navItems: NavItem[] = rawNavItems.map((item) => {
    const { icon, label } = splitIconAndLabel(item.text);
    return {
      icon,
      label,
      href: item.href,
      section: item.section,
    };
  });

  const isItemActive = (href: string) => {
    if (pathname === href) return true;
    if (href === "/student" || href === "/teacher" || href === "/admin" || href === "/teacher/projects") {
      return false;
    }
    return pathname.startsWith(href + "/");
  };

  return (
    <nav className="flex flex-col gap-1 p-2 sm:p-3" aria-label="Điều hướng chính">
      {navItems.map((item) => {
        const active = isItemActive(item.href);
        return (
          <React.Fragment key={item.href}>
            {item.section && !isCollapsed && (
              <div className="text-[11px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider px-3 pt-3 pb-1">
                {item.section}
              </div>
            )}
            {item.section && isCollapsed && (
              <div className="border-t border-gray-200 dark:border-slate-800 my-2" />
            )}
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              title={isCollapsed ? `${item.icon} ${item.label}` : undefined}
              className={`flex items-center gap-2.5 rounded-lg transition-all ${
                isCollapsed
                  ? "justify-center p-2.5"
                  : "px-3 py-2 text-sm"
              } ${
                active
                  ? "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 font-semibold border-l-4 border-blue-600 pl-2 shadow-2xs"
                  : "text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-slate-100"
              }`}
            >
              <span className="text-base shrink-0">{item.icon}</span>
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </Link>
          </React.Fragment>
        );
      })}
    </nav>
  );
}
