// [CHUNG] Kiểm tra dữ liệu xác thực · tài liệu mục 7.7
import { z } from "zod";

export const usernameSchema = z
  .string()
  .regex(/^[a-z0-9._-]{3,30}$/, "Tên đăng nhập gồm 3-30 ký tự thường, số, chấm, gạch dưới hoặc gạch ngang");

export const passwordSchema = z
  .string()
  .min(8, "Mật khẩu phải có tối thiểu 8 ký tự");

export const signInSchema = z.object({
  username: z.string().trim().min(3).max(254).refine((value) =>
    /^[A-Za-z0-9._-]{3,30}$/.test(value) || z.string().email().safeParse(value).success,
  "Nhập tên đăng nhập hoặc email hợp lệ").transform((value) => value.toLowerCase()),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

export const emailSchema = z.string().trim().email("Vui lòng nhập địa chỉ email hợp lệ").transform((value) => value.toLowerCase());

export const signupSchema = z.object({
  username: usernameSchema,
  fullName: z.string().trim().min(2, "Họ tên phải có ít nhất 2 ký tự").max(100),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  role: z.enum(["student", "teacher"]),
}).refine((value) => value.password === value.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

export const signupVerificationSchema = z.object({
  email: emailSchema,
  token: z.string().trim().regex(/^\d{6,10}$/, "Mã xác nhận phải gồm 6–10 chữ số"),
});

export const recoveryRequestSchema = z.object({ email: emailSchema });

export const recoveryCompleteSchema = z.object({
  email: emailSchema,
  token: z.string().trim().regex(/^\d{6,10}$/, "Mã xác nhận phải gồm 6–10 chữ số"),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((value) => value.newPassword === value.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().optional(),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu nhập lại không khớp",
    path: ["confirmPassword"],
  });
