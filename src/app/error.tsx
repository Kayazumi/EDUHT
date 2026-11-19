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
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 font-title mb-2">Đã xảy ra lỗi</h2>
      <p className="text-sm text-gray-600 dark:text-slate-400 mb-6 max-w-md">
        Hệ thống gặp sự cố trong quá trình xử lý yêu cầu. Vui lòng thử lại hoặc liên hệ quản trị viên.
      </p>
      <Button onClick={() => reset()} variant="primary">
        Thử lại
      </Button>
    </div>
  );
}
