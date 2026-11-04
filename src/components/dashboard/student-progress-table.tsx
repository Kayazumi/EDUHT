// [FE] Bảng chỉ báo tiến trình cá nhân · tài liệu mục 4.7
import React from "react";
import { Table } from "@/components/ui/table";

export interface StudentProgressRow {
  studentId: string;
  fullName: string;
  groupName: string;
  assignedTasks: number;
  completedTasks: number;
  completionRate: number | null;
  lateCount: number;
  postponedCount: number;
  reassignedCount: number;
}

export function StudentProgressTable({ rows = [] }: { rows?: StudentProgressRow[] }) {
  const headers = [
    "Học sinh",
    "Nhóm",
    "Được giao",
    "Xong",
    "% Xong",
    "Trễ hạn",
    "Dời hạn",
    "Đổi người",
  ];

  return (
    <Table headers={headers}>
      {rows.length === 0 ? (
        <tr>
          <td colSpan={headers.length} className="text-center py-6 text-gray-500 text-sm">
            Chưa có dữ liệu tiến trình học sinh
          </td>
        </tr>
      ) : (
        rows.map((r) => (
          <tr key={r.studentId} className="hover:bg-gray-50">
            <td className="px-4 py-3 font-medium text-gray-900">{r.fullName}</td>
            <td className="px-4 py-3 text-gray-600">{r.groupName}</td>
            <td className="px-4 py-3 text-gray-600">{r.assignedTasks}</td>
            <td className="px-4 py-3 text-gray-600">{r.completedTasks}</td>
            <td className="px-4 py-3 text-gray-600">
              {r.completionRate !== null ? `${Math.round(r.completionRate * 100)}%` : "—"}
            </td>
            <td className="px-4 py-3 text-red-600 font-medium">{r.lateCount}</td>
            <td className="px-4 py-3 text-gray-600">{r.postponedCount}</td>
            <td className="px-4 py-3 text-gray-600">{r.reassignedCount}</td>
          </tr>
        ))
      )}
    </Table>
  );
}
