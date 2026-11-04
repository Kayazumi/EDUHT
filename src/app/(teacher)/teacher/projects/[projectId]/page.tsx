// [FE] Tổng quan dự án · tài liệu mục 3.3, 4.5 và A3.3
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function TeacherProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const [resolvedId, setResolvedId] = useState("");
  const [status, setStatus] = useState<"draft" | "active" | "closed">("active");

  React.useEffect(() => {
    params.then((p) => {
      setResolvedId(p.projectId);
      if (p.projectId.includes("p03")) setStatus("draft");
      else if (p.projectId.includes("p00")) setStatus("closed");
      else setStatus("active");
    });
  }, [params]);

  const project = {
    id: resolvedId || "proj-p01",
    title: "Xây dựng Trang web cá nhân môn Tin học 10",
    className: "10A1",
    weightGroup: 0.6,
    weightPeer: 0.4,
    minGroupSize: 4,
    maxGroupSize: 5,
    startDate: "2026-10-01",
    endDate: "2026-11-20",
    status,
    // Trạng thái kiểm tra 5 điều kiện ở mục 7.1
    conditions: [
      { id: 1, text: "Mỗi nhiệm vụ mẫu có ít nhất một YCCĐ", ready: true, href: `/teacher/projects/${resolvedId || "proj-p01"}/tasks` },
      { id: 2, text: "Đã thiết lập trọng số a (weight_group = 0.6)", ready: true, href: "#" },
      { id: 3, text: "Mọi nhóm có số thành viên trong khoảng [4, 5]", ready: true, href: `/teacher/projects/${resolvedId || "proj-p01"}/groups` },
      { id: 4, text: "Tất cả các nhóm đã được bấm Khóa", ready: true, href: `/teacher/projects/${resolvedId || "proj-p01"}/groups` },
      { id: 5, text: "Đã chạy sinh thẻ việc tự động cho các nhóm", ready: true, href: `/teacher/projects/${resolvedId || "proj-p01"}/groups` },
    ],
  };

  const allConditionsMet = project.conditions.every((c) => c.ready);

  const handleActivateProject = () => {
    if (!allConditionsMet) {
      alert("Chưa đủ 5 điều kiện tiên quyết để kích hoạt dự án!");
      return;
    }
    if (confirm("KÍCH HOẠT DỰ ÁN: Thao tác này sẽ chuyển trạng thái sang Active. Trọng số a, nhóm và kho nhiệm vụ mẫu sẽ bị khóa để bảo toàn dữ liệu. Bạn có chắc chắn muốn kích hoạt?")) {
      setStatus("active");
    }
  };

  const handleCloseProject = () => {
    if (confirm("ĐÓNG DỰ ÁN: Thao tác này là một chiều. Toàn bộ thẻ việc sẽ chuyển sang chế độ chỉ đọc. Bạn có chắc muốn đóng dự án?")) {
      setStatus("closed");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/teacher/projects" className="hover:underline">
              Dự án của tôi
            </Link>
            <span>/</span>
            <span className="font-semibold text-slate-900">{project.title}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <span>{project.title}</span>
            {project.status === "active" && <Badge variant="success">Active (Đang chạy)</Badge>}
            {project.status === "draft" && <Badge variant="warning">Draft (Bản nháp)</Badge>}
            {project.status === "closed" && <Badge variant="default">Closed (Đã kết thúc)</Badge>}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Áp dụng cho lớp <strong>{project.className}</strong> • Thời gian: {project.startDate} đến {project.endDate}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {project.status === "draft" && (
            <button
              onClick={handleActivateProject}
              disabled={!allConditionsMet}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm"
            >
              🚀 Kích hoạt dự án (Active)
            </button>
          )}
          {project.status === "active" && (
            <button
              onClick={handleCloseProject}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm"
            >
              🔒 Đóng dự án (Closed)
            </button>
          )}
        </div>
      </div>

      {/* THANH 5 BƯỚC QUY TRÌNH DỰ ÁN PBL */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Tiến trình quy trình 5 bước PBL
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <Link
            href={`/teacher/projects/${project.id}/tasks`}
            className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 transition-colors"
          >
            <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
              <span>1. Kho nhiệm vụ</span>
              <span>✓</span>
            </div>
            <p className="text-[11px] text-emerald-700 mt-1">Đã gắn mã YCCĐ</p>
          </Link>

          <Link
            href={`/teacher/projects/${project.id}/groups`}
            className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 transition-colors"
          >
            <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
              <span>2. Lập nhóm</span>
              <span>✓</span>
            </div>
            <p className="text-[11px] text-emerald-700 mt-1">7 nhóm (4-5 HS)</p>
          </Link>

          <Link
            href={`/teacher/projects/${project.id}/groups`}
            className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 transition-colors"
          >
            <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
              <span>3. Khóa & Sinh thẻ</span>
              <span>✓</span>
            </div>
            <p className="text-[11px] text-emerald-700 mt-1">Đã sinh thẻ tự động</p>
          </Link>

          <div
            className={`p-3 rounded-lg border ${
              project.status === "active" || project.status === "closed"
                ? "border-emerald-200 bg-emerald-50/50"
                : "border-slate-200 bg-slate-50"
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold text-slate-900">
              <span>4. Kích hoạt</span>
              <span>{project.status === "active" ? "✓" : "⏳"}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {project.status === "active" ? "Dự án đang chạy" : "Chờ kích hoạt"}
            </p>
          </div>

          <Link
            href={`/teacher/projects/${project.id}/grading`}
            className="p-3 rounded-lg border border-indigo-200 bg-indigo-50/40 hover:bg-indigo-50 transition-colors"
          >
            <div className="flex items-center justify-between text-xs font-bold text-indigo-900">
              <span>5. Đánh giá BARS</span>
              <span>🎯</span>
            </div>
            <p className="text-[11px] text-indigo-700 mt-1">Chấm điểm & Công bố</p>
          </Link>
        </div>
      </div>

      {/* Điều kiện kích hoạt (Chỉ hiện khi Draft) */}
      {project.status === "draft" && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-3">
          <span className="font-bold text-amber-950 text-xs uppercase tracking-wide block">
            5 Điều kiện bắt buộc để Kích hoạt dự án (Mục 7.1):
          </span>
          <div className="space-y-2">
            {project.conditions.map((c) => (
              <div key={c.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className={c.ready ? "text-emerald-700 font-bold" : "text-amber-700"}>
                    {c.ready ? "✓" : "○"}
                  </span>
                  <span className={c.ready ? "text-slate-800" : "text-amber-900 font-semibold"}>
                    {c.text}
                  </span>
                </div>
                {!c.ready && (
                  <Link href={c.href} className="text-indigo-600 hover:underline font-semibold">
                    Cần hoàn thành →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LỐI TẮT VÀO CÁC PHÂN HỆ CỦA DỰ ÁN */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          href={`/teacher/projects/${project.id}/dashboard`}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-400 transition-colors space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-slate-900">Bảng điều khiển tiến độ</span>
            <span className="text-lg">📊</span>
          </div>
          <p className="text-xs text-slate-500">
            Theo dõi tiến độ Kanban các nhóm, cảnh báo trễ hạn và chỉ báo đóng góp cá nhân
          </p>
        </Link>

        <Link
          href={`/teacher/projects/${project.id}/tasks`}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-400 transition-colors space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-slate-900">Kho nhiệm vụ & Độ phủ YCCĐ</span>
            <span className="text-lg">📋</span>
          </div>
          <p className="text-xs text-slate-500">
            Quản lý các thẻ việc mẫu và ma trận bao phủ yêu cầu cần đạt Tin học 2018
          </p>
        </Link>

        <Link
          href={`/teacher/projects/${project.id}/groups`}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-400 transition-colors space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-slate-900">Quản lý nhóm học sinh</span>
            <span className="text-lg">👥</span>
          </div>
          <p className="text-xs text-slate-500">
            Chia nhóm, kiểm tra quy mô [min, max], khóa nhóm và quan sát bảng Kanban từng nhóm
          </p>
        </Link>

        <Link
          href={`/teacher/projects/${project.id}/evaluation`}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-400 transition-colors space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-slate-900">Đợt đánh giá đồng đẳng BARS</span>
            <span className="text-lg">🎯</span>
          </div>
          <p className="text-xs text-slate-500">
            Mở đợt đánh giá, theo dõi tiến độ nộp phiếu và chốt đợt (finalize_round)
          </p>
        </Link>

        <Link
          href={`/teacher/projects/${project.id}/grading`}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-400 transition-colors space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-slate-900">Chấm điểm & Đối chiếu</span>
            <span className="text-lg">✍️</span>
          </div>
          <p className="text-xs text-slate-500">
            Chấm điểm nhóm, tính điểm cá nhân, đối chiếu chỉ số tiến trình và công bố điểm
          </p>
        </Link>

        <Link
          href={`/teacher/projects/${project.id}/export`}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-400 transition-colors space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-slate-900">Xuất báo cáo & Bảng điểm</span>
            <span className="text-lg">📥</span>
          </div>
          <p className="text-xs text-slate-500">
            Xuất file CSV/Excel tổng hợp điểm tính, điểm chỉnh, lý do và ảnh chụp tiến trình
          </p>
        </Link>
      </div>
    </div>
  );
}
