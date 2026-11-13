// [BE] Kiểm tra biến môi trường bí mật phía máy chủ · tài liệu mục 7.10
import "server-only";
import { z } from "zod";

const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "Thiếu biến SUPABASE_SERVICE_ROLE_KEY"),
  STUDENT_EMAIL_DOMAIN: z.string().min(1, "Thiếu biến STUDENT_EMAIL_DOMAIN").default("hs.pbl.example"),
  CRON_SECRET: z.string().min(32, "CRON_SECRET phải có ít nhất 32 ký tự"),
  EXPORT_PSEUDONYM_SECRET: z.string().min(32, "EXPORT_PSEUDONYM_SECRET phải có ít nhất 32 ký tự"),
  EXPORT_PSEUDONYM_KEY_VERSION: z.coerce.number().int().min(1).default(1),
});

function getServerEnv() {
  const result = serverEnvSchema.safeParse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    STUDENT_EMAIL_DOMAIN: process.env.STUDENT_EMAIL_DOMAIN || "hs.pbl.example",
    CRON_SECRET: process.env.CRON_SECRET,
    EXPORT_PSEUDONYM_SECRET: process.env.EXPORT_PSEUDONYM_SECRET,
    EXPORT_PSEUDONYM_KEY_VERSION: process.env.EXPORT_PSEUDONYM_KEY_VERSION || "1",
  });

  if (!result.success) {
    const errors = result.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
    throw new Error(`[Server Env Error] Cấu hình biến môi trường không hợp lệ: ${errors}`);
  }

  return result.data;
}

type ServerEnv = ReturnType<typeof getServerEnv>;
const defaults: Partial<Record<keyof ServerEnv, string>> = {
  STUDENT_EMAIL_DOMAIN: "hs.pbl.example",
  EXPORT_PSEUDONYM_KEY_VERSION: "1",
};

// Validate secrets when a server-only operation needs them, not during `next build`.
// This lets CI build the app without production credentials while preventing dummy keys at runtime.
export const serverEnv = new Proxy({} as ServerEnv, {
  get(_target, property: string) {
    if (!Object.hasOwn(serverEnvSchema.shape, property)) return undefined;
    const key = property as keyof ServerEnv;
    const value = process.env[key] ?? defaults[key];
    const parsed = serverEnvSchema.shape[key].safeParse(value);
    if (!parsed.success) {
      throw new Error(`[Server Env Error] ${key}: ${parsed.error.errors[0]?.message ?? "Cấu hình không hợp lệ"}`);
    }
    return parsed.data;
  },
});
