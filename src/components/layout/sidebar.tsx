// [FE] Thanh bên ứng dụng · tài liệu mục 4.7
import React from "react";
import { RoleNav } from "./role-nav";
import type { Role } from "@/shared/config/roles";

export interface SidebarProps {
  role: Role;
  onNavigate?: () => void;
}

export function Sidebar({ role, onNavigate }: SidebarProps) {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 hidden md:block no-print shrink-0">
      <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto py-2">
        <RoleNav role={role} onNavigate={onNavigate} />
      </div>
    </aside>
  );
}
