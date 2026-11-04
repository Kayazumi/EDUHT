// [FE] Khung bố cục Giáo viên · tài liệu mục 4.5
import React from "react";
import { requireRole } from "@/server/auth/guards";
import { AppShell } from "@/components/layout/app-shell";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireRole("teacher");

  return (
    <AppShell role="teacher" userName={profile.fullName || profile.username}>
      {children}
    </AppShell>
  );
}
