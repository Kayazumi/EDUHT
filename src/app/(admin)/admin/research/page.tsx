// [FE] Đồng ý nghiên cứu và xuất dữ liệu · tài liệu mục 3.3, 4.5 và A3.2
"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface ClassConsentSummary {
  className: string;
  totalStudents: number;
  grantedCount: number;
  pendingCount: number;
  declinedCount: number;
}

interface ExportHistoryItem {
  id: string;
  projectName: string;
  exportedAt: string;
  keyVersion: number;
  rowCount: number;
  note: string;
}

export default function AdminResearchPage() {
  const [selectedProjectId, setSelectedProjectId] = useState("proj-p01");
  const [isExporting, setIsExporting] = useState(false);
  const [exportedData, setExportedData] = useState<unknown[] | null>(null);

  const consentSummaries: ClassConsentSummary[] = [
    { className: "10A1", totalStudents: 35, grantedCount: 33, pendingCount: 2, declinedCount: 0 },
    { className: "10A2", totalStudents: 34, grantedCount: 31, pendingCount: 2, declinedCount: 1 },
    { className: "11A1", totalStudents: 36, grantedCount: 34, pendingCount: 1, declinedCount: 1 },
    { className: "11A2", totalStudents: 35, grantedCount: 32, pendingCount: 3, declinedCount: 0 },
    { className: "12A1", totalStudents: 38, grantedCount: 35, pendingCount: 2, declinedCount: 1 },
  ];

  const exportHistory: ExportHistoryItem[] = [
    {
      id: "exp-1",
      projectName: "Dự án Tin học 10: Xây dựng Trang web cá nhân",
      exportedAt: "2026-11-04 10:05:40",
      keyVersion: 1,
      rowCount: 64,
      note: "Xuất dữ liệu giả danh phục vụ phân tích Chương 4",
    },
    {
      id: "exp-2",
      projectName: "Dự án Tin học 11: Ứng dụng giải quyết bài toán thực tế",
      exportedAt: "2026-10-28 16:30:12",
      keyVersion: 1,
      rowCount: 66,
      note: "Bản xuất dữ liệu đợt kiểm thử sơ bộ",
    },
  ];

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      // Giả lập kết quả xuất dữ liệu đã được giả danh hóa bằng HMAC SHA-256 (INV-09 / Scenario 20)
      const mockPseudoData = [
        {
          pseudo_student_id: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
          pseudo_group_id: "a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e",
          group_score: 8.5,
          peer_score: 8.2,
          peer_missing: false,
          computed_score: 8.35,
          adjusted_score: null,
          final_score: 8.35,
          progress_snapshot: {
            assigned_tasks: 4,
            completed_tasks: 4,
            late_tasks: 0,
            completion_rate: 1.0,
            overdue_rate: 0.0,
            reassign_count: 0,
            postpone_count: 0,
          },
        },
        {
          pseudo_student_id: "872983b5f1424672f7d5dd35ee1428211629a3b623b0f743e4bcfb29e7aecb0a",
          pseudo_group_id: "a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e",
          group_score: 8.5,
          peer_score: 7.5,
          peer_missing: false,
          computed_score: 8.0,
          adjusted_score: null,
          final_score: 8.0,
          progress_snapshot: {
            assigned_tasks: 5,
            completed_tasks: 4,
            late_tasks: 1,
            completion_rate: 0.8,
            overdue_rate: 0.2,
            reassign_count: 1,
            postpone_count: 1,
          },
        },
        {
          pseudo_student_id: "ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb",
          pseudo_group_id: "018f6797a26f63435fa5f9de3c4ff9841f391e6b9a8a76d54cf8bf16db978368",
          group_score: 9.0,
          peer_score: null,
          peer_missing: true,
          computed_score: 9.0,
          adjusted_score: null,
          final_score: 9.0,
          progress_snapshot: {
            assigned_tasks: 3,
            completed_tasks: 3,
            late_tasks: 0,
            completion_rate: 1.0,
            overdue_rate: 0.0,
            reassign_count: 0,
            postpone_count: 0,
          },
        },
      ];

      setExportedData(mockPseudoData);
      setIsExporting(false);
    }, 500);
  };

  const handleDownloadCsv = () => {
    if (!exportedData) return;
    const header = "pseudo_student_id,pseudo_group_id,group_score,peer_score,peer_missing,computed_score,final_score\n";
    const body = (exportedData as { pseudo_student_id: string; pseudo_group_id: string; group_score: number; peer_score: number | null; peer_missing: boolean; computed_score: number; final_score: number }[])
      .map(
        (d) =>
          `"${d.pseudo_student_id}","${d.pseudo_group_id}",${d.group_score},${d.peer_score ?? ""},${d.peer_missing},${d.computed_score},${d.final_score}`
      )
      .join("\n");

    const blob = new Blob([header + body], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pbl-research-dataset-${selectedProjectId}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalAll = consentSummaries.reduce((acc, c) => acc + c.totalStudents, 0);
  const grantedAll = consentSummaries.reduce((acc, c) => acc + c.grantedCount, 0);
  const pendingAll = consentSummaries.reduce((acc, c) => acc + c.pendingCount, 0);
  const declinedAll = consentSummaries.reduce((acc, c) => acc + c.declinedCount, 0);

  return (
    <div className="space-y-6">
      {/* Tiêu đề */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Đồng ý nghiên cứu & Xuất dữ liệu giả danh hóa
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Bảo đảm nguyên tắc đạo đức nghiên cứu sư phạm, theo dõi phiếu đồng ý và trích xuất tập dữ liệu khoa học bằng mã hóa HMAC SHA-256
        </p>
      </div>

      {/* 4 Thống kê tổng hợp đồng ý */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase">Tổng số học sinh</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{totalAll}</div>
          <span className="text-xs text-slate-400">Toàn bộ các lớp tham gia</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-emerald-600 uppercase">Đã đồng ý (Granted)</span>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">
            {grantedAll} <span className="text-xs font-normal text-slate-500">({Math.round((grantedAll / totalAll) * 100)}%)</span>
          </div>
          <span className="text-xs text-emerald-600">Đủ điều kiện xuất dữ liệu</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-amber-600 uppercase">Đang chờ (Pending)</span>
          <div className="text-2xl font-extrabold text-amber-600 mt-1">{pendingAll}</div>
          <span className="text-xs text-slate-500">Cần giáo viên nhắc nhở</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-rose-600 uppercase">Từ chối (Declined)</span>
          <div className="text-2xl font-extrabold text-rose-600 mt-1">{declinedAll}</div>
          <span className="text-xs text-rose-500">Tự động loại khỏi mọi bản xuất</span>
        </div>
      </div>

      {/* Bảng đồng ý nghiên cứu theo từng lớp */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Tiến độ thu thập phiếu đồng ý theo lớp
          </h2>
          <span className="text-xs text-slate-500">Phiên bản phiếu: v1.0 (Năm học 2026-2027)</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Lớp học</th>
                <th className="py-3 px-4 text-center">Sĩ số</th>
                <th className="py-3 px-4 text-center">Đã đồng ý (Granted)</th>
                <th className="py-3 px-4 text-center">Chờ xác nhận (Pending)</th>
                <th className="py-3 px-4 text-center">Từ chối (Declined)</th>
                <th className="py-3 px-4">Tỷ lệ đồng ý</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {consentSummaries.map((c) => {
                const percent = Math.round((c.grantedCount / c.totalStudents) * 100);
                return (
                  <tr key={c.className} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">{c.className}</td>
                    <td className="py-3 px-4 text-center font-semibold text-slate-700">
                      {c.totalStudents}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-700">
                      {c.grantedCount}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-amber-600">
                      {c.pendingCount}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-rose-600">
                      {c.declinedCount}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-emerald-600 h-full rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="font-semibold text-slate-800">{percent}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Khu vực Xuất dữ liệu giả danh hóa */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>🔬 Xuất tập dữ liệu nghiên cứu (Research Dataset Export)</span>
            <Badge variant="info">Chỉ Admin</Badge>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Dữ liệu được trích xuất thông qua thủ tục CSDL <code className="font-mono text-indigo-700 bg-slate-100 px-1 py-0.5 rounded">export_research_dataset()</code>. Học sinh từ chối hoặc đang chờ sẽ bị loại bỏ hoàn toàn (INV-09). Mọi thông tin danh tính được thay thế bằng chuỗi giả danh HMAC SHA-256.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex-1 w-full sm:w-auto">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Chọn dự án PBL cần trích xuất:
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="proj-p01">Dự án Tin học 10: Xây dựng Trang web cá nhân (P01-WEB)</option>
              <option value="proj-p02">Dự án Tin học 11: Ứng dụng giải quyết bài toán thực tế (P02-APP)</option>
              <option value="proj-p03">Dự án Tin học 12: Phân tích dữ liệu học tập với AI (P03-AI)</option>
            </select>
          </div>

          <div className="self-end pt-2 sm:pt-0">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-2"
            >
              <span>{isExporting ? "Đang mã hóa & xuất..." : "⚡ Trích xuất tập dữ liệu"}</span>
            </button>
          </div>
        </div>

        {/* Xem trước kết quả xuất */}
        {exportedData && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                Xem trước dữ liệu giả danh hóa ({exportedData.length} bản ghi):
              </span>
              <button
                onClick={handleDownloadCsv}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5"
              >
                <span>📥 Tải tệp dữ liệu nghiên cứu (.CSV)</span>
              </button>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-x-auto max-h-64 overflow-y-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">Mã giả học sinh (pseudo_student_id)</th>
                    <th className="py-2.5 px-3">Mã giả nhóm (pseudo_group_id)</th>
                    <th className="py-2.5 px-3 text-center">Điểm nhóm</th>
                    <th className="py-2.5 px-3 text-center">Điểm ĐĐ</th>
                    <th className="py-2.5 px-3 text-center">Điểm CN</th>
                    <th className="py-2.5 px-3">Ảnh chụp tiến trình (Progress Snapshot)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {(exportedData as { pseudo_student_id: string; pseudo_group_id: string; group_score: number; peer_score: number | null; final_score: number; progress_snapshot: Record<string, unknown> }[]).map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2 px-3 text-slate-900 font-medium truncate max-w-xs" title={row.pseudo_student_id}>
                        {row.pseudo_student_id.slice(0, 16)}...
                      </td>
                      <td className="py-2 px-3 text-slate-700 truncate max-w-xs" title={row.pseudo_group_id}>
                        {row.pseudo_group_id.slice(0, 16)}...
                      </td>
                      <td className="py-2 px-3 text-center text-slate-900 font-bold">
                        {row.group_score}
                      </td>
                      <td className="py-2 px-3 text-center text-slate-700">
                        {row.peer_score !== null ? row.peer_score : "Thiếu"}
                      </td>
                      <td className="py-2 px-3 text-center text-indigo-700 font-bold">
                        {row.final_score}
                      </td>
                      <td className="py-2 px-3 text-slate-500 font-sans text-[10px]">
                        Hoàn thành: {String(row.progress_snapshot.completed_tasks)}/{String(row.progress_snapshot.assigned_tasks)} thẻ
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Lịch sử trích xuất (Bảng research_exports) */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Nhật ký trích xuất nghiên cứu (research_exports)
          </h3>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3">Thời điểm xuất</th>
                  <th className="py-2 px-3">Dự án</th>
                  <th className="py-2 px-3 text-center">Khóa HMAC</th>
                  <th className="py-2 px-3 text-center">Số dòng</th>
                  <th className="py-2 px-3">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {exportHistory.map((h) => (
                  <tr key={h.id}>
                    <td className="py-2 px-3 font-mono text-slate-500">{h.exportedAt}</td>
                    <td className="py-2 px-3 font-medium text-slate-800">{h.projectName}</td>
                    <td className="py-2 px-3 text-center font-mono">v{h.keyVersion}</td>
                    <td className="py-2 px-3 text-center font-bold text-slate-900">{h.rowCount}</td>
                    <td className="py-2 px-3 text-slate-600">{h.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
