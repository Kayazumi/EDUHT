// [FE] Thẻ tóm tắt tiến độ một nhóm · tài liệu mục 4.7
import React from "react";
import Link from "next/link";

export interface GroupProgressCardProps {
  groupId: string;
  projectId: string;
  groupName: string;
  completionRate?: number | null;
  lateRate?: number | null;
  lastActive?: string;
}

export function GroupProgressCard({
  groupId,
  projectId,
  groupName,
  completionRate = null,
  lateRate = null,
  lastActive = "Chưa có hoạt động",
}: GroupProgressCardProps) {
  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm hover:shadow transition-shadow">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-gray-900">{groupName}</h3>
        <Link
          href={`/teacher/projects/${projectId}/groups/${groupId}`}
          className="text-xs text-blue-600 hover:underline"
        >
          Xem Kanban →
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
        <div className="bg-gray-50 p-2 rounded">
          <span className="text-gray-500 block">Hoàn thành</span>
          <span className="font-bold text-gray-800 text-sm">
            {completionRate !== null ? `${Math.round(completionRate * 100)}%` : "Chưa có dữ liệu"}
          </span>
        </div>
        <div className="bg-gray-50 p-2 rounded">
          <span className="text-gray-500 block">Trễ hạn</span>
          <span className={`font-bold text-sm ${lateRate && lateRate > 0.3 ? "text-red-600" : "text-gray-800"}`}>
            {lateRate !== null ? `${Math.round(lateRate * 100)}%` : "Chưa có dữ liệu"}
          </span>
        </div>
      </div>
      <p className="text-xs text-gray-400">Hoạt động cuối: {lastActive}</p>
    </div>
  );
}
