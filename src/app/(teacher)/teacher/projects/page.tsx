// [FE] Danh sách dự án giáo viên · tài liệu mục 3.3, 4.5 và A3.3
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface ProjectItem {
  id: string;
  title: string;
  className: string;
  status: "draft" | "active" | "closed";
  startDate: string;
  endDate: string;
  progressPercent: number;
  groupsCount: number;
}

export default function TeacherProjectsPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");

  const [projects, setProjects] = useState<ProjectItem[]>([
    {
      id: "proj-p01",
      title: "Dự án Tin học 10: Xây dựng Trang web cá nhân",
      className: "10A1",
      status: "active",
      startDate: "2026-10-01",
      endDate: "2026-11-20",
      progressPercent: 68,
      groupsCount: 7,
    },
    {
      id: "proj-p02",
      title: "Dự án Tin học 10: Thiết kế ứng dụng Python giải quyết bài toán thực tế",
      className: "10A2",
      status: "active",
      startDate: "2026-10-15",
      endDate: "2026-12-05",
      progressPercent: 42,
      groupsCount: 7,
    },
    {
      id: "proj-p03",
      title: "Dự án Tin học 10: Khảo sát an toàn thông tin mạng",
      className: "10A1",
      status: "draft",
      startDate: "2026-12-01",
      endDate: "2026-12-30",
      progressPercent: 0,
      groupsCount: 0,
    },
    {
      id: "proj-p00",
      title: "Dự án Mẫu: Lập trình game đơn giản với Pygame",
      className: "10A1",
      status: "closed",
      startDate: "2026-09-01",
      endDate: "2026-09-30",
      progressPercent: 100,
      groupsCount: 6,
    },
  ]);

  const handleDelete = (id: string, title: string, status: string) => {
    if (status !== "draft") {
      alert("CHỈ CÓ THỂ XÓA DỰ ÁN Ở TRẠNG THÁI BẢN NHÁP (DRAFT)!");
      return;
    }
    if (confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn dự án bản nháp: "${title}"?`)) {
      setProjects(projects.filter((p) => p.id !== id));
    }
  };

  const filtered = projects.filter((p) => {
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    const matchClass = classFilter === "all" || p.className === classFilter;
    return matchStatus && matchClass;
  });

  return (
    <div className="space-y-6">
      {/* Tiêu đề & Hành động */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Dự án dạy học PBL của tôi
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý quy trình 5 bước: Thiết lập kho nhiệm vụ, Chia nhóm, Kích hoạt, Theo dõi và Chấm điểm BARS
          </p>
        </div>
        <Link
          href="/teacher/projects/new"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm"
        >
          + Khởi tạo dự án mới
        </Link>
      </div>

      {/* Bộ lọc */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-3">
        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">Tất cả lớp học</option>
          <option value="10A1">Lớp 10A1</option>
          <option value="10A2">Lớp 10A2</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang chạy (Active)</option>
          <option value="draft">Bản nháp (Draft)</option>
          <option value="closed">Đã kết thúc (Closed)</option>
        </select>
      </div>

      {/* Bảng danh sách dự án */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Tên dự án</th>
                <th className="py-3 px-4">Lớp học</th>
                <th className="py-3 px-4">Thời gian</th>
                <th className="py-3 px-4 text-center">Số nhóm</th>
                <th className="py-3 px-4">Tiến độ thẻ Kanban</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((proj) => (
                <tr key={proj.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    <Link
                      href={`/teacher/projects/${proj.id}`}
                      className="text-indigo-600 hover:text-indigo-800 hover:underline"
                    >
                      {proj.title}
                    </Link>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    {proj.className}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {proj.startDate} → {proj.endDate}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-slate-700">
                    {proj.groupsCount}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full rounded-full"
                          style={{ width: `${proj.progressPercent}%` }}
                        />
                      </div>
                      <span className="font-semibold text-slate-900">{proj.progressPercent}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {proj.status === "active" && <Badge variant="success">Active</Badge>}
                    {proj.status === "draft" && <Badge variant="warning">Draft</Badge>}
                    {proj.status === "closed" && <Badge variant="default">Closed</Badge>}
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <Link
                      href={`/teacher/projects/${proj.id}`}
                      className="text-xs font-semibold text-indigo-600 hover:underline"
                    >
                      Quản lý
                    </Link>
                    {proj.status === "draft" && (
                      <button
                        onClick={() => handleDelete(proj.id, proj.title, proj.status)}
                        className="text-xs font-semibold text-rose-600 hover:underline"
                      >
                        Xóa
                      </button>
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
