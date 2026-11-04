// [CHUNG] Kiểm tra dữ liệu đồng ý nghiên cứu · tài liệu mục 4.8 · TODO: hiện thực đầy đủ
import { z } from "zod";

export const consentSchema = z.object({
  student_id: z.string().uuid(),
  status: z.enum(["pending", "granted", "declined", "revoked"]),
  consented_by: z.enum(["student", "guardian", "both"]).optional(),
  form_version: z.string().min(1).max(30),
  note: z.string().max(500).optional(),
  // TODO: hiện thực bổ sung quy tắc ràng buộc
});
