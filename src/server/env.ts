// [BE] Kiểm tra biến môi trường bí mật phía máy chủ · tài liệu mục 7.10
import "server-only";
import { z } from "zod";

const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "Thiếu biến SUPABASE_SERVICE_ROLE_KEY"),
  STUDENT_EMAIL_DOMAIN: z.string().min(1, "Thiếu biến STUDENT_EMAIL_DOMAIN").default("hs.pbl.example"),
  CRON_SECRET: z.string().min(1, "Thiếu biến CRON_SECRET").default("cron-secret-placeholder"),
  EXPORT_PSEUDONYM_SECRET: z.string().min(1, "Thiếu biến EXPORT_PSEUDONYM_SECRET").default("pseudonym-secret-placeholder"),
  EXPORT_PSEUDONYM_KEY_VERSION: z.coerce.number().int().min(1).default(1),
});

function getServerEnv() {
  const result = serverEnvSchema.safeParse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || "dummy-service-role-key",
    STUDENT_EMAIL_DOMAIN: process.env.STUDENT_EMAIL_DOMAIN || "hs.pbl.example",
    CRON_SECRET: process.env.CRON_SECRET || "dummy-cron-secret",
    EXPORT_PSEUDONYM_SECRET: process.env.EXPORT_PSEUDONYM_SECRET || "dummy-export-secret",
    EXPORT_PSEUDONYM_KEY_VERSION: process.env.EXPORT_PSEUDONYM_KEY_VERSION || "1",
  });

  if (!result.success) {
    const errors = result.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
    throw new Error(`[Server Env Error] Cấu hình biến môi trường không hợp lệ: ${errors}`);
  }

  return result.data;
}

export const serverEnv = getServerEnv();
