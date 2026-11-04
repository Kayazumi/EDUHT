// [FE] Xem chi tiết một nhóm · tài liệu mục 3.3, 4.5 và A3.3
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface GroupTask {
  id: string;
  title: string;
  status: "todo" | "doing" | "done";
  assigneeName: string;
  dueAt: string;
  isLate: boolean;
  reqCode: string;
}

interface GroupEventLog {
  id: string;
  time: string;
  actorName: string;
  taskTitle: string;
  eventType: "status_changed" | "reassigned" | "due_date_changed" | "created";
  detail: string;
}

export default function TeacherProjectGroupDetailPage({
  params,
}: {
  params: Promise<{ projectId: string; groupId: string }>;
}) {
  const [resolvedParams, setResolvedParams] = useState({ projectId: "", groupId: "" });
  const [logFilter, setLogFilter] = useState("all");

  React.useEffect(() => {
    params.then((p) => setResolvedParams(p));
  }, [params]);

  const groupInfo = {
    id: resolvedParams.groupId || "g1",
    name: "Nhóm 01: Sáng tạo Web Tin học",
    projectId: resolvedParams.projectId || "proj-p01",
    members: ["Học Sinh Mẫu 1", "Học Sinh Mẫu 2", "Nguyễn Quang Anh", "Trần Minh Bình"],
    completionRate: 75,
    overdueRate: 14.3,
  };

  const tasks: GroupTask[] = [
    {
      id: "t1",
      title: "Xác định chủ đề, cấu trúc trang web và vẽ wireframe",
      status: "done",
      assigneeName: "Học Sinh Mẫu 1",
      dueAt: "2026-10-10",
      isLate: false,
      reqCode: "10.DL.1",
    },
    {
      id: "t2",
      title: "Thiết kế giao diện HTML5 ngữ nghĩa và định dạng CSS Grid",
      status: "done",
      assigneeName: "Học Sinh Mẫu 2",
      dueAt: "2026-10-18",
      isLate: false,
      reqCode: "10.ICT.1",
    },
    {
      id: "t3",
      title: "Lập trình tương tác JavaScript và kiểm tra hợp lệ dữ liệu",
      status: "doing",
      assigneeName: "Nguyễn Quang Anh",
      dueAt: "2026-11-02",
      isLate: true, // Trễ hạn
      reqCode: "10.CS.1",
    },
    {
      id: "t4",
      title: "Kiểm thử tương thích di động và xuất bản lên GitHub Pages",
      status: "todo",
      assigneeName: "Trần Minh Bình",
      dueAt: "2026-11-15",
      isLate: false,
      reqCode: "10.DL.1",
    },
  ];

  const eventLogs: GroupEventLog[] = [
    {
      id: "l1",
      time: "10:15 - Hôm nay",
      actorName: "Nguyễn Quang Anh",
      taskTitle: "Lập trình tương tác JavaScript",
      eventType: "due_date_changed",
      detail: "Dời hạn chót từ 2026-10-28 sang 2026-11-02",
    },
    {
      id: "l2",
      time: "14:20 - Hôm qua",
      actorName: "Học Sinh Mẫu 2",
      taskTitle: "Thiết kế giao diện HTML5 ngữ nghĩa",
      eventType: "status_changed",
      detail: "Chuyển thẻ sang Đã hoàn thành (Done)",
    },
    {
      id: "l3",
      time: "09:30 - 3 ngày trước",
      actorName: "Học Sinh Mẫu 1",
      taskTitle: "Lập trình tương tác JavaScript",
      eventType: "reassigned",
      detail: "Đổi người phụ trách sang Nguyễn Quang Anh",
    },
  ];

  const handleExportLogsCsv = () => {
    const header = "time,actor,task,event_type,detail\n";
    const body = eventLogs.map((l) => `"${l.time}","${l.actorName}","${l.taskTitle}","${l.eventType}","${l.detail}"`).join("\n");
    const blob = new Blob([header + body], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nhat-ky-nhom-${groupInfo.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const todoTasks = tasks.filter((t) => t.status === "todo");
  const doingTasks = tasks.filter((t) => t.status === "doing");
  const doneTasks = tasks.filter((t) => t.status === "done");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href={`/teacher/projects/${groupInfo.projectId}/groups`} className="hover:underline">
              Danh sách nhóm
            </Link>
            <span>/</span>
            <span>Quan sát nhóm</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <span>{groupInfo.name}</span>
            <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full font-semibold">
              Chế độ quan sát giáo viên (Read-Only)
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Thành viên ({groupInfo.members.length}): {groupInfo.members.join(" • ")}
          </p>
        </div>

        <button
          onClick={handleExportLogsCsv}
          className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold rounded-lg shadow-sm"
        >
          📥 Xuất nhật ký nhóm (.CSV)
        </button>
      </div>

      {/* 2 CHỈ SỐ NHÓM (Mục 7.2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Tỷ lệ hoàn thành nhóm (Completion Rate)
            </span>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">
              {groupInfo.completionRate}%
            </div>
            <span className="text-xs text-slate-400">
              Số thẻ done / Tổng số thẻ hợp lệ ({doneTasks.length}/{tasks.length})
            </span>
          </div>
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
            ✓
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Tỷ lệ trễ hạn nhóm (Overdue Rate)
            </span>
            <div className="text-3xl font-extrabold text-rose-600 mt-1">
              {groupInfo.overdueRate}%
            </div>
            <span className="text-xs text-slate-400">
              Số thẻ trễ / Số thẻ đã xác định kết quả
            </span>
          </div>
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-lg">
            !
          </div>
        </div>
      </div>

      {/* BẢNG KANBAN QUAN SÁT (3 CỘT CHỈ ĐỌC) */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
          Bảng Kanban nhóm (Giáo viên quan sát theo thời gian thực)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* CỘT TO DO */}
          <div className="bg-slate-100 rounded-xl p-4 flex flex-col space-y-3">
            <div className="flex items-center justify-between font-bold text-xs text-slate-700 uppercase tracking-wide border-b border-slate-200 pb-2">
              <span>Chờ thực hiện (To Do)</span>
              <span className="bg-slate-200 px-2 py-0.5 rounded-full font-bold">{todoTasks.length}</span>
            </div>
            <div className="space-y-2 flex-1">
              {todoTasks.map((t) => (
                <div key={t.id} className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-1.5 text-xs">
                  <div className="font-semibold text-slate-900 leading-snug">{t.title}</div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-50">
                    <span className="font-medium text-slate-700">{t.assigneeName}</span>
                    <span className="font-mono">Hạn: {t.dueAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CỘT DOING */}
          <div className="bg-slate-100 rounded-xl p-4 flex flex-col space-y-3">
            <div className="flex items-center justify-between font-bold text-xs text-slate-700 uppercase tracking-wide border-b border-slate-200 pb-2">
              <span>Đang thực hiện (Doing)</span>
              <span className="bg-slate-200 px-2 py-0.5 rounded-full font-bold">{doingTasks.length}</span>
            </div>
            <div className="space-y-2 flex-1">
              {doingTasks.map((t) => (
                <div
                  key={t.id}
                  className={`p-3 bg-white rounded-lg border shadow-2xs space-y-1.5 text-xs ${
                    t.isLate ? "border-l-4 border-l-rose-500 border-rose-200" : "border-slate-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <span className="font-semibold text-slate-900 leading-snug">{t.title}</span>
                    {t.isLate && <Badge variant="danger">Quá hạn</Badge>}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-50">
                    <span className="font-medium text-slate-700">{t.assigneeName}</span>
                    <span className="font-mono text-rose-600 font-bold">Hạn: {t.dueAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CỘT DONE */}
          <div className="bg-slate-100 rounded-xl p-4 flex flex-col space-y-3">
            <div className="flex items-center justify-between font-bold text-xs text-slate-700 uppercase tracking-wide border-b border-slate-200 pb-2">
              <span>Đã hoàn thành (Done)</span>
              <span className="bg-slate-200 px-2 py-0.5 rounded-full font-bold">{doneTasks.length}</span>
            </div>
            <div className="space-y-2 flex-1">
              {doneTasks.map((t) => (
                <div key={t.id} className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-1.5 text-xs">
                  <div className="font-semibold text-slate-900 leading-snug line-through text-slate-500">{t.title}</div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-50">
                    <span className="font-medium text-slate-700">{t.assigneeName}</span>
                    <span className="text-emerald-700 font-semibold">✓ Đã xong</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* NHẬT KÝ SỰ KIỆN 4 THAM SỐ (task_events) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Nhật ký sự kiện thẻ việc của nhóm
            </h2>
            <p className="text-xs text-slate-500">
              Ghi nhận tự động khi có chuyển cột, đổi người hoặc dời hạn (phục vụ đối chiếu né trễ hạn)
            </p>
          </div>

          <select
            value={logFilter}
            onChange={(e) => setLogFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
          >
            <option value="all">Tất cả sự kiện</option>
            <option value="status_changed">Chuyển trạng thái</option>
            <option value="due_date_changed">Dời hạn chót</option>
            <option value="reassigned">Đổi người phụ trách</option>
          </select>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {eventLogs.map((log) => (
            <div key={log.id} className="p-3.5 hover:bg-slate-50 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 mr-2">{log.actorName}</span>
                <span className="text-slate-600 mr-2">thao tác trên thẻ:</span>
                <span className="font-semibold text-indigo-700 mr-2">&quot;{log.taskTitle}&quot;</span>
                <span className="font-mono text-slate-500 text-[11px]">({log.detail})</span>
              </div>
              <span className="font-mono text-slate-400 text-[11px] whitespace-nowrap">{log.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
