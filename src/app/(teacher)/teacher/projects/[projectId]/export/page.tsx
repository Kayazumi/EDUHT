// [FE] Xuất báo cáo dự án · tài liệu mục 3.3, 4.5 và A3.3
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface GradeExportRow {
  studentId: string;
  studentCode: string;
  studentName: string;
  groupName: string;
  groupScore: number;
  peerScore: number;
  computedScore: number;
  adjustedScore: number | null;
  finalScore: number;
  adjustReason: string | null;
  resultVersion: number;
  status: "published" | "draft";
}

export default function TeacherProjectExportPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const [resolvedId, setResolvedId] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  React.useEffect(() => {
    params.then((p) => setResolvedId(p.projectId));
  }, [params]);

  const rows: GradeExportRow[] = [
    {
      studentId: "1",
      studentCode: "HS1201",
      studentName: "Nguyễn Văn An",
      groupName: "Nhóm 01 - AI Chatbot",
      groupScore: 8.5,
      peerScore: 9.2,
      computedScore: 8.78,
      adjustedScore: null,
      finalScore: 8.78,
      adjustReason: null,
      resultVersion: 1,
      status: "published",
    },
    {
      studentId: "2",
      studentCode: "HS1202",
      studentName: "Trần Thị Bình",
      groupName: "Nhóm 01 - AI Chatbot",
      groupScore: 8.5,
      peerScore: 8.0,
      computedScore: 8.3,
      adjustedScore: null,
      finalScore: 8.3,
      adjustReason: null,
      resultVersion: 1,
      status: "published",
    },
    {
      studentId: "3",
      studentCode: "HS1203",
      studentName: "Lê Hoàng Cường",
      groupName: "Nhóm 01 - AI Chatbot",
      groupScore: 8.5,
      peerScore: 7.0,
      computedScore: 7.9,
      adjustedScore: 8.2,
      finalScore: 8.2,
      adjustReason: "Có đóng góp kỹ thuật đặc biệt trong phần dựng video",
      resultVersion: 2,
      status: "published",
    },
    {
      studentId: "4",
      studentCode: "HS1204",
      studentName: "Phạm Hải Đăng",
      groupName: "Nhóm 02 - IoT Vườn",
      groupScore: 7.5,
      peerScore: 8.5,
      computedScore: 7.9,
      adjustedScore: null,
      finalScore: 7.9,
      adjustReason: null,
      resultVersion: 1,
      status: "published",
    },
    {
      studentId: "5",
      studentCode: "HS1205",
      studentName: "Hoàng Mỹ Hạnh",
      groupName: "Nhóm 02 - IoT Vườn",
      groupScore: 7.5,
      peerScore: 7.0,
      computedScore: 7.3,
      adjustedScore: null,
      finalScore: 7.3,
      adjustReason: null,
      resultVersion: 1,
      status: "published",
    },
    {
      studentId: "6",
      studentCode: "HS1208",
      studentName: "Bùi Minh Nhật",
      groupName: "Nhóm 03 - Game 2D",
      groupScore: 8.0,
      peerScore: 8.8,
      computedScore: 8.32,
      adjustedScore: null,
      finalScore: 8.32,
      adjustReason: null,
      resultVersion: 1,
      status: "published",
    },
  ];

  const filteredRows = selectedGroup === "all"
    ? rows
    : rows.filter((r) => r.groupName.startsWith(selectedGroup));

  // Tải file CSV với UTF-8 BOM
  const handleExportCSV = () => {
    const header = [
      "Mã học sinh",
      "Họ và tên",
      "Nhóm",
      "Điểm nhóm (a=0.6)",
      "Điểm ĐĐ BARS (b=0.4)",
      "Điểm tính toán",
      "Điểm điều chỉnh",
      "Điểm chính thức",
      "Lý do điều chỉnh",
      "Phiên bản",
      "Trạng thái",
    ];

    const csvRows = filteredRows.map((r) => [
      r.studentCode,
      `"${r.studentName}"`,
      `"${r.groupName}"`,
      r.groupScore.toFixed(1),
      r.peerScore.toFixed(1),
      r.computedScore.toFixed(2),
      r.adjustedScore !== null ? r.adjustedScore.toFixed(2) : "",
      r.finalScore.toFixed(2),
      `"${r.adjustReason || ""}"`,
      `v${r.resultVersion}`,
      r.status === "published" ? "Đã công bố" : "Dự thảo",
    ]);

    const csvContent = "\uFEFF" + [header.join(","), ...csvRows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `bang_diem_${resolvedId || "du_an"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setActionSuccess("Đã xuất bảng điểm thành file CSV thành công (tương thích Microsoft Excel)!");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <main className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200 pb-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link href="/teacher/projects" className="hover:text-blue-600">Dự án</Link>
            <span>/</span>
            <Link href={`/teacher/projects/${resolvedId}`} className="hover:text-blue-600">
              {resolvedId || "Dự án"}
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Xuất báo cáo & Bảng điểm</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Xuất báo cáo dự án</h1>
          <p className="text-sm text-gray-500">
            Xuất bảng điểm chính thức, đối chiếu kết quả tính toán và tạo bản lưu trữ (Snapshot).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm"
          >
            🖨️ In bảng điểm
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 shadow-sm"
          >
            📥 Xuất CSV (Excel)
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm flex items-center justify-between print:hidden">
          <span>{actionSuccess}</span>
          <button onClick={() => setActionSuccess(null)} className="text-green-800 font-bold ml-4">✕</button>
        </div>
      )}

      {/* Bộ lọc */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm print:hidden">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-gray-700">Lọc theo nhóm:</label>
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="text-xs border rounded-lg px-3 py-1.5 bg-white text-gray-700 outline-none"
          >
            <option value="all">Tất cả các nhóm ({rows.length} học sinh)</option>
            <option value="Nhóm 01">Nhóm 01 - AI Chatbot</option>
            <option value="Nhóm 02">Nhóm 02 - IoT Vườn</option>
            <option value="Nhóm 03">Nhóm 03 - Game 2D</option>
          </select>
        </div>

        <div className="text-xs text-gray-500">
          Hiển thị <strong>{filteredRows.length}</strong> / {rows.length} học sinh
        </div>
      </div>

      {/* Bảng điểm in và xem trước */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-4">
        <div className="border-b pb-3">
          <h2 className="text-lg font-bold text-gray-900">Bảng điểm tổng hợp dự án học tập</h2>
          <p className="text-xs text-gray-500">
            Dự án: <strong>{resolvedId}</strong> · Ngày kết xuất: {new Date().toLocaleDateString("vi-VN")}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-gray-600">
            <thead className="bg-gray-50 text-gray-700 uppercase font-semibold border-b">
              <tr>
                <th className="px-3 py-2.5">Mã HS</th>
                <th className="px-3 py-2.5">Họ và tên</th>
                <th className="px-3 py-2.5">Nhóm</th>
                <th className="px-3 py-2.5 text-center">Điểm nhóm</th>
                <th className="px-3 py-2.5 text-center">Điểm BARS</th>
                <th className="px-3 py-2.5 text-center">Điểm tính toán</th>
                <th className="px-3 py-2.5 text-center">Điểm điều chỉnh</th>
                <th className="px-3 py-2.5 text-center font-bold text-gray-900">Điểm chính thức</th>
                <th className="px-3 py-2.5 text-center">Phiên bản</th>
                <th className="px-3 py-2.5 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRows.map((r) => (
                <tr key={r.studentId} className="hover:bg-gray-50">
                  <td className="px-3 py-2.5 font-mono text-gray-700">{r.studentCode}</td>
                  <td className="px-3 py-2.5 font-medium text-gray-900">{r.studentName}</td>
                  <td className="px-3 py-2.5">{r.groupName}</td>
                  <td className="px-3 py-2.5 text-center font-mono">{r.groupScore.toFixed(1)}</td>
                  <td className="px-3 py-2.5 text-center font-mono">{r.peerScore.toFixed(1)}</td>
                  <td className="px-3 py-2.5 text-center font-mono font-semibold">{r.computedScore.toFixed(2)}</td>
                  <td className="px-3 py-2.5 text-center font-mono">
                    {r.adjustedScore !== null ? (
                      <span className="text-amber-600 font-bold" title={r.adjustReason || ""}>
                        {r.adjustedScore.toFixed(2)} *
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-center font-mono font-bold text-sm text-blue-700">
                    {r.finalScore.toFixed(2)}
                  </td>
                  <td className="px-3 py-2.5 text-center text-gray-400">v{r.resultVersion}</td>
                  <td className="px-3 py-2.5 text-center">
                    <Badge variant="success">Đã công bố</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-[11px] text-gray-500 pt-2 border-t flex items-center justify-between">
          <span>* Điểm có dấu sao là điểm đã được giáo viên điều chỉnh kèm lý do lưu trong hệ thống.</span>
          <span>Giáo viên phụ trách ký tên xác nhận</span>
        </div>
      </div>
    </main>
  );
}
