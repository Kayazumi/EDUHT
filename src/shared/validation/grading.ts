// [CHUNG] Kiểm tra dữ liệu chấm điểm · tài liệu mục 4.8 · TODO: hiện thực đầy đủ
import { z } from "zod";

export const groupScoreSchema = z.object({
  group_id: z.string().uuid(),
  score: z.number().min(0).max(10),
  comment: z.string().max(2000).optional(),
  // TODO: hiện thực thêm
});

export const adjustFinalScoreSchema = z.object({
  project_id: z.string().uuid(),
  student_id: z.string().uuid(),
  adjusted_score: z.number().min(0).max(10),
  adjust_reason: z.string().min(10, "Lý do điều chỉnh phải có ít nhất 10 ký tự"),
  // TODO: hiện thực thêm
});
