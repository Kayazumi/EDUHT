// [FE] Bảng đối chiếu Điểm_ĐĐ với chỉ báo tiến trình · tài liệu mục 4.7
import React from "react";
import { Table } from "@/components/ui/table";
import { formatScore } from "@/shared/utils/format";

export interface MetricCompareRow {
  studentId: string;
  fullName: string;
  groupScore: number;
  peerScore: number | null;
  completionRate: number | null;
  lateRate: number | null;
  computedScore: number;
  adjustedScore: number | null;
  finalScore: number;
}

export function MetricCompare({ rows = [] }: { rows?: MetricCompareRow[] }) {
  const headers = [
    "Học sinh",
    "Điểm nhóm",
    "Điểm ĐĐ",
    "% Xong",
    "% Trễ",
    "Điểm tính",
    "Điểm chỉnh",
    "Điểm cuối",
  ];

  return (
    <Table headers={headers}>
      {rows.length === 0 ? (
        <tr>
          <td colSpan={headers.length} className="text-center py-6 text-gray-500 text-sm">
            Chưa có dữ liệu đối chiếu điểm
          </td>
        </tr>
      ) : (
        rows.map((r) => (
          <tr key={r.studentId} className="hover:bg-gray-50">
            <td className="px-4 py-3 font-medium text-gray-900">{r.fullName}</td>
            <td className="px-4 py-3 text-gray-700">{formatScore(r.groupScore)}</td>
            <td className="px-4 py-3 text-gray-700">{formatScore(r.peerScore)}</td>
            <td className="px-4 py-3 text-gray-600">
              {r.completionRate !== null ? `${Math.round(r.completionRate * 100)}%` : "—"}
            </td>
            <td className="px-4 py-3 text-gray-600">
              {r.lateRate !== null ? `${Math.round(r.lateRate * 100)}%` : "—"}
            </td>
            <td className="px-4 py-3 font-medium text-gray-800">{formatScore(r.computedScore)}</td>
            <td className="px-4 py-3 text-blue-600">{formatScore(r.adjustedScore)}</td>
            <td className="px-4 py-3 font-bold text-gray-900">{formatScore(r.finalScore)}</td>
          </tr>
        ))
      )}
    </Table>
  );
}
