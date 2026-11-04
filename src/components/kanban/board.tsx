// [FE] Bảng Kanban ba cột tương tác kéo thả · tài liệu mục 4.7
'use client';

import React from "react";
import { Column } from "./column";

export interface BoardProps {
  projectId?: string;
  groupId?: string;
  readOnly?: boolean;
}

export function Board({ readOnly = false }: BoardProps) {
  return (
    <div className="flex gap-4 w-full h-[calc(100vh-180px)] overflow-x-auto pb-4">
      <Column status="todo" title="Chờ thực hiện (To Do)" count={0}>
        <div className="text-xs text-gray-400 text-center py-8">
          {readOnly ? "Không có thẻ" : "Kéo thả hoặc thêm thẻ mới"}
        </div>
      </Column>
      <Column status="doing" title="Đang thực hiện (Doing)" count={0}>
        <div className="text-xs text-gray-400 text-center py-8">Chưa có công việc đang làm</div>
      </Column>
      <Column status="done" title="Đã hoàn thành (Done)" count={0}>
        <div className="text-xs text-gray-400 text-center py-8">Chưa có công việc hoàn thành</div>
      </Column>
    </div>
  );
}
