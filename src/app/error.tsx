// [FE] Màn hình thông báo lỗi · tài liệu mục 4.5
'use client';

import React from "react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Đã xảy ra lỗi</h2>
      <p className="text-sm text-gray-600 mb-6 max-w-md">
        Hệ thống gặp sự cố trong quá trình xử lý yêu cầu. Vui lòng thử lại hoặc liên hệ quản trị viên.
      </p>
      <Button onClick={() => reset()} variant="primary">
        Thử lại
      </Button>
    </div>
  );
}
