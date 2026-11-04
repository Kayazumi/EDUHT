// [FE] Khung bố cục Học sinh · tài liệu mục 4.5
import React from "react";
import { requireRole } from "@/server/auth/guards";
import { AppShell } from "@/components/layout/app-shell";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireRole("student");

  return (
    <AppShell role="student" userName={profile.fullName || profile.username}>
      {children}
    </AppShell>
  );
}
