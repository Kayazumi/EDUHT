// [FE] Bảng Kanban nhóm học sinh · tài liệu mục 3.3, 4.5 và A3.4
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { PortalDataState } from "@/components/ui/portal-data-state";
import { usePortalData } from "@/hooks/use-portal-data";
import { createTask, moveTask, setDueDate } from "@/server/actions/tasks";

type DataRow = Record<string, unknown>;

interface StudentBoardData {
  project: DataRow | null;
  group: DataRow | null;
  groupId: string;
  tasks: DataRow[];
  members: DataRow[];
  events: DataRow[];
}

function readString(row: DataRow | null | undefined, key: string, fallback = "") {
  const value = row?.[key];
  return typeof value === "string" ? value : fallback;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Chưa đặt hạn";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Chưa đặt hạn" : new Intl.DateTimeFormat("vi-VN", { dateStyle: "short" }).format(date);
}

function formatDateTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(date);
}

interface KanbanTask {
  id: string;
  title: string;
  description: string;
  status: "todo" | "doing" | "done";
  assigneeId: string | null;
  assigneeName: string | null;
  dueDate: string;
  dueAt?: string;
  isOverdue: boolean;
  curriculumTags: string[];
  completedAt?: string;
}

interface TaskEventLog {
  id: string;
  time: string;
  actorName: string;
  action: string;
}

