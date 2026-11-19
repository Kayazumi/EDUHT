// [FE] Bố cục tổng thể ứng dụng · tài liệu mục 4.7
"use client";

import React, { useState, useEffect } from "react";
import { Topbar } from "./topbar";
import { Sidebar } from "./sidebar";
import { RoleNav } from "./role-nav";
import type { Role } from "@/shared/config/roles";

export interface AppShellProps {
  role: Role;
  userName?: string;
  title?: string;
  children: React.ReactNode;
}

export function AppShell({ role, userName, title, children }: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Đóng menu khi nhấn phím Escape
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  // Ngăn cuộn trang body khi menu mobile đang mở
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Topbar
        role={role}
        userName={userName}
        onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
      />

      {/* Menu Drawer cho thiết bị di động */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex" role="dialog" aria-modal="true">
          {/* Backdrop mờ */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-2xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Ngăn kéo menu */}
          <div className="relative w-72 max-w-[80vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            <div className="h-16 px-4 border-b border-gray-200 flex items-center justify-between">
              <span className="font-extrabold text-lg text-blue-600">EDUHT</span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-100"
                aria-label="Đóng menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-2">
              <RoleNav role={role} onNavigate={() => setMobileMenuOpen(false)} />
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-1">
        <Sidebar role={role} />
        <main className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full">
          {title && <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">{title}</h1>}
          {children}
        </main>
      </div>
    </div>
  );
}
