// [BE] Tiện ích chuẩn hóa username và ghép email nội bộ · tài liệu mục 4.8
import { serverEnv } from "@/server/env";

export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

export function toInternalEmail(username: string): string {
  const clean = normalizeUsername(username);
  return `${clean}@${serverEnv.STUDENT_EMAIL_DOMAIN}`;
}

export function fromInternalEmail(email: string): string {
  const atIndex = email.indexOf("@");
  if (atIndex === -1) return email;
  return email.substring(0, atIndex);
}
