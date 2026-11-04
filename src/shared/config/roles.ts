// [CHUNG] Vai trò người dùng và định tuyến cơ bản · tài liệu mục 7.1

export const ROLES = ["admin", "teacher", "student"] as const;

export type Role = (typeof ROLES)[number];

export const ROLE_HOME: Record<Role, string> = {
  admin: "/admin",
  teacher: "/teacher",
  student: "/student",
};
