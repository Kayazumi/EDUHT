// [FE] Bảng Kanban nhóm học sinh · tài liệu mục 3.3, 4.5 và A3.4
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface KanbanTask {
  id: string;
  title: string;
  description: string;
  status: "todo" | "doing" | "done";
  assigneeId: string | null;
  assigneeName: string | null;
  dueDate: string;
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
  const [tasks, setTasks] = useState<KanbanTask[]>([
    {
      id: "tk-1",
      title: "Viết kịch bản hội thoại mẫu cho chatbot",
      description: "Xây dựng 20 kịch bản hội thoại mẫu tương tác câu hỏi Tin học 12",
      status: "todo",
      assigneeId: null,
      assigneeName: null,
      dueDate: "2026-11-12",
      isOverdue: false,
      curriculumTags: ["DL-01", "CS-02"],
    },
    {
      id: "tk-2",
      title: "Thiết kế poster giới thiệu sản phẩm",
      description: "Dùng Canva hoặc Figma thiết kế poster khổ A1 theo nhận diện dự án",
      status: "todo",
      assigneeId: "hs2",
      assigneeName: "Trần Thị Bình",
      dueDate: "2026-11-14",
      isOverdue: false,
      curriculumTags: ["ICT-01"],
    },
    {
      id: "tk-3",
      title: "Dựng slide thuyết trình giai đoạn 1",
      description: "Slide trình chiếu cấu trúc kiến trúc và demo hoạt động chatbot",
      status: "doing",
      assigneeId: "hs3",
      assigneeName: "Lê Hoàng Cường",
      dueDate: "2026-11-02",
      isOverdue: true, // Thẻ quá hạn
      curriculumTags: ["ICT-03"],
    },
    {
      id: "tk-4",
      title: "Tích hợp API xử lý ngôn ngữ tự nhiên",
      description: "Gắn API kết nối mô hình xử lý ngôn ngữ và phân loại câu hỏi",
      status: "doing",
      assigneeId: "hs1",
      assigneeName: "Nguyễn Văn An (Tôi)",
      dueDate: "2026-11-06",
      isOverdue: false,
      curriculumTags: ["CS-01"],
    },
    {
      id: "tk-5",
      title: "Thu thập tập dữ liệu câu hỏi lý thuyết",
      description: "Biên tập 100 câu hỏi trắc nghiệm Tin học 12 định dạng JSON",
      status: "done",
      assigneeId: "hs2",
      assigneeName: "Trần Thị Bình",
      dueDate: "2026-10-28",
      completedAt: "2026-10-27 15:30",
      isOverdue: false,
      curriculumTags: ["DL-01"],
    },
    {
      id: "tk-6",
      title: "Thiết lập môi trường mã nguồn Git & Kanban",
      description: "Khởi tạo repo và phân chia các cột công việc ban đầu",
      status: "done",
      assigneeId: "hs1",
      assigneeName: "Nguyễn Văn An (Tôi)",
      dueDate: "2026-10-20",
      completedAt: "2026-10-19 10:15",
      isOverdue: false,
      curriculumTags: ["ICT-02"],
    },
  ]);

  const teamMembers = [
    { id: "hs1", name: "Nguyễn Văn An (Tôi)" },
    { id: "hs2", name: "Trần Thị Bình" },
    { id: "hs3", name: "Lê Hoàng Cường" },
  ];

  // Modals state
  const [selectedTask, setSelectedTask] = useState<KanbanTask | null>(null);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("2026-11-15");

  // Modal yêu cầu gán người phụ trách khi chuyển sang doing/done (Kịch bản 3)
  const [assigneeRequiredModal, setAssigneeRequiredModal] = useState<{
    task: KanbanTask;
    targetStatus: "doing" | "done";
  } | null>(null);
  const [tempAssignee, setTempAssignee] = useState("");

  const [notification, setNotification] = useState<string | null>(null);

  React.useEffect(() => {
    params.then((p) => setResolvedId(p.projectId));
  }, [params]);

  // Quy tắc nghiệp vụ A3.4 & Scenario 3: Chuyển sang DOING hoặc DONE BẮT BUỘC có assignee
  const handleMoveStatus = (task: KanbanTask, targetStatus: "todo" | "doing" | "done") => {
    if (task.status === targetStatus) return;

    if ((targetStatus === "doing" || targetStatus === "done") && !task.assigneeId) {
      // Yêu cầu chọn người phụ trách trước
      setAssigneeRequiredModal({ task, targetStatus });
      setTempAssignee(teamMembers[0]?.id || "");
      return;
    }

    applyTaskStatusMove(task.id, targetStatus, task.assigneeId, task.assigneeName);
  };

  const applyTaskStatusMove = (
    taskId: string,
    targetStatus: "todo" | "doing" | "done",
    assigneeId: string | null,
    assigneeName: string | null
  ) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nowStr = new Date().toLocaleString("vi-VN");
          return {
            ...t,
            status: targetStatus,
            assigneeId: assigneeId ?? t.assigneeId,
            assigneeName: assigneeName ?? t.assigneeName,
            completedAt: targetStatus === "done" ? nowStr : undefined,
          };
        }
        return t;
      })
    );

    const actionText =
      targetStatus === "doing" ? "ĐANG LÀM" : targetStatus === "done" ? "HOÀN THÀNH" : "CHỜ LÀM";
    setNotification(`Đã chuyển thẻ sang cột [${actionText}]!`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleConfirmAssignee = () => {
    if (!assigneeRequiredModal) return;
    const member = teamMembers.find((m) => m.id === tempAssignee);
    applyTaskStatusMove(
      assigneeRequiredModal.task.id,
      assigneeRequiredModal.targetStatus,
      tempAssignee,
      member ? member.name : null
    );
    setAssigneeRequiredModal(null);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const member = teamMembers.find((m) => m.id === newTaskAssignee);
    const newTask: KanbanTask = {
      id: `tk-${tasks.length + 1}`,
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim(),
      status: "todo",
      assigneeId: newTaskAssignee || null,
      assigneeName: member ? member.name : null,
      dueDate: newTaskDueDate,
      isOverdue: false,
      curriculumTags: ["CS- tự do"],
    };

    setTasks([newTask, ...tasks]);
    setShowNewTaskModal(false);
    setNewTaskTitle("");
    setNewTaskDesc("");
    setNewTaskAssignee("");
    setNotification("Đã thêm thẻ nhiệm vụ mới vào cột TO DO!");
    setTimeout(() => setNotification(null), 3000);
  };

  const todoTasks = tasks.filter((t) => t.status === "todo");
  const doingTasks = tasks.filter((t) => t.status === "doing");
  const doneTasks = tasks.filter((t) => t.status === "done");

  const taskLogs: TaskEventLog[] = [
    { id: "l1", time: "Hôm nay 10:15", actorName: "Nguyễn Văn An", action: "Đã cập nhật mô tả thẻ" },
    { id: "l2", time: "Hôm qua 16:40", actorName: "Trần Thị Bình", action: "Đã nhận phụ trách nhiệm vụ" },
    { id: "l3", time: "28/10 09:20", actorName: "Lê Hoàng Cường", action: "Đã đổi hạn hoàn thành" },
  ];

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
            <Badge variant="info">Nhóm 01 · Còn 18 ngày</Badge>
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
          <button
            onClick={() => setShowNewTaskModal(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs"
          >
            + Thêm thẻ nhiệm vụ
          </button>
        </div>
      </div>

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
