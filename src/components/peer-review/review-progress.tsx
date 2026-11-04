// [FE] Tiến độ nộp phiếu đánh giá của nhóm · tài liệu mục 4.7
import React from "react";

export interface ReviewProgressProps {
  submittedCount: number;
  totalExpected: number;
}

export function ReviewProgress({ submittedCount, totalExpected }: ReviewProgressProps) {
  const percentage = totalExpected > 0 ? Math.round((submittedCount / totalExpected) * 100) : 0;

  return (
    <div className="bg-white border rounded-lg p-4">
      <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
        <span>Tiến độ nộp phiếu</span>
        <span>
          {submittedCount}/{totalExpected} ({percentage}%)
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
