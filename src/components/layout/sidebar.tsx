// [FE] Thanh bên ứng dụng · tài liệu mục 4.7
"use client";

import React, { useState } from "react";
import { RoleNav } from "./role-nav";
import type { Role } from "@/shared/config/roles";

export interface SidebarProps {
  role: Role;
  onNavigate?: () => void;
}

export function Sidebar({ role, onNavigate }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("eduht-sidebar-collapsed") === "true";
  });

  const handleToggle = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("eduht-sidebar-collapsed", String(next));
    }
  };

  return (
    <aside
      className={`bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 hidden md:flex flex-col no-print shrink-0 transition-all duration-200 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="sticky top-16 h-[calc(100vh-4rem)] flex flex-col justify-between overflow-y-auto py-2">
        <div className="flex-1">
          <RoleNav role={role} onNavigate={onNavigate} isCollapsed={isCollapsed} />
        </div>

        {/* Nút thu phóng cột điều hướng */}
        <div className="p-2 border-t border-gray-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handleToggle}
            className={`w-full flex items-center gap-2 py-2 px-2.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
              isCollapsed ? "justify-center" : "justify-between"
            }`}
            title={isCollapsed ? "Mở rộng cột điều hướng" : "Thu gọn cột điều hướng"}
          >
            {!isCollapsed && <span>Thu gọn danh mục</span>}
            <span className="text-sm font-bold">
              {isCollapsed ? "»" : "«"}
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}
