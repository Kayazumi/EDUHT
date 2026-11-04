// [CHUNG] Kiểm tra dữ liệu phiếu đánh giá · tài liệu mục 4.8 · TODO: hiện thực đầy đủ
import { z } from "zod";

export const reviewAnswerSchema = z.object({
  criterion_id: z.string().uuid(),
  level: z.number().int().min(1).max(4),
});

export const saveDraftReviewSchema = z.object({
  round_id: z.string().uuid(),
  ratee_id: z.string().uuid(),
  answers: z.array(reviewAnswerSchema),
  comment: z.string().max(1000).optional(),
});

export const submitReviewSchema = z.object({
  review_id: z.string().uuid(),
  // TODO: hiện thực thêm
});
