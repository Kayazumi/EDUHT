// [FE] Tổng quan dự án học sinh · tài liệu mục 3.3, 4.5 và A3.4
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { PortalDataState } from "@/components/ui/portal-data-state";
import { usePortalData } from "@/hooks/use-portal-data";

type DataRow = Record<string, unknown>;

interface StudentProjectData {
  project: DataRow | null;
  group: DataRow | null;
  groupId: string;
  tasks: DataRow[];
  members: DataRow[];
  rounds: DataRow[];
  events: DataRow[];
}

function readString(row: DataRow | null | undefined, key: string, fallback = "") {
  const value = row?.[key];
  return typeof value === "string" ? value : fallback;
}

function readNumber(row: DataRow | null | undefined, key: string, fallback = 0) {
  const value = row?.[key];
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function formatDate(value: string) {
  if (!value) return "Chưa có ngày";
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime()) ? "Chưa có ngày" : new Intl.DateTimeFormat("vi-VN").format(date);
}

export default function StudentProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const [resolvedId, setResolvedId] = useState("");
  const { data, error, isLoading, refresh } = usePortalData<StudentProjectData>("studentProject", resolvedId);

  React.useEffect(() => {
    params.then((p) => setResolvedId(p.projectId));
  }, [params]);

  if (!resolvedId || isLoading) return <PortalDataState label="thông tin dự án" />;
  if (error) return <PortalDataState label="thông tin dự án" error={error} onRetry={refresh} />;
  if (!data?.project || !data.group) {
    return <PortalDataState label="thông tin nhóm trong dự án" error="Không tìm thấy dự án hoặc nhóm của bạn." onRetry={refresh} />;
  }

  const project = data.project;
  const projectId = readString(project, "id", resolvedId);
  const projectStatus = readString(project, "status");
  const statusLabel = projectStatus === "active" ? "Đang diễn ra" : projectStatus === "closed" ? "Đã kết thúc" : "Bản nháp";
  const members = data.members.map((member) => {
    const id = readString(member, "student_id");
    const memberTasks = data.tasks.filter((task) => task.assignee_id === id && task.status === "doing");
    return {
      id,
      name: readString(member, "full_name", "Học sinh"),
      activeTasksCount: memberTasks.length,
      currentTaskTitle: readString(memberTasks[0], "title", "Chưa có nhiệm vụ đang làm"),
    };
  });

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Breadcrumb & Title */}
      <div>
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
          <Link href="/student" className="hover:text-blue-600">Việc của tôi</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Tổng quan dự án</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{readString(project, "title", "Dự án")}</h1>
            <p className="text-xs text-gray-500 mt-1">
              Thời gian: {formatDate(readString(project, "starts_on"))} đến {formatDate(readString(project, "due_on"))}
            </p>
          </div>
          <Badge variant={projectStatus === "active" ? "success" : "default"}>{statusLabel}</Badge>
        </div>
      </div>

      {/* 3 Lối tắt hành động nổi bật */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href={`/student/projects/${projectId}/board`}
          className="p-5 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
        >
          <div>
            <span className="text-2xl block mb-2">📋</span>
            <h3 className="font-bold text-base">Bảng Kanban nhóm</h3>
            <p className="text-xs text-blue-100 mt-1">
              Xem thẻ TO DO, DOING, DONE, nhận việc và kéo thả tiến độ cùng nhóm.
            </p>
          </div>
          <div className="pt-4 text-xs font-semibold text-blue-100 flex items-center gap-1">
            Vào bảng Kanban →
          </div>
        </Link>

        <Link
          href={`/student/projects/${projectId}/review`}
          className="p-5 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
        >
          <div>
            <span className="text-2xl block mb-2">⭐</span>
            <h3 className="font-bold text-base">Đánh giá đồng đẳng</h3>
            <p className="text-xs text-indigo-100 mt-1">
              Thực hiện chấm đồng đẳng BARS cho các bạn trong nhóm theo tiêu chí hành vi.
            </p>
          </div>
          <div className="pt-4 text-xs font-semibold text-indigo-100 flex items-center gap-1">
            Chấm bạn cùng nhóm →
          </div>
        </Link>

        <Link
          href={`/student/projects/${projectId}/results`}
          className="p-5 bg-gradient-to-br from-teal-500 to-emerald-600 text-white rounded-xl shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
        >
          <div>
            <span className="text-2xl block mb-2">📊</span>
            <h3 className="font-bold text-base">Kết quả dự án</h3>
            <p className="text-xs text-teal-100 mt-1">
              Xem điểm nhóm, điểm đồng đẳng, nhận xét và điểm chính thức đã công bố.
            </p>
          </div>
          <div className="pt-4 text-xs font-semibold text-teal-100 flex items-center gap-1">
            Xem kết quả cá nhân →
          </div>
        </Link>
      </div>

      {/* Thông tin nhóm của tôi */}
      <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <span className="text-xs font-semibold uppercase text-blue-600">Nhóm học tập của tôi</span>
            <h2 className="text-lg font-bold text-gray-900">{readString(data.group, "name", "Nhóm")}</h2>
          </div>
          <div className="text-xs text-gray-500">
            {members.length} thành viên
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {members.map((member) => (
            <div
              key={member.id}
              className="p-4 border border-gray-200 rounded-lg bg-gray-50/50 space-y-2 hover:bg-white hover:border-blue-200 transition-colors shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900 text-sm">{member.name}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] text-gray-600 bg-gray-100">Thành viên</span>
              </div>
              <div className="pt-2 border-t border-gray-100 text-xs text-gray-600 space-y-1">
                <div>Đang làm: <strong className="text-gray-900">{member.activeTasksCount} thẻ</strong></div>
                <div className="text-[11px] text-gray-500 truncate" title={member.currentTaskTitle}>
                  📌 {member.currentTaskTitle}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Cấu trúc tính điểm dự án */}
      <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-gray-900">Cơ cấu tính điểm tổng kết dự án</h2>
        <p className="text-xs text-gray-500">
          Điểm cuối cùng của mỗi học sinh được tổng hợp minh bạch từ điểm sản phẩm nhóm và điểm đánh giá đồng đẳng theo trọng số:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 border border-blue-100 bg-blue-50/60 rounded-xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-900 uppercase">Trọng số Điểm nhóm (a)</span>
              <span className="text-xl font-black text-blue-700">{Math.round(readNumber(project, "weight_group") * 100)}%</span>
            </div>
            <p className="text-xs text-blue-800">
              Điểm do giáo viên chấm dựa trên chất lượng sản phẩm chung, báo cáo và buổi thuyết trình của nhóm.
            </p>
          </div>

          <div className="p-4 border border-purple-100 bg-purple-50/60 rounded-xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-900 uppercase">Trọng số Điểm đồng đẳng BARS (b)</span>
              <span className="text-xl font-black text-purple-700">{Math.round(readNumber(project, "weight_peer") * 100)}%</span>
            </div>
            <p className="text-xs text-purple-800">
              Điểm tổng hợp từ đánh giá của các thành viên trong nhóm theo thang đo mỏ neo hành vi (BARS).
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
