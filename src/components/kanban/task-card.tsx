// [FE] Thẻ công việc trên bảng Kanban · tài liệu mục 4.7
'use client';

import React from "react";
import { Badge } from "@/components/ui/badge";
import type { TaskStatus } from "@/shared/types/domain";

export interface TaskCardProps {
  id: string;
  title: string;
  status: TaskStatus;
  assigneeName?: string;
  dueAt?: string | null;
  isLate?: boolean;
  onClick?: () => void;
}

export function TaskCard({ title, assigneeName, dueAt, isLate: late, onClick }: TaskCardProps) {
  return (
    <div
      onClick={onClick}
      className={`p-3 bg-white rounded-md border shadow-sm cursor-pointer hover:border-blue-400 transition-colors ${
        late ? "border-l-4 border-l-red-500" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-medium text-gray-900 leading-snug">{title}</h4>
        {late && <Badge variant="danger">Trễ</Badge>}
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
        <span>{assigneeName || "Chưa giao"}</span>
        {dueAt && <span>{dueAt}</span>}
      </div>
    </div>
  );
}
