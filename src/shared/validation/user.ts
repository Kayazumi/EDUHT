// [CHUNG] Kiểm tra dữ liệu người dùng và CSV · tài liệu mục 7.7
import { z } from "zod";
import { usernameSchema } from "./auth";

export const fullNameSchema = z
  .string()
  .transform((val) => val.trim())
  .pipe(
    z
      .string()
      .min(2, "Họ tên phải có tối thiểu 2 ký tự")
      .max(100, "Họ tên không được vượt quá 100 ký tự")
  );

export const schoolYearSchema = z
  .string()
  .regex(/^[0-9]{4}-[0-9]{4}$/, "Năm học phải có định dạng YYYY-YYYY");

export const studentCsvRowSchema = z.object({
  username: usernameSchema,
  full_name: fullNameSchema,
  class_name: z.string().min(1, "Tên lớp không được để trống").max(30),
  school_year: schoolYearSchema,
});

export const createTeacherSchema = z.object({
  username: usernameSchema,
  full_name: fullNameSchema,
});

export const createStudentSchema = z.object({
  username: usernameSchema,
  full_name: fullNameSchema,
  class_id: z.string().uuid("Mã lớp không hợp lệ"),
});
