// [CHUNG] Kiểm tra dữ liệu BARS · tài liệu mục 4.8 · TODO: hiện thực đầy đủ
import { z } from "zod";

export const barsCriterionSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  weight: z.number().int().min(1).max(5).default(1),
  // TODO: bổ sung các ràng buộc khác
});

export const barsLevelSchema = z.object({
  level: z.number().int().min(1).max(4),
  behavior_text: z.string().min(5).max(500),
  // TODO: bổ sung các ràng buộc khác
});

export const barsLevelPointsSchema = z.object({
  points: z.number().min(0).max(10),
  // TODO: bổ sung các ràng buộc khác
});