export default function StudentProjectBoardPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const [resolvedId, setResolvedId] = useState("");
  const { data, error, isLoading, refresh } = usePortalData<StudentBoardData>("studentBoard", resolvedId);
  const tasks: KanbanTask[] = (data?.tasks ?? []).map((task) => {
    const assigneeId = typeof task.assignee_id === "string" ? task.assignee_id : null;
    const assignee = data?.members.find((member) => member.student_id === assigneeId);
    return {
      id: readString(task, "task_id"),
      title: readString(task, "title", "Nhiệm vụ"),
      description: readString(task, "description"),
      status: task.status === "doing" || task.status === "done" ? task.status : "todo",
      assigneeId,
      assigneeName: readString(assignee, "full_name") || null,
      dueDate: typeof task.due_at === "string" ? formatDate(task.due_at) : "Chưa đặt hạn",
      dueAt: typeof task.due_at === "string" ? task.due_at.slice(0, 10) : undefined,
      isOverdue: task.is_late === true,
      curriculumTags: [],
      completedAt: typeof task.completed_at === "string" ? formatDateTime(task.completed_at) : undefined,
    };
  });
  const teamMembers = (data?.members ?? []).map((member) => ({
    id: readString(member, "student_id"),
    name: readString(member, "full_name", "Học sinh"),
  }));

  // Modals state
  const [selectedTask, setSelectedTask] = useState<KanbanTask | null>(null);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [tempDueDate, setTempDueDate] = useState("");

  // Modal yêu cầu gán người phụ trách khi chuyển sang doing/done (Kịch bản 3)
  const [assigneeRequiredModal, setAssigneeRequiredModal] = useState<{
    task: KanbanTask;
    targetStatus: "doing" | "done";
  } | null>(null);
  const [tempAssignee, setTempAssignee] = useState("");

  const [notification, setNotification] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    params.then((p) => setResolvedId(p.projectId));
  }, [params]);

  if (!resolvedId || isLoading) return <PortalDataState label="bảng nhiệm vụ" />;
  if (error) return <PortalDataState label="bảng nhiệm vụ" error={error} onRetry={refresh} />;
  if (!data?.project || !data.group) {
    return <PortalDataState label="nhóm dự án" error="Không tìm thấy nhóm hoặc dự án của bạn." onRetry={refresh} />;
  }

  // Quy tắc nghiệp vụ A3.4 & Scenario 3: Chuyển sang DOING hoặc DONE BẮT BUỘC có assignee
  const handleMoveStatus = async (task: KanbanTask, targetStatus: "todo" | "doing" | "done") => {
    if (task.status === targetStatus) return;

    if ((targetStatus === "doing" || targetStatus === "done") && (!task.assigneeId || !task.dueAt)) {
      // Cần đủ người phụ trách và hạn hoàn thành trước khi chuyển trạng thái.
      setAssigneeRequiredModal({ task, targetStatus });
      setTempAssignee(task.assigneeId || teamMembers[0]?.id || "");
      setTempDueDate(task.dueAt || "");
      return;
    }

    void applyTaskStatusMove(task.id, targetStatus, task.assigneeId);
  };

  const applyTaskStatusMove = async (
    taskId: string,
    targetStatus: "todo" | "doing" | "done",
    assigneeId: string | null
  ) => {
    setIsSaving(true);
    setErrorMessage(null);
    if (targetStatus !== "todo" && assigneeRequiredModal?.task.id === taskId && !assigneeRequiredModal.task.dueAt) {
      if (!tempDueDate) {
        setIsSaving(false);
        setErrorMessage("Hãy chọn hạn hoàn thành trước khi chuyển thẻ sang Đang làm hoặc Hoàn thành.");
        return false;
      }
      const dueResult = await setDueDate({ taskId, dueDate: tempDueDate });
      if (!dueResult.ok) {
        setIsSaving(false);
        setErrorMessage(dueResult.error);
        return false;
      }
    }
    const result = await moveTask({ taskId, status: targetStatus, assigneeId });
    setIsSaving(false);
    if (!result.ok) {
      setErrorMessage(result.error);
      return false;
    }

    const actionText =
      targetStatus === "doing" ? "ĐANG LÀM" : targetStatus === "done" ? "HOÀN THÀNH" : "CHỜ LÀM";
    setNotification(`Đã chuyển thẻ sang cột [${actionText}]!`);
    setTimeout(() => setNotification(null), 3000);
    refresh();
    return true;
  };

  const handleConfirmAssignee = async () => {
    if (!assigneeRequiredModal) return;
    const moved = await applyTaskStatusMove(
      assigneeRequiredModal.task.id,
      assigneeRequiredModal.targetStatus,
      tempAssignee
    );
    if (moved) setAssigneeRequiredModal(null);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !data) return;
    setIsSaving(true);
    setErrorMessage(null);
    const result = await createTask({
      groupId: data.groupId,
      projectId: resolvedId,
      title: newTaskTitle,
      description: newTaskDesc,
      assigneeId: newTaskAssignee || null,
      dueDate: newTaskDueDate || null,
      position: 0,
    });
    setIsSaving(false);
    if (!result.ok) {
      setErrorMessage(result.error);
      return;
    }

    setShowNewTaskModal(false);
    setNewTaskTitle("");
    setNewTaskDesc("");
    setNewTaskAssignee("");
    setNotification("Đã thêm thẻ nhiệm vụ mới vào cột TO DO!");
    setTimeout(() => setNotification(null), 3000);
    refresh();
  };

  const todoTasks = tasks.filter((t) => t.status === "todo");
  const doingTasks = tasks.filter((t) => t.status === "doing");
  const doneTasks = tasks.filter((t) => t.status === "done");

  const eventLabels: Record<string, string> = {
    created: "Đã tạo thẻ",
    assigned: "Đã đổi người phụ trách",
    status_changed: "Đã cập nhật trạng thái",
    due_changed: "Đã đổi hạn hoàn thành",
    edited: "Đã chỉnh sửa thẻ",
    archived: "Đã lưu trữ thẻ",
  };
  const taskLogs: TaskEventLog[] = (data.events ?? []).map((event) => {
    const actor = data.members.find((member) => member.student_id === event.actor_id);
    return {
      id: String(event.id),
      time: formatDateTime(readString(event, "occurred_at")),
      actorName: readString(actor, "full_name", "Thành viên nhóm"),
      action: eventLabels[readString(event, "event_type")] ?? "Đã cập nhật thẻ",
    };
  });

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            <Link href="/student" className="hover:text-blue-600">Việc của tôi</Link>
            <span>/</span>
            <Link href={`/student/projects/${resolvedId}`} className="hover:text-blue-600">
              {resolvedId || "Dự án"}
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Bảng Kanban</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Bảng Kanban nhóm</h1>
            <Badge variant="info">{readString(data.group, "name", "Nhóm")} · Hạn dự án {formatDate(readString(data.project, "due_on"))}</Badge>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Kéo thả hoặc dùng menu để điều phối công việc giữa các thành viên. Thẻ chuyển sang DOING/DONE bắt buộc có người phụ trách.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/student/projects/${resolvedId}/review`}
            className="px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-2xs"
          >
            ⭐ Đánh giá đồng đẳng
          </Link>
          {data.project.allow_custom_tasks !== false && <button
            onClick={() => setShowNewTaskModal(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs"
          >
            + Thêm thẻ nhiệm vụ
          </button>}
        </div>
      </div>

      {errorMessage && (
        <div role="alert" className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg">
          {errorMessage}
        </div>
      )}

      {notification && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-xs rounded-lg flex items-center justify-between">
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} className="font-bold">✕</button>
        </div>
      )}

      {/* 3 Cột Kanban: TO DO, DOING, DONE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
        {/* Cột 1: TO DO */}
        <div className="bg-slate-100/80 rounded-xl p-4 border border-slate-200 flex flex-col min-h-[480px]">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">TO DO</h3>
            </div>
            <span className="text-xs font-bold bg-white text-slate-600 px-2 py-0.5 rounded-full border">
              {todoTasks.length}
            </span>
          </div>

          <div className="space-y-3 flex-1">
            {todoTasks.length === 0 && <p className="text-xs text-slate-500 text-center py-8">Chưa có nhiệm vụ cần làm.</p>}
            {todoTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs hover:border-blue-400 hover:shadow-xs cursor-pointer transition-all space-y-2"
              >
                <div className="text-xs font-semibold text-slate-900 leading-snug">
                  {task.title}
                </div>

                <div className="flex items-center gap-1 flex-wrap">
                  {task.curriculumTags.map((tag) => (
                    <span key={tag} className="px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded text-[10px] font-mono">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <span className={task.assigneeName ? "font-medium text-slate-700" : "italic text-slate-400"}>
                    👤 {task.assigneeName || "Chưa giao"}
                  </span>
                  <span className="font-mono">Hạn: {task.dueDate}</span>
                </div>

                {/* Mobile/Quick action menu */}
                <div className="pt-2 flex items-center justify-end gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMoveStatus(task, "doing");
                    }}
                    className="px-2 py-0.8 text-[11px] bg-blue-50 text-blue-700 hover:bg-blue-100 rounded font-medium"
                  >
                    Làm việc này →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cột 2: DOING */}
        <div className="bg-blue-50/60 rounded-xl p-4 border border-blue-200 flex flex-col min-h-[480px]">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-blue-200">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-blue-900">DOING</h3>
            </div>
            <span className="text-xs font-bold bg-white text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
              {doingTasks.length}
            </span>
          </div>

          <div className="space-y-3 flex-1">
            {doingTasks.length === 0 && <p className="text-xs text-blue-700 text-center py-8">Chưa có nhiệm vụ đang làm.</p>}
            {doingTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className="bg-white p-3.5 rounded-lg border border-blue-200 shadow-2xs hover:border-blue-400 hover:shadow-xs cursor-pointer transition-all space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="text-xs font-semibold text-slate-900 leading-snug">
                    {task.title}
                  </div>
                  {task.isOverdue && (
                    <span className="px-1.5 py-0.2 bg-red-100 text-red-700 text-[10px] font-bold rounded shrink-0">
                      ! Trễ
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 flex-wrap">
                  {task.curriculumTags.map((tag) => (
                    <span key={tag} className="px-1.5 py-0.2 bg-blue-50 text-blue-700 rounded text-[10px] font-mono">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <span className="font-medium text-blue-900">
                    👤 {task.assigneeName}
                  </span>
                  <span className={task.isOverdue ? "text-red-600 font-bold font-mono" : "font-mono"}>
                    Hạn: {task.dueDate}
                  </span>
                </div>

                {/* Quick actions */}
                <div className="pt-2 flex items-center justify-between gap-1.5 border-t border-slate-50">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMoveStatus(task, "todo");
                    }}
                    className="px-2 py-0.8 text-[11px] text-slate-600 hover:bg-slate-100 rounded"
                  >
                    ← Trả về
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMoveStatus(task, "done");
                    }}
                    className="px-2 py-0.8 text-[11px] bg-green-50 text-green-700 hover:bg-green-100 rounded font-medium"
                  >
                    ✓ Đã xong →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cột 3: DONE */}
        <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-200 flex flex-col min-h-[480px]">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-emerald-200">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-900">DONE</h3>
            </div>
            <span className="text-xs font-bold bg-white text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
              {doneTasks.length}
            </span>
          </div>

          <div className="space-y-3 flex-1">
            {doneTasks.length === 0 && <p className="text-xs text-emerald-700 text-center py-8">Chưa có nhiệm vụ hoàn thành.</p>}
            {doneTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className="bg-white p-3.5 rounded-lg border border-emerald-200 shadow-2xs hover:border-emerald-400 hover:shadow-xs cursor-pointer transition-all space-y-2 opacity-95"
              >
                <div className="text-xs font-semibold text-slate-800 line-through decoration-slate-400 leading-snug">
                  {task.title}
                </div>

                <div className="flex items-center gap-1 flex-wrap">
                  {task.curriculumTags.map((tag) => (
                    <span key={tag} className="px-1.5 py-0.2 bg-emerald-50 text-emerald-700 rounded text-[10px] font-mono">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="text-[11px] text-emerald-800 pt-1 border-t border-slate-100 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span>👤 {task.assigneeName}</span>
                    <span className="text-emerald-600 font-bold">✓ Hoàn thành</span>
                  </div>
                  {task.completedAt && (
                    <div className="text-[10px] text-slate-400 font-mono">
                      Xong lúc: {task.completedAt}
                    </div>
                  )}
                </div>

                {/* Reopen action */}
                <div className="pt-2 flex justify-start">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMoveStatus(task, "doing");
                    }}
                    className="px-2 py-0.8 text-[10px] text-slate-500 hover:bg-slate-100 rounded"
                    title="Mở lại thẻ nếu cần bổ sung"
                  >
                    ↺ Mở lại thẻ
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Chi tiết thẻ + 5 Sự kiện nhật ký */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600">
                  {selectedTask.id} · Cột {selectedTask.status.toUpperCase()}
                </span>
                <h3 className="text-base font-bold text-gray-900 mt-1">{selectedTask.title}</h3>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-gray-400 hover:text-gray-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-semibold text-gray-700 block mb-1">Mô tả công việc:</span>
                <p className="p-3 bg-gray-50 rounded-lg text-gray-600 leading-relaxed">
                  {selectedTask.description || "Không có mô tả chi tiết."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="font-semibold text-gray-700 block">Người phụ trách:</span>
                  <span className="text-gray-900">{selectedTask.assigneeName || "Chưa có"}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700 block">Hạn hoàn thành:</span>
                  <span className={selectedTask.isOverdue ? "text-red-600 font-bold" : "text-gray-900"}>
                    {selectedTask.dueDate} {selectedTask.isOverdue && "(Quá hạn)"}
                  </span>
                </div>
              </div>

              {selectedTask.completedAt && (
                <div>
                  <span className="font-semibold text-gray-700 block">Thời điểm hoàn thành (immutable):</span>
                  <span className="text-emerald-700 font-mono font-medium">{selectedTask.completedAt}</span>
                </div>
              )}

              {/* 5 sự kiện nhật ký gần nhất */}
              <div className="pt-2 border-t">
                <span className="font-semibold text-gray-700 block mb-2">Nhật ký hoạt động trên thẻ:</span>
                <div className="space-y-1.5 text-[11px]">
                  {taskLogs.length === 0 && <p className="text-gray-400">Chưa có hoạt động nào trên thẻ.</p>}
                  {taskLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between text-gray-500 py-1 border-b border-gray-50">
                      <span><strong>{log.actorName}</strong>: {log.action}</span>
                      <span className="font-mono text-gray-400">{log.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Bắt buộc gán người phụ trách khi chuyển sang DOING/DONE (Scenario 3) */}
      {assigneeRequiredModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-gray-900">Yêu cầu người phụ trách</h3>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
              Quy tắc hệ thống: Để chuyển thẻ sang cột <strong>{assigneeRequiredModal.targetStatus.toUpperCase()}</strong>, nhiệm vụ bắt buộc phải được phân công cho một thành viên trong nhóm.
            </div>

            <div className="space-y-2 text-xs">
              <label className="block font-medium text-gray-700">Chọn thành viên phụ trách:</label>
              <select
                value={tempAssignee}
                onChange={(e) => setTempAssignee(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500"
              >
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {!assigneeRequiredModal.task.dueAt && (
              <div className="space-y-2 text-xs">
                <label className="block font-medium text-gray-700" htmlFor="task-due-date">Hạn hoàn thành</label>
                <input
                  id="task-due-date"
                  type="date"
                  required
                  value={tempDueDate}
                  onChange={(e) => setTempDueDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAssigneeRequiredModal(null)}
                className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmAssignee}
                disabled={isSaving}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                Xác nhận & Chuyển thẻ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Thêm thẻ mới */}
      {showNewTaskModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-gray-900">Thêm thẻ nhiệm vụ mới</h3>
            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Tiêu đề nhiệm vụ</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Thiết kế giao diện trang chủ"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Mô tả chi tiết</label>
                <textarea
                  rows={2}
                  placeholder="Nội dung cần thực hiện..."
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Người phụ trách (tùy chọn)</label>
                  <select
                    value={newTaskAssignee}
                    onChange={(e) => setNewTaskAssignee(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Chưa giao --</option>
                    {teamMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">Hạn hoàn thành</label>
                  <input
                    type="date"
                    required
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewTaskModal(false)}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  Tạo thẻ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
