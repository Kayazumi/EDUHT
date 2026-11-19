// [FE] Kết quả đánh giá · tài liệu mục 3.3, 4.5, 7.3 và A3.4
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

interface ResultData extends DataRow {
  criteria_averages?: DataRow[];
}

function readString(row: DataRow | null | undefined, key: string, fallback = "") {
  const value = row?.[key];
  return typeof value === "string" ? value : fallback;
}

function readNumber(row: DataRow | null | undefined, key: string) {
  const value = row?.[key];
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(date);
}

export default function StudentProjectResultsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const [resolvedId, setResolvedId] = useState("");
  const projectPortal = usePortalData<StudentProjectData>("studentProject", resolvedId);
  const resultsPortal = usePortalData<ResultData | null>("studentResults", resolvedId);

  React.useEffect(() => {
    params.then((value) => setResolvedId(value.projectId));
  }, [params]);

  if (!resolvedId || projectPortal.isLoading || resultsPortal.isLoading) return <PortalDataState label="kết quả dự án" />;
  if (projectPortal.error) return <PortalDataState label="thông tin dự án" error={projectPortal.error} onRetry={projectPortal.refresh} />;
  if (resultsPortal.error) return <PortalDataState label="kết quả dự án" error={resultsPortal.error} onRetry={resultsPortal.refresh} />;

  const project = projectPortal.data?.project;
  const group = projectPortal.data?.group;
  const result = resultsPortal.data;
  const projectName = readString(project, "title", "Dự án");
  const groupName = readString(group, "name", "Nhóm của bạn");
  const weightGroup = readNumber(project, "weight_group");
  const weightPeer = readNumber(project, "weight_peer");

  return (
    <div className="space-y-6 max-w-4xl pb-10">
      <div>
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
          <Link href="/student" className="hover:text-blue-600">Việc của tôi</Link>
          <span>/</span>
          <Link href={`/student/projects/${resolvedId}`} className="hover:text-blue-600">Dự án</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Kết quả đánh giá</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Kết quả tổng kết dự án</h1>
        <p className="text-xs text-gray-500 mt-1">Dự án: <strong className="text-gray-700">{projectName}</strong> · {groupName}</p>
      </div>

      {!result ? (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-3xl mx-auto">⏳</div>
          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-lg font-bold text-gray-900">Kết quả chưa được công bố</h2>
            <p className="text-xs text-gray-500 leading-relaxed">Khi giáo viên công bố kết quả cho dự án này, điểm và thông tin liên quan sẽ xuất hiện tại đây.</p>
          </div>
          <Link href={`/student/projects/${resolvedId}/board`} className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold">Xem bảng Kanban nhóm →</Link>
        </div>
      ) : (
        <div className="space-y-6">
          <section className="bg-gradient-to-br from-blue-700 via-indigo-800 to-purple-800 text-white rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/20 pb-6">
              <div>
                <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">Điểm tổng kết chính thức</span>
                <div className="text-4xl sm:text-5xl font-black mt-1 font-mono">
                  {readNumber(result, "final_score")?.toFixed(2) ?? "—"}<span className="text-xl text-blue-200 font-normal ml-1">/ 10</span>
                </div>
              </div>
              <div className="text-xs text-blue-100 sm:text-right">
                <div>Ngày công bố: <strong>{formatDate(readString(result, "published_at")) || "Đã công bố"}</strong></div>
                {result.peer_missing === true && <div className="mt-1"><Badge variant="warning">Chưa có điểm đồng đẳng</Badge></div>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between text-xs text-blue-100 mb-1">
                  <span>Điểm sản phẩm nhóm</span>
                  <span className="font-bold text-white">{weightGroup === null ? "" : `Trọng số ${Math.round(weightGroup * 100)}%`}</span>
                </div>
                <div className="text-2xl font-bold font-mono">{readNumber(result, "group_score")?.toFixed(1) ?? "—"} <span className="text-xs text-blue-200 font-normal">/ 10</span></div>
                <p className="text-[11px] text-blue-200 mt-1">Đánh giá chung cho sản phẩm của {groupName}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between text-xs text-blue-100 mb-1">
                  <span>Điểm đồng đẳng BARS</span>
                  <span className="font-bold text-white">{weightPeer === null ? "" : `Trọng số ${Math.round(weightPeer * 100)}%`}</span>
                </div>
                <div className="text-2xl font-bold font-mono">{readNumber(result, "peer_score")?.toFixed(1) ?? "Chưa có"} <span className="text-xs text-blue-200 font-normal">{readNumber(result, "peer_score") === null ? "" : "/ 10"}</span></div>
                <p className="text-[11px] text-blue-200 mt-1">Điểm từ các phiếu đánh giá đồng đẳng hợp lệ.</p>
              </div>
            </div>

            {weightGroup !== null && weightPeer !== null && (
              <div className="text-xs text-blue-100 bg-black/20 rounded-lg p-3 font-mono">
                Công thức: {weightGroup} × Điểm nhóm + {weightPeer} × Điểm đồng đẳng.
              </div>
            )}
          </section>

          <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">Điểm theo tiêu chí BARS</h2>
              <p className="text-xs text-gray-500 mt-0.5">Điểm trung bình đã công bố cho từng tiêu chí (thang 10).</p>
            </div>
            {(result.criteria_averages ?? []).length === 0 ? (
              <p className="text-xs text-gray-500">Không có dữ liệu tiêu chí được công bố.</p>
            ) : (
              <div className="space-y-4 pt-2">
                {(result.criteria_averages ?? []).map((criterion) => {
                  const score = readNumber(criterion, "avg_points") ?? 0;
                  const percentage = Math.max(0, Math.min(100, score * 10));
                  return (
                    <div key={readString(criterion, "criterion_id")} className="space-y-1.5">
                      <div className="flex items-center justify-between gap-3 text-xs">
                        <span className="font-semibold text-gray-800">{readString(criterion, "criterion_title", "Tiêu chí")}</span>
                        <span className="font-mono font-bold text-blue-700">{score.toFixed(1)} / 10</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full" style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
