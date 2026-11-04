// [FE] Bảng điều khiển tiến độ dự án · tài liệu mục 3.3, 4.5 và 7.2
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

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
  const lastUpdated = "14:15 - Hôm nay";

  React.useEffect(() => {
    params.then((p) => setResolvedId(p.projectId));
  }, [params]);

  const groupProgressList: GroupProgressItem[] = [
    { id: "g1", name: "Nhóm 01", totalTasks: 4, doneTasks: 3, lateTasks: 1, completionRate: 0.75, overdueRate: 0.25 },
    { id: "g2", name: "Nhóm 02", totalTasks: 4, doneTasks: 2, lateTasks: 1, completionRate: 0.5, overdueRate: 0.33 },
    { id: "g3", name: "Nhóm 03", totalTasks: 4, doneTasks: 1, lateTasks: 2, completionRate: 0.25, overdueRate: 0.67 }, // Cảnh báo trễ ≥ 30%
    { id: "g4", name: "Nhóm 04", totalTasks: 4, doneTasks: 4, lateTasks: 0, completionRate: 1.0, overdueRate: 0.0 },
    { id: "g5", name: "Nhóm 05", totalTasks: 4, doneTasks: 3, lateTasks: 0, completionRate: 0.75, overdueRate: 0.0 },
    { id: "g6", name: "Nhóm 06", totalTasks: 4, doneTasks: 0, lateTasks: 0, completionRate: 0.0, overdueRate: null }, // Mẫu số 0: chưa có dữ liệu
  ];

  const studentContributions: StudentContributionItem[] = [
    { studentId: "s1", studentName: "Học Sinh Mẫu 1", groupName: "Nhóm 01", assignedCount: 2, doneCount: 2, lateCount: 0, completionRate: 1.0, overdueRate: 0.0, reassignCount: 0, postponeCount: 0 },
    { studentId: "s2", studentName: "Học Sinh Mẫu 2", groupName: "Nhóm 01", assignedCount: 1, doneCount: 1, lateCount: 0, completionRate: 1.0, overdueRate: 0.0, reassignCount: 0, postponeCount: 0 },
    { studentId: "s3", studentName: "Nguyễn Quang Anh", groupName: "Nhóm 01", assignedCount: 1, doneCount: 0, lateCount: 1, completionRate: 0.0, overdueRate: 1.0, reassignCount: 1, postponeCount: 1 },
    { studentId: "s4", studentName: "Trần Minh Bình", groupName: "Nhóm 01", assignedCount: 1, doneCount: 0, lateCount: 0, completionRate: 0.0, overdueRate: null, reassignCount: 0, postponeCount: 0 },
    { studentId: "s5", studentName: "Phạm Thị Dung", groupName: "Nhóm 02", assignedCount: 2, doneCount: 1, lateCount: 1, completionRate: 0.5, overdueRate: 0.5, reassignCount: 0, postponeCount: 0 },
    { studentId: "s6", studentName: "Lê Thị Cúc", groupName: "Nhóm 02", assignedCount: 1, doneCount: 1, lateCount: 0, completionRate: 1.0, overdueRate: 0.0, reassignCount: 0, postponeCount: 0 },
    { studentId: "s7", studentName: "Vũ Văn Hùng", groupName: "Nhóm 03", assignedCount: 2, doneCount: 0, lateCount: 2, completionRate: 0.0, overdueRate: 1.0, reassignCount: 2, postponeCount: 2 },
  ];

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
    a.download = `tien-do-du-an-${resolvedId || "p01"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredStudents = studentContributions.filter(
    (s) => groupFilter === "all" || s.groupName === groupFilter
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href={`/teacher/projects/${resolvedId || "proj-p01"}`} className="hover:underline">
              Chi tiết dự án
            </Link>
            <span>/</span>
            <span>Bảng điều khiển tiến độ</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Bảng điều khiển tiến độ giáo viên (PBL Dashboard)
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Cập nhật thời gian thực theo view <code className="font-mono text-indigo-700">v_group_progress</code> và <code className="font-mono text-indigo-700">v_student_contribution</code>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Cập nhật: {lastUpdated}</span>
          <button
            onClick={handleExportCsv}
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
          <div className="text-2xl font-extrabold text-slate-900 mt-1">24 thẻ</div>
          <span className="text-xs text-slate-400">Phân bổ đều cho 6 nhóm</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-emerald-600 uppercase">Tiến độ hoàn thành chung</span>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">54.2%</div>
          <span className="text-xs text-slate-400">13/24 thẻ đã Done</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-rose-600 uppercase">Thẻ trễ hạn hiện tại</span>
          <div className="text-2xl font-extrabold text-rose-600 mt-1">4 thẻ</div>
          <span className="text-xs text-rose-500 font-medium">Cần nhắc nhở nhóm</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-amber-600 uppercase">Nhóm cần can thiệp</span>
          <div className="text-2xl font-extrabold text-amber-600 mt-1">1 nhóm</div>
          <span className="text-xs text-amber-700 font-medium">Nhóm 03 trễ hạn &gt; 30%</span>
        </div>
      </div>

      {/* KHỐI 2: LƯỚI TIẾN ĐỘ CÁC NHÓM (v_group_progress) */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
          Tiến trình theo nhóm (v_group_progress)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              Chỉ báo tiến trình cá nhân (v_student_contribution)
            </h2>
            <p className="text-xs text-slate-500">
              Theo dõi đóng góp thẻ việc, số lần dời hạn và đổi người (đối chiếu né trễ hạn ở mục 7.2)
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
              <option value="Nhóm 01">Nhóm 01</option>
              <option value="Nhóm 02">Nhóm 02</option>
              <option value="Nhóm 03">Nhóm 03</option>
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
