// [BE] Phiên đăng nhập và lấy hồ sơ người dùng · tài liệu mục 4.8
import { cache } from "react";
import { cookies } from "next/headers";
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
    const role = (session.user.app_metadata?.role as Role) || "student";
    return {
      id: session.user.id,
      role,
      username: session.user.user_metadata?.username || "",
      fullName: session.user.user_metadata?.full_name || "",
      isActive: true,
      mustChangePassword: !!session.user.app_metadata?.must_change_password,
    };
  }

  // Chế độ xem trước demo cho phép kiểm tra giao diện khi chưa kết nối Supabase trực tiếp
  try {
    const cookieStore = await cookies();
    const demoRole = cookieStore.get("pbl_demo_role")?.value as Role | undefined;
    if (demoRole && ["admin", "teacher", "student"].includes(demoRole)) {
      return {
        id: `demo-${demoRole}-01`,
        role: demoRole,
        username: demoRole === "admin" ? "admin" : demoRole === "teacher" ? "gv.lan" : "hs.an01",
        fullName:
          demoRole === "admin"
            ? "Quản trị viên Hệ thống"
            : demoRole === "teacher"
            ? "ThS. Hoàng Thị Lan"
            : "Nguyễn Văn An",
        isActive: true,
        mustChangePassword: false,
      };
    }
  } catch {
    // Không làm gián đoạn
  }

  return null;
});
