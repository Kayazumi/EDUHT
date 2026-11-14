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
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session;
  } catch {
    return null;
  }
});

export const getProfile = cache(async (): Promise<UserProfile | null> => {
  const session = await getSession();
  if (session?.user) {
    const supabase = await createClient();
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id,role,username,full_name,is_active,must_change_password")
      .eq("id", session.user.id)
      .maybeSingle();
    if (error || !profile) return null;
    return {
      id: profile.id,
      role: profile.role as Role,
      username: profile.username,
      fullName: profile.full_name,
      isActive: profile.is_active,
      mustChangePassword: profile.must_change_password,
    };
  }

  return null;
});
