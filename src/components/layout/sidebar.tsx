// [FE] Thanh bên ứng dụng · tài liệu mục 4.7
import React from "react";
import { RoleNav } from "./role-nav";
import type { Role } from "@/shared/config/roles";

export function Sidebar({ role }: { role: Role }) {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 hidden md:block no-print">
      <RoleNav role={role} />
    </aside>
  );
}
