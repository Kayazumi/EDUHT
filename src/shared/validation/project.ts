// [CHUNG] Kiểm tra dữ liệu dự án và nhóm · tài liệu mục 4.8 · TODO: hiện thực đầy đủ
import { z } from "zod";

export const projectSchema = z.object({
  class_id: z.string().uuid(),
  title: z.string().min(3).max(150),
  description: z.string().max(5000).optional(),
  starts_on: z.string(),
  due_on: z.string(),
  group_size_min: z.number().int().min(2).default(3),
  group_size_max: z.number().int().max(8).default(5),
  weight_group: z.number().min(0).max(1),
  allow_custom_tasks: z.boolean().default(true),
  // TODO: hiện thực thêm
});

export const groupSchema = z.object({
  name: z.string().min(1).max(50),
  project_id: z.string().uuid(),
  // TODO: hiện thực thêm
});

export const taskTemplateSchema = z.object({
  title: z.string().min(3).max(150),
  description: z.string().max(2000).optional(),
  position: z.number().int().min(0).default(0),
  default_due_on: z.string().optional(),
  // TODO: hiện thực thêm
});
