// [FE] Hook nhận dữ liệu thời gian thực cho bảng Kanban · tài liệu mục 4.8
'use client';

import { useState } from "react";

export function useBoardRealtime(_groupId: string) {
  const [tasks, setTasks] = useState<unknown[]>([]);
  const [isConnected] = useState(false);

  return { tasks, setTasks, isConnected };
}
