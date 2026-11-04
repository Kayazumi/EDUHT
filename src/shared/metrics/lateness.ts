// [CHUNG] Định nghĩa và hàm kiểm tra trễ hạn thẻ Kanban · tài liệu mục 7.9
import type { TaskStatus } from "@/shared/types/domain";

export interface TaskMetricItem {
  status: TaskStatus;
  dueAt: Date | string | null;
  completedAt: Date | string | null;
  archivedAt?: Date | string | null;
}

function toDate(val: Date | string | null | undefined): Date | null {
  if (!val) return null;
  const d = typeof val === "string" ? new Date(val) : val;
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Thẻ trễ hạn khi:
 * - (status = 'done' và completedAt > dueAt)
 * - (status <> 'done' và dueAt < now)
 * Không có dueAt hoặc đã lưu trữ thì không trễ (false)
 */
export function isLate(task: TaskMetricItem, now: Date = new Date()): boolean {
  if (task.archivedAt) return false;
  const due = toDate(task.dueAt);
  if (!due) return false;

  if (task.status === "done") {
    const completed = toDate(task.completedAt);
    if (!completed) return false;
    return completed.getTime() > due.getTime();
  }

  return due.getTime() < now.getTime();
}

/**
 * Thẻ đã xác định kết quả:
 * Thẻ đã done, hoặc thẻ chưa xong nhưng đã quá hạn
 */
export function isDetermined(task: TaskMetricItem, now: Date = new Date()): boolean {
  if (task.archivedAt) return false;
  if (!task.dueAt) {
    return task.status === "done";
  }
  return task.status === "done" || isLate(task, now);
}
