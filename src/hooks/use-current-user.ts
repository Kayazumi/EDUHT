// [FE] Hook lấy thông tin người dùng hiện tại ở Client · tài liệu mục 4.8
'use client';

import { useState } from "react";
import type { Role } from "@/shared/config/roles";

export interface CurrentUser {
  id: string;
  role: Role;
  username: string;
  fullName: string;
}

export function useCurrentUser() {
  const [user] = useState<CurrentUser | null>({
    id: "dummy-user-id",
    role: "student",
    username: "hs.mau01",
    fullName: "Học Sinh Mẫu",
  });
  const [loading] = useState(false);

  return { user, loading };
}
