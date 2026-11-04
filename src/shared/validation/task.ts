// [CHUNG] Kiểm tra dữ liệu thẻ Kanban · tài liệu mục 4.8 · TODO: hiện thực đầy đủ
import { z } from "zod";

export const taskSchema = z.object({
  group_id: z.string().uuid(),
  title: z.string().min(3).max(150),
  description: z.string().max(2000).optional(),
  status: z.enum(["todo", "doing", "done"]).default("todo"),
  assignee_id: z.string().uuid().optional().nullable(),
  due_at: z.string().datetime().optional().nullable(),
  position: z.number().default(0),
  // TODO: hiện thực thêm
});

export const moveTaskSchema = z.object({
  taskId: z.string().uuid(),
  status: z.enum(["todo", "doing", "done"]),
  position: z.number(),
  assigneeId: z.string().uuid().optional().nullable(),
  dueAt: z.string().datetime().optional().nullable(),
});
