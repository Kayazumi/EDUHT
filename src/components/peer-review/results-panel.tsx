// [FE] Bảng công bố kết quả điểm cá nhân cho học sinh · tài liệu mục 4.7
import React from "react";
import { formatScore } from "@/shared/utils/format";

export interface ResultsPanelProps {
  isPublished: boolean;
  groupScore?: number;
  peerScore?: number | null;
  finalScore?: number;
  weightGroup?: number;
  weightPeer?: number;
}

export function ResultsPanel({
  isPublished,
  groupScore,
  peerScore,
  finalScore,
  weightGroup = 0.6,
  weightPeer = 0.4,
}: ResultsPanelProps) {
  if (!isPublished) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <h3 className="font-semibold text-yellow-800 text-lg">Kết quả chưa được công bố</h3>
        <p className="text-sm text-yellow-700 mt-2">
          Giáo viên đang hoàn thiện đánh giá và sẽ công bố kết quả sau khi đối chiếu.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg p-6 shadow-sm max-w-xl mx-auto space-y-4">
      <h3 className="text-xl font-bold text-gray-900 border-b pb-3">Kết quả đánh giá cá nhân</h3>
      <div className="space-y-3">
        <div className="flex justify-between py-2 border-b border-gray-100">
          <span className="text-gray-600">Điểm nhóm (trọng số {weightGroup * 100}%):</span>
          <span className="font-semibold text-gray-900">{formatScore(groupScore)}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-gray-100">
          <span className="text-gray-600">Điểm đồng đẳng (trọng số {weightPeer * 100}%):</span>
          <span className="font-semibold text-gray-900">{formatScore(peerScore)}</span>
        </div>
        <div className="flex justify-between py-3 bg-blue-50 px-4 rounded-md">
          <span className="font-bold text-blue-900 text-base">Điểm cá nhân cuối cùng:</span>
          <span className="font-extrabold text-blue-900 text-xl">{formatScore(finalScore)}</span>
        </div>
      </div>
    </div>
  );
}
