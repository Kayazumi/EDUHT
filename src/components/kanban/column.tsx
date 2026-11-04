// [FE] Cột trạng thái bảng Kanban · tài liệu mục 4.7
'use client';

import React from "react";
import type { TaskStatus } from "@/shared/types/domain";

export interface ColumnProps {
  status: TaskStatus;
  title: string;
  count?: number;
  children?: React.ReactNode;
}

export function Column({ title, count = 0, children }: ColumnProps) {
  return (
    <div className="flex flex-col flex-1 min-w-[280px] bg-gray-100 rounded-lg p-3">
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-gray-200">
        <h3 className="font-semibold text-sm text-gray-700 uppercase tracking-wider">{title}</h3>
        <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full font-bold text-gray-600">
          {count}
        </span>
      </div>
      <div className="flex flex-col gap-2 overflow-y-auto flex-1">{children}</div>
    </div>
  );
}
