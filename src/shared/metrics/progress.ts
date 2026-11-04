// [CHUNG] Hàm tính chỉ báo tiến trình và tỷ lệ trễ hạn · tài liệu mục 7.9
import { isDetermined, isLate, type TaskMetricItem } from "./lateness";

/**
 * Tỷ lệ hoàn thành = số thẻ done / số thẻ hợp lệ (không lưu trữ)
 * Trả về null khi mẫu số bằng 0
 */
export function completionRate(tasks: TaskMetricItem[]): number | null {
  const validTasks = tasks.filter((t) => !t.archivedAt);
  if (validTasks.length === 0) return null;

  const doneCount = validTasks.filter((t) => t.status === "done").length;
  return Math.round(((doneCount / validTasks.length) + Number.EPSILON) * 100) / 100;
}

/**
 * Tỷ lệ trễ hạn = số thẻ trễ / số thẻ đã xác định kết quả
 * Trả về null khi mẫu số bằng 0
 */
export function lateRate(tasks: TaskMetricItem[], now: Date = new Date()): number | null {
  const validTasks = tasks.filter((t) => !t.archivedAt);
  const determinedTasks = validTasks.filter((t) => isDetermined(t, now));
  if (determinedTasks.length === 0) return null;

  const lateCount = determinedTasks.filter((t) => isLate(t, now)).length;
  return Math.round(((lateCount / determinedTasks.length) + Number.EPSILON) * 100) / 100;
}
