// [FE] Tổng quan giáo viên, việc cần làm · tài liệu mục 3.3, 4.5 và A3.3
"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { usePortalData } from "@/hooks/use-portal-data";

export default function TeacherDashboardPage() {
  const { data, error } = usePortalData<{ classes: any[]; projects: any[]; memberships: any[]; groupProgress: any[]; rounds: any[] }>("teacherDashboard");
  const classes = data?.classes ?? [];
  const projects = data?.projects ?? [];
  const myClasses = classes.map((cls) => ({
    ...cls,
    studentCount: data?.memberships.filter((member) => member.class_id === cls.id).length ?? 0,
    projectCount: projects.filter((project) => project.class_id === cls.id).length,
  }));
  const runningProjects = projects.filter((project) => project.status !== "closed").map((project) => {
    const cls = classes.find((item) => item.id === project.class_id);
    const groups = data?.groupProgress.filter((item) => item.project_id === project.id) ?? [];
    const round = data?.rounds.find((item) => item.project_id === project.id && item.status === "open");
    return {
      id: project.id,
      name: project.title,
      status: project.status,
      className: cls?.name ?? "",
      completionRate: groups.length ? Math.round(groups.reduce((sum, item) => sum + Number(item.completion_rate ?? 0), 0) / groups.length * 100) : 0,
      overdueGroupsCount: groups.filter((item) => Number(item.overdue_rate ?? 0) > 0).length,
      totalGroups: groups.length,
      evaluationRound: round
        ? { title: round.title, status: round.status, closesIn: new Date(round.closes_at).toLocaleString("vi-VN"), submittedPercent: 0 }
        : { title: "Chưa mở đợt đánh giá", status: "draft", closesIn: "—", submittedPercent: 0 },
    };
  });
  const actionableTasks = projects.filter((project) => project.status !== "closed").map((project) => {
    const isDraft = project.status === "draft";
    return {
      id: project.id,
      type: isDraft ? "warning" : "info",
      title: isDraft ? `Hoàn thiện dự án: ${project.title}` : `Theo dõi tiến độ: ${project.title}`,
      desc: isDraft ? "Dự án đang ở trạng thái bản nháp. Kiểm tra kho nhiệm vụ và phân nhóm trước khi kích hoạt." : "Xem tiến độ các nhóm và công việc cần hỗ trợ.",
      href: isDraft ? `/teacher/projects/${project.id}/groups` : `/teacher/projects/${project.id}/dashboard`,
      badge: isDraft ? "Bản nháp" : "Đang thực hiện",
    };
  });

  return (
    <div className="space-y-6">
      {/* Tiêu đề & Lối tắt */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Bảng điều khiển Giáo viên
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Theo dõi tiến trình các lớp phụ trách, việc cần làm tự động và cảnh báo dự án
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/teacher/projects/new"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            + Khởi tạo dự án mới
          </Link>
        </div>
      </div>

      {error && <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}

      {/* Mục VIỆC CẦN LÀM (Actionable Items) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-base">⚡</span>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Việc cần làm ưu tiên ({actionableTasks.length})
            </h2>
          </div>
          <span className="text-xs text-slate-400 italic">
            Tự động sinh từ trạng thái CSDL thực tế
          </span>
        </div>

        <div className="space-y-2.5">
          {actionableTasks.map((task) => (
            <div
              key={task.id}
              className={`p-3.5 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                task.type === "urgent"
                  ? "bg-rose-50/50 border-rose-200"
                  : task.type === "warning"
                  ? "bg-amber-50/50 border-amber-200"
                  : "bg-indigo-50/40 border-indigo-200"
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-900">
                    {task.title}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      task.type === "urgent"
                        ? "bg-rose-100 text-rose-700"
                        : task.type === "warning"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-indigo-100 text-indigo-700"
                    }`}
                  >
                    {task.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">{task.desc}</p>
              </div>
              <Link
                href={task.href}
                className="px-3.5 py-1.5 bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 text-xs font-semibold rounded-lg shadow-2xs whitespace-nowrap self-end sm:self-auto"
              >
                Xử lý ngay →
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* DỰ ÁN ĐANG CHẠY */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Dự án PBL đang diễn ra
          </h2>
          <Link
            href="/teacher/projects"
            className="text-xs font-semibold text-indigo-600 hover:underline"
          >
            Xem tất cả dự án →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {runningProjects.map((p) => (
            <div
              key={p.id}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      Lớp {p.className}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">
                      {p.name}
                    </h3>
                  </div>
                  <Badge variant={p.status === "active" ? "success" : "warning"}>{p.status === "active" ? "Active" : "Draft"}</Badge>
                </div>

                {/* Thanh tiến độ */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500 font-medium">Tiến độ hoàn thành thẻ việc</span>
                    <span className="font-bold text-slate-900">{p.completionRate}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full"
                      style={{ width: `${p.completionRate}%` }}
                    />
                  </div>
                </div>

                {/* Đợt đánh giá BARS */}
                <div className="mt-3 p-3 bg-slate-50 rounded-lg text-xs space-y-1">
                  <div className="flex justify-between font-semibold text-slate-700">
                    <span>{p.evaluationRound.title}</span>
                    <span className="text-indigo-600">{p.evaluationRound.closesIn}</span>
                  </div>
                  {p.evaluationRound.status === "open" && (
                    <div className="text-slate-500 text-[11px]">
                      Tiến độ nộp phiếu: <strong>{p.evaluationRound.submittedPercent}%</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Nút hành động */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  {p.totalGroups} nhóm •{" "}
                  {p.overdueGroupsCount > 0 ? (
                    <strong className="text-rose-600">{p.overdueGroupsCount} nhóm có thẻ trễ</strong>
                  ) : (
                    <span className="text-emerald-600 font-medium">Tiến độ tốt</span>
                  )}
                </span>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/teacher/projects/${p.id}/dashboard`}
                    className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold rounded-lg"
                  >
                    Bảng điều khiển
                  </Link>
                  <Link
                    href={`/teacher/projects/${p.id}`}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg"
                  >
                    Quản lý
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* LỚP HỌC PHỤ TRÁCH */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
          Các lớp học đang phụ trách ({myClasses.length} lớp)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {myClasses.map((cls) => (
            <div
              key={cls.id}
              className="p-4 border border-slate-200 rounded-lg hover:border-indigo-400 transition-colors flex items-center justify-between"
            >
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Lớp {cls.name} (Khối {cls.grade})
                </h3>
                <div className="text-xs text-slate-500 mt-1">
                  Sĩ số: <strong>{cls.studentCount}</strong> học sinh • Đang chạy:{" "}
                  <strong>{cls.projectCount}</strong> dự án
                </div>
              </div>
              <Link
                href={`/teacher/classes/${cls.id}`}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg"
              >
                Vào lớp →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
