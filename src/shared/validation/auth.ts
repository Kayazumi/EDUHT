// [CHUNG] Kiểm tra dữ liệu xác thực · tài liệu mục 7.7
import { z } from "zod";

export const usernameSchema = z
  .string()
  .regex(/^[a-z0-9._-]{3,30}$/, "Tên đăng nhập gồm 3-30 ký tự thường, số, chấm, gạch dưới hoặc gạch ngang");

export const passwordSchema = z
  .string()
  .min(8, "Mật khẩu phải có tối thiểu 8 ký tự");

export const signInSchema = z.object({
  username: z.string().regex(/^[A-Za-z0-9._-]{3,30}$/, "Tên đăng nhập gồm 3-30 ký tự chữ, số, chấm, gạch dưới hoặc gạch ngang").transform((value) => value.toLowerCase()),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
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
