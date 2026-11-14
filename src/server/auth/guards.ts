// [BE] Chốt chặn phân quyền theo vai trò, lớp và nhóm · tài liệu mục 4.8
import { redirect } from "next/navigation";
import { getProfile } from "./session";
import type { Role } from "@/shared/config/roles";
import { routes } from "@/shared/config/routes";
import { AppError } from "@/shared/utils/errors";

export async function requireRole(expectedRole: Role) {
  const profile = await getProfile();

  if (!profile) {
    redirect(routes.auth.login);
  }

  if (profile.mustChangePassword) {
    redirect(routes.auth.changePassword);
  }

  if (profile.role !== expectedRole) {
    redirect(routes.auth.forbidden);
  }
  if (!profile.isActive) {
    redirect(routes.auth.forbidden);
  }

  return profile;
}

export async function requireAuthenticatedRole(expectedRole: Role) {
  return requireRole(expectedRole);
}

export async function requireClassTeacher(classId: string) {
  const profile = await requireRole("teacher");
  // TODO: kiểm tra giáo viên có phụ trách classId qua CSDL
  if (!classId) {
    throw new AppError("Không tìm thấy lớp học", "NOT_FOUND", 404);
  }
  return profile;
}

export async function requireGroupMember(groupId: string) {
  const profile = await requireRole("student");
  // TODO: kiểm tra học sinh có thuộc groupId qua CSDL
  if (!groupId) {
    throw new AppError("Không tìm thấy nhóm", "NOT_FOUND", 404);
  }
  return profile;
}
