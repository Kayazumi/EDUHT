// [FE] Khung chờ khi tải dữ liệu · tài liệu mục 4.7
import React from "react";

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
}
