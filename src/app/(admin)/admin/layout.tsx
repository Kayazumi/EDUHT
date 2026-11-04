// [FE] Khung bố cục Admin · tài liệu mục 4.5
import React from "react";
import { requireRole } from "@/server/auth/guards";
import { AppShell } from "@/components/layout/app-shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireRole("admin");

  return (
    <AppShell role="admin" userName={profile.fullName || profile.username}>
      {children}
    </AppShell>
  );
}
