// [FE] Biểu đồ số thẻ hoàn thành theo ngày · tài liệu mục 4.7
'use client';

import React from "react";

export interface ProgressChartProps {
  data?: { date: string; completed: number }[];
}

export function ProgressChart({ data = [] }: ProgressChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white border rounded-lg p-6 text-center text-sm text-gray-500">
        Chưa có dữ liệu biểu đồ
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Số thẻ hoàn thành theo ngày</h3>
      <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
        [Biểu đồ tiến độ Recharts]
      </div>
    </div>
  );
}
