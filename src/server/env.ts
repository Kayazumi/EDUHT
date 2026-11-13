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

type ServerEnv = z.infer<typeof serverEnvSchema>;
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
