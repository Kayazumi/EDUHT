// [FE] Danh sách cảnh báo thẻ trễ hạn · tài liệu mục 4.7
import React from "react";
import { Badge } from "@/components/ui/badge";

export interface LateAlertItem {
  id: string;
  groupName: string;
  taskTitle: string;
  assigneeName: string;
  dueAt: string;
  daysLate: number;
}

export interface LateAlertListProps {
  alerts?: LateAlertItem[];
}

export function LateAlertList({ alerts = [] }: LateAlertListProps) {
  if (alerts.length === 0) {
    return (
      <div className="bg-white border rounded-lg p-6 text-center text-sm text-gray-500">
        Không có thẻ nào đang trễ hạn.
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg divide-y">
      {alerts.map((a) => (
        <div key={a.id} className="p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 mr-2">{a.groupName}</span>
            <span className="text-sm font-medium text-gray-900">{a.taskTitle}</span>
            <div className="text-xs text-gray-500 mt-1">
              Phụ trách: {a.assigneeName} · Hạn: {a.dueAt}
            </div>
          </div>
          <Badge variant="danger">Trễ {a.daysLate} ngày</Badge>
        </div>
      ))}
    </div>
  );
}
