// [TEST] Kiểm thử đơn vị định nghĩa trễ hạn và chỉ báo tiến trình · tài liệu mục 7.9
import { describe, it, expect } from "vitest";
import { isLate, isDetermined, type TaskMetricItem } from "@/shared/metrics/lateness";
import { completionRate, lateRate } from "@/shared/metrics/progress";

describe("lateness and progress metrics", () => {
  const now = new Date("2026-10-15T10:00:00Z");

  it("thẻ hoàn thành đúng hạn", () => {
    const task: TaskMetricItem = {
      status: "done",
      dueAt: new Date("2026-10-14T12:00:00Z"),
      completedAt: new Date("2026-10-14T10:00:00Z"),
    };
    expect(isLate(task, now)).toBe(false);
    expect(isDetermined(task, now)).toBe(true);
  });

  it("thẻ hoàn thành trễ", () => {
    const task: TaskMetricItem = {
      status: "done",
      dueAt: new Date("2026-10-14T12:00:00Z"),
      completedAt: new Date("2026-10-14T14:00:00Z"),
    };
    expect(isLate(task, now)).toBe(true);
    expect(isDetermined(task, now)).toBe(true);
  });

  it("thẻ quá hạn chưa xong", () => {
    const task: TaskMetricItem = {
      status: "doing",
      dueAt: new Date("2026-10-14T12:00:00Z"),
      completedAt: null,
    };
    expect(isLate(task, now)).toBe(true);
    expect(isDetermined(task, now)).toBe(true);
  });

  it("thẻ chưa có hạn", () => {
    const task: TaskMetricItem = {
      status: "todo",
      dueAt: null,
      completedAt: null,
    };
    expect(isLate(task, now)).toBe(false);
    expect(isDetermined(task, now)).toBe(false);
  });

  it("thẻ lưu trữ bị loại khỏi tính toán", () => {
    const task: TaskMetricItem = {
      status: "doing",
      dueAt: new Date("2026-10-10T12:00:00Z"),
      completedAt: null,
      archivedAt: new Date("2026-10-11T12:00:00Z"),
    };
    expect(isLate(task, now)).toBe(false);
    expect(isDetermined(task, now)).toBe(false);
  });

  it("tỷ lệ hoàn thành và trễ hạn khi mẫu số 0 trả về null", () => {
    expect(completionRate([])).toBe(null);
    expect(lateRate([], now)).toBe(null);

    // Mọi thẻ đều bị lưu trữ
    const archivedTasks: TaskMetricItem[] = [
      {
        status: "done",
        dueAt: new Date("2026-10-10T12:00:00Z"),
        completedAt: new Date("2026-10-09T12:00:00Z"),
        archivedAt: new Date("2026-10-11T12:00:00Z"),
      },
    ];
    expect(completionRate(archivedTasks)).toBe(null);
    expect(lateRate(archivedTasks, now)).toBe(null);
  });

  it("tính đúng tỷ lệ hoàn thành và trễ hạn hợp lệ", () => {
    const tasks: TaskMetricItem[] = [
      { status: "done", dueAt: "2026-10-14T12:00:00Z", completedAt: "2026-10-14T10:00:00Z" }, // đúng hạn
      { status: "done", dueAt: "2026-10-14T12:00:00Z", completedAt: "2026-10-14T15:00:00Z" }, // trễ hạn
      { status: "doing", dueAt: "2026-10-14T12:00:00Z", completedAt: null }, // trễ hạn
      { status: "todo", dueAt: "2026-10-20T12:00:00Z", completedAt: null }, // chưa xác định
    ];

    expect(completionRate(tasks)).toBe(0.5); // 2/4 done
    expect(lateRate(tasks, now)).toBe(0.67); // 2 late / 3 determined
  });
});
