// [FE] Việc của tôi · tài liệu mục 3.3, 4.5 và A3.4
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { usePortalData } from "@/hooks/use-portal-data";

interface AssignedTask {
  id: string;
  title: string;
  projectId: string;
  projectName: string;
  groupId: string;
  groupName: string;
  status: "todo" | "doing";
  dueDate: string;
  isOverdue: boolean;
  curriculumTags: string[];
}

interface ActiveProject {
  id: string;
  name: string;
  teacherName: string;
  groupName: string;
  totalTasks: number;
  doneTasks: number;
  completionRate: number;
  reviewRound?: {
    id: string;
    name: string;
    closesIn: string; // Đếm ngược
    submittedCount: number;
    totalPeers: number;
  };
}

export default function StudentDashboardPage() {
  const [filterStatus, setFilterStatus] = useState<"all" | "doing" | "todo">("all");

  const [activeProjects, setActiveProjects] = useState<ActiveProject[]>([]);
  const [myTasks, setMyTasks] = useState<AssignedTask[]>([]);
  const { data } = usePortalData<{ projects: any[]; tasks: any[]; groups: any[]; memberships: any[]; teachers: any[]; classes: any[]; rounds: any[] }>("studentDashboard");

  React.useEffect(() => {
    if (!data) return;
    const projects = new Map(data.projects.map((row) => [row.id, row]));
    const groups = new Map(data.groups.map((row) => [row.id, row]));
    const memberships = new Map(data.memberships.map((row) => [row.project_id, row]));
    const classes = new Map(data.classes.map((row) => [row.id, row]));
    const teachers = new Map(data.teachers.map((row) => [row.id, row]));
    const projectCards = data.projects.map((project) => {
      const membership = memberships.get(project.id);
      const group = membership ? groups.get(membership.group_id) : undefined;
      const projectTasks = data.tasks.filter((task) => task.group_id === group?.id);
      const cls = classes.get(project.class_id);
      const teacher = cls ? teachers.get(cls.teacher_id) : undefined;
      const round = data.rounds.find((candidate) => candidate.project_id === project.id && candidate.status === "open");
      return {
        id: project.id, name: project.title, teacherName: teacher?.full_name ?? "",
        groupName: group?.name ?? "Chưa xếp nhóm", totalTasks: projectTasks.length,
        doneTasks: projectTasks.filter((task) => task.status === "done").length,
        completionRate: projectTasks.length ? projectTasks.filter((task) => task.status === "done").length / projectTasks.length : 0,
        ...(round ? { reviewRound: { id: round.id, name: round.title, closesIn: round.closes_at ? new Date(round.closes_at).toLocaleString("vi-VN") : "", submittedCount: 0, totalPeers: 0 } } : {}),
      };
    });
    setActiveProjects(projectCards);
    setMyTasks(data.tasks.filter((task) => task.assignee_id && ["todo", "doing"].includes(task.status)).map((task) => {
      const group = groups.get(task.group_id);
      const project = projects.get(group?.project_id);
      return { id: task.id, title: task.title, projectId: project?.id ?? "", projectName: project?.title ?? "", groupId: group?.id ?? "", groupName: group?.name ?? "", status: task.status, dueDate: task.due_at ?? "", isOverdue: Boolean(task.due_at && new Date(task.due_at) < new Date()), curriculumTags: [] } as AssignedTask;
    }));
  }, [data]);

  const filteredTasks = myTasks.filter((t) => {
    if (filterStatus === "doing") return t.status === "doing";
    if (filterStatus === "todo") return t.status === "todo";
    return true;
  });

  const overdueCount = myTasks.filter((t) => t.isOverdue).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bảng làm việc của tôi</h1>
        <p className="text-sm text-gray-500">
          Theo dõi các nhiệm vụ được phân công trong nhóm dự án và hoàn thành đánh giá đồng đẳng.
        </p>
      </div>

      {/* Banner nhắc nhở đợt đánh giá BARS đang mở */}
      {activeProjects.map((p) =>
        p.reviewRound ? (
          <div
            key={p.id}
            className="p-4 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-200 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">📝</span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-blue-950">
                    Đợt đánh giá đồng đẳng đang mở: {p.reviewRound.name}
                  </h3>
                  <Badge variant="warning">{p.reviewRound.closesIn}</Badge>
                </div>
                <p className="text-xs text-blue-800 mt-0.5">
                  Bạn đã nộp <strong>{p.reviewRound.submittedCount}</strong> / {p.reviewRound.totalPeers} phiếu cho các thành viên trong {p.groupName}.
                </p>
              </div>
            </div>
            <Link
              href={`/student/projects/${p.id}/review`}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs whitespace-nowrap text-center"
            >
              Chấm bạn cùng nhóm ngay →
            </Link>
          </div>
        ) : null
      )}

      {/* Cảnh báo quá hạn nếu có */}
      {overdueCount > 0 && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-red-600 text-base">⚠️</span>
            <span>
              Bạn đang có <strong>{overdueCount}</strong> nhiệm vụ đã quá hạn chót hoàn thành! Vui lòng cập nhật tiến độ hoặc trao đổi với nhóm.
            </span>
          </div>
          <button
            onClick={() => setFilterStatus("doing")}
            className="font-semibold text-red-700 hover:underline underline-offset-2"
          >
            Xem nhiệm vụ trễ
          </button>
        </div>
      )}

      {/* Dự án đang tham gia */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-gray-900">Dự án học tập đang tham gia</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 text-base">{project.name}</h3>
                  <div className="text-xs text-gray-500 mt-1">
                    GVHD: <span className="text-gray-700 font-medium">{project.teacherName}</span>
                  </div>
                </div>
                <Badge variant="info">{project.groupName}</Badge>
              </div>

              {/* Tiến độ nhóm */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>Tiến độ nhóm:</span>
                  <span className="font-bold text-gray-900">
                    {project.doneTasks}/{project.totalTasks} thẻ ({Math.round(project.completionRate * 100)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${Math.round(project.completionRate * 100)}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                <Link
                  href={`/student/projects/${project.id}`}
                  className="flex-1 px-3 py-1.5 text-center text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200"
                >
                  Tổng quan dự án
                </Link>
                <Link
                  href={`/student/projects/${project.id}/board`}
                  className="flex-1 px-3 py-1.5 text-center text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs"
                >
                  Bảng Kanban nhóm →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Nhiệm vụ của tôi */}
      <section className="bg-white border border-gray-200 rounded-xl shadow-xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-gray-900">Nhiệm vụ được giao cho tôi</h2>
            <p className="text-xs text-gray-500">Các thẻ Kanban bạn đang phụ trách hoặc cần thực hiện.</p>
          </div>

          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg text-xs">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                filterStatus === "all" ? "bg-white text-gray-900 shadow-xs" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Tất cả ({myTasks.length})
            </button>
            <button
              onClick={() => setFilterStatus("doing")}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                filterStatus === "doing" ? "bg-white text-gray-900 shadow-xs" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Đang làm ({myTasks.filter((t) => t.status === "doing").length})
            </button>
            <button
              onClick={() => setFilterStatus("todo")}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                filterStatus === "todo" ? "bg-white text-gray-900 shadow-xs" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Chờ làm ({myTasks.filter((t) => t.status === "todo").length})
            </button>
          </div>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-xs">
            Không có nhiệm vụ nào trong mục này.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-gray-50/70 px-2 rounded-lg transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">{task.title}</span>
                    {task.isOverdue && (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-700 flex items-center gap-1">
                        <span>!</span> Quá hạn
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{task.projectName}</span>
                    <span>•</span>
                    <span className="font-medium text-gray-700">{task.groupName}</span>
                    <span>•</span>
                    <span>Hạn: <strong className={task.isOverdue ? "text-red-600" : "text-gray-700"}>{task.dueDate}</strong></span>
                  </div>
                  <div className="flex items-center gap-1 pt-0.5">
                    {task.curriculumTags.map((tag) => (
                      <span key={tag} className="px-1.5 py-0.2 bg-blue-50 text-blue-700 rounded text-[10px] font-mono">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={task.status === "doing" ? "info" : "default"}>
                    {task.status === "doing" ? "Đang làm (DOING)" : "Chờ làm (TO DO)"}
                  </Badge>
                  <Link
                    href={`/student/projects/${task.projectId}/board`}
                    className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    Mở bảng Kanban →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
