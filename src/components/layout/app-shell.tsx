// [FE] Bố cục tổng thể ứng dụng · tài liệu mục 4.7
import React from "react";
import { Topbar } from "./topbar";
import { Sidebar } from "./sidebar";
import type { Role } from "@/shared/config/roles";

export interface AppShellProps {
  role: Role;
  userName?: string;
  title?: string;
  children: React.ReactNode;
}

export function AppShell({ role, userName, title, children }: AppShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Topbar role={role} userName={userName} />
      <div className="flex flex-1">
        <Sidebar role={role} />
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
          {title && <h1 className="text-2xl font-bold text-gray-900 mb-6">{title}</h1>}
          {children}
        </main>
      </div>
    </div>
  );
}
