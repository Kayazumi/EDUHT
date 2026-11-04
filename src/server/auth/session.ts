// [BE] Phiên đăng nhập và lấy hồ sơ người dùng · tài liệu mục 4.8
import { cache } from "react";
import { createClient } from "@/server/supabase/server";
import type { Role } from "@/shared/config/roles";

export interface UserProfile {
  id: string;
  role: Role;
  username: string;
  fullName: string;
  isActive: boolean;
  mustChangePassword: boolean;
}

export const getSession = cache(async () => {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
});

export const getProfile = cache(async (): Promise<UserProfile | null> => {
  const session = await getSession();
  if (!session?.user) return null;

  // Lấy role từ app_metadata
  const role = (session.user.app_metadata?.role as Role) || "student";

  return {
    id: session.user.id,
    role,
    username: session.user.user_metadata?.username || "",
    fullName: session.user.user_metadata?.full_name || "",
    isActive: true,
    mustChangePassword: !!session.user.app_metadata?.must_change_password,
  };
});
