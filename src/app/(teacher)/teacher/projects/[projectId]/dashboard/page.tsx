// [FE] Bảng điều khiển tiến độ dự án · tài liệu mục 3.3, 4.5 và 7.2
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { PortalDataState } from "@/components/ui/portal-data-state";
import { usePortalData } from "@/hooks/use-portal-data";

type DataRow = Record<string, unknown>;

interface TeacherProgressData {
  groups: DataRow[];
  contributions: DataRow[];
  groupDetails: DataRow[];
}

function readString(row: DataRow | null | undefined, key: string, fallback = "") {
  const value = row?.[key];
  return typeof value === "string" ? value : fallback;
}

function readNumber(row: DataRow, key: string) {
  const value = row[key];
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

interface GroupProgressItem {
  id: string;
  name: string;
  totalTasks: number;
  doneTasks: number;
  lateTasks: number;
  completionRate: number;
  overdueRate: number | null; // null nếu mẫu số = 0 (mục 7.2)
}

interface StudentContributionItem {
  studentId: string;
  groupId: string;
  studentName: string;
  groupName: string;
  assignedCount: number;
  doneCount: number;
  lateCount: number;
  completionRate: number;
  overdueRate: number | null;
  reassignCount: number;
  postponeCount: number;
}

export default function TeacherProjectDashboardPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const [resolvedId, setResolvedId] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const { data, error, isLoading, refresh } = usePortalData<TeacherProgressData>("teacherProgress", resolvedId);

  React.useEffect(() => {
    params.then((p) => setResolvedId(p.projectId));
  }, [params]);

  if (!resolvedId || isLoading) return <PortalDataState label="tiến độ dự án" />;
  if (error) return <PortalDataState label="tiến độ dự án" error={error} onRetry={refresh} />;
  if (!data) return <PortalDataState label="tiến độ dự án" error="Không có dữ liệu tiến độ cho dự án này." onRetry={refresh} />;

  const groupNames = new Map(data.groupDetails.map((group) => [readString(group, "id"), readString(group, "name", "Nhóm")]));
  const groupProgressList: GroupProgressItem[] = data.groups.map((row) => ({
    id: readString(row, "group_id"),
    name: readString(row, "group_name", groupNames.get(readString(row, "group_id")) || "Nhóm"),
    totalTasks: readNumber(row, "total_tasks") ?? 0,
    doneTasks: readNumber(row, "done_tasks") ?? 0,
    lateTasks: readNumber(row, "late_tasks") ?? 0,
    completionRate: readNumber(row, "completion_rate") ?? 0,
    overdueRate: readNumber(row, "overdue_rate"),
  }));
  const studentContributions: StudentContributionItem[] = data.contributions.map((row) => ({
    studentId: readString(row, "student_id"),
    groupId: readString(row, "group_id"),
    studentName: readString(row, "student_name", "Học sinh"),
    groupName: groupNames.get(readString(row, "group_id")) || "Nhóm",
    assignedCount: readNumber(row, "assigned_tasks") ?? 0,
    doneCount: readNumber(row, "completed_tasks") ?? 0,
    lateCount: readNumber(row, "late_tasks") ?? 0,
    completionRate: readNumber(row, "individual_completion_rate") ?? 0,
    overdueRate: readNumber(row, "individual_overdue_rate"),
    reassignCount: readNumber(row, "reassign_count") ?? 0,
    postponeCount: readNumber(row, "postpone_count") ?? 0,
  }));
  const totalTasks = groupProgressList.reduce((sum, group) => sum + group.totalTasks, 0);
  const completedTasks = groupProgressList.reduce((sum, group) => sum + group.doneTasks, 0);
  const lateTasks = groupProgressList.reduce((sum, group) => sum + group.lateTasks, 0);
  const groupsToReview = groupProgressList.filter((group) => (group.overdueRate ?? 0) >= 0.3).length;

  const handleExportCsv = () => {
    const header = "student_name,group_name,assigned_tasks,completed_tasks,late_tasks,completion_rate,overdue_rate,reassign_count,postpone_count\n";
    const body = studentContributions
      .map(
        (s) =>
          `"${s.studentName}","${s.groupName}",${s.assignedCount},${s.doneCount},${s.lateCount},${(s.completionRate * 100).toFixed(1)}%,${s.overdueRate !== null ? (s.overdueRate * 100).toFixed(1) + "%" : "Chưa có dữ liệu"},${s.reassignCount},${s.postponeCount}`
      )
      .join("\n");
    const blob = new Blob([header + body], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tien-do-du-an-${resolvedId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredStudents = studentContributions.filter(
    (s) => groupFilter === "all" || s.groupId === groupFilter
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href={`/teacher/projects/${resolvedId}`} className="hover:underline">
              Chi tiết dự án
            </Link>
            <span>/</span>
            <span>Bảng điều khiển tiến độ</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Tiến độ dự án
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Số liệu được tổng hợp từ nhiệm vụ và thành viên của dự án.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Dữ liệu cập nhật trực tiếp</span>
          <button
            onClick={handleExportCsv}
            disabled={studentContributions.length === 0}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold rounded-lg shadow-sm"
          >
            📥 Xuất CSV tiến độ
          </button>
        </div>
      </div>

      {/* KHỐI 1: THẺ TỔNG QUAN DỰ ÁN */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase">Tổng số thẻ Kanban</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{totalTasks} thẻ</div>
          <span className="text-xs text-slate-400">Trong {groupProgressList.length} nhóm</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-emerald-600 uppercase">Tiến độ hoàn thành chung</span>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">{totalTasks ? `${Math.round((completedTasks / totalTasks) * 100)}%` : "—"}</div>
          <span className="text-xs text-slate-400">{completedTasks}/{totalTasks} thẻ hoàn thành</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-rose-600 uppercase">Thẻ trễ hạn hiện tại</span>
          <div className="text-2xl font-extrabold text-rose-600 mt-1">{lateTasks} thẻ</div>
          <span className="text-xs text-rose-500 font-medium">Đã trễ hạn</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-amber-600 uppercase">Nhóm cần can thiệp</span>
          <div className="text-2xl font-extrabold text-amber-600 mt-1">{groupsToReview} nhóm</div>
          <span className="text-xs text-amber-700 font-medium">Tỷ lệ trễ từ 30%</span>
        </div>
      </div>

      {/* KHỐI 2: LƯỚI TIẾN ĐỘ CÁC NHÓM (v_group_progress) */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
          Tiến độ theo nhóm
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {groupProgressList.length === 0 && <p className="col-span-full rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">Dự án chưa có nhóm hoặc chưa có dữ liệu nhiệm vụ.</p>}
          {groupProgressList.map((g) => {
            const isLateWarning = (g.overdueRate ?? 0) >= 0.3;
            return (
              <div
                key={g.id}
                className={`bg-white p-4 rounded-xl border shadow-sm space-y-3 ${
                  isLateWarning ? "border-rose-300 bg-rose-50/20" : "border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900">{g.name}</span>
                  {isLateWarning && <Badge variant="danger">Trễ ≥ 30%</Badge>}
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">Hoàn thành:</span>
                    <span className="font-bold text-slate-800">
                      {Math.round(g.completionRate * 100)}% ({g.doneTasks}/{g.totalTasks})
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full"
                      style={{ width: `${g.completionRate * 100}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between text-xs pt-2 border-t border-slate-100">
                  <span className="text-slate-500">Tỷ lệ trễ hạn:</span>
                  <span
                    className={`font-semibold ${
                      g.overdueRate === null
                        ? "text-slate-400 italic"
                        : isLateWarning
                        ? "text-rose-600 font-bold"
                        : "text-slate-700"
                    }`}
                  >
                    {g.overdueRate !== null
                      ? `${Math.round(g.overdueRate * 100)}%`
                      : "chưa có dữ liệu"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* KHỐI 4: BẢNG CHỈ BÁO TIẾN TRÌNH CÁ NHÂN (v_student_contribution) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Tiến độ theo học sinh
            </h2>
            <p className="text-xs text-slate-500">
              Theo dõi đóng góp thẻ việc, số lần dời hạn và đổi người thực hiện nhằm hỗ trợ nhóm kịp thời
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Lọc nhóm:</span>
            <select
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              className="px-2.5 py-1 text-xs border border-slate-300 rounded-lg bg-white"
            >
              <option value="all">Tất cả nhóm</option>
              {groupProgressList.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Học sinh</th>
                <th className="py-3 px-4">Nhóm</th>
                <th className="py-3 px-4 text-center">Giao / Xong</th>
                <th className="py-3 px-4 text-center">Tỷ lệ xong</th>
                <th className="py-3 px-4 text-center">Tần suất trễ</th>
                <th className="py-3 px-4 text-center">Đổi người</th>
                <th className="py-3 px-4 text-center">Dời hạn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">{studentContributions.length === 0 ? "Chưa có dữ liệu nhiệm vụ được giao." : "Không có học sinh trong nhóm đã chọn."}</td></tr>
              )}
              {filteredStudents.map((s) => (
                <tr key={s.studentId} className="hover:bg-slate-50">
                  <td className="py-2.5 px-4 font-bold text-slate-900">{s.studentName}</td>
                  <td className="py-2.5 px-4 font-semibold text-slate-700">{s.groupName}</td>
                  <td className="py-2.5 px-4 text-center">
                    {s.doneCount} / {s.assignedCount} thẻ
                  </td>
                  <td className="py-2.5 px-4 text-center font-bold text-emerald-700">
                    {Math.round(s.completionRate * 100)}%
                  </td>
                  <td className="py-2.5 px-4 text-center font-semibold">
                    {s.overdueRate !== null ? (
                      <span className={s.overdueRate >= 0.5 ? "text-rose-600 font-bold" : "text-slate-700"}>
                        {Math.round(s.overdueRate * 100)}%
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">chưa có</span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-center font-mono">
                    {s.reassignCount > 0 ? (
                      <span className="bg-amber-50 text-amber-700 font-bold px-1.5 py-0.5 rounded">
                        {s.reassignCount} lần
                      </span>
                    ) : (
                      "0"
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-center font-mono">
                    {s.postponeCount > 0 ? (
                      <span className="bg-rose-50 text-rose-700 font-bold px-1.5 py-0.5 rounded">
                        {s.postponeCount} lần
                      </span>
                    ) : (
                      "0"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
