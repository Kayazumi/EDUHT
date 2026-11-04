// [FE] Thành phần tải lên và xem trước CSV · tài liệu mục 4.7
'use client';

import React, { useState } from "react";
import { Button } from "@/components/ui/button";

export function CsvUpload() {
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
    }
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-white">
      <input
        type="file"
        accept=".csv"
        id="csv-file-input"
        className="hidden"
        onChange={handleFileChange}
      />
      <label htmlFor="csv-file-input" className="cursor-pointer block">
        <p className="text-sm font-medium text-gray-700">
          {fileName ? `Đã chọn: ${fileName}` : "Nhấn để chọn tệp CSV danh sách học sinh"}
        </p>
        <p className="text-xs text-gray-500 mt-1">Hỗ trợ tối đa 200 dòng, định dạng UTF-8</p>
      </label>
      {fileName && (
        <div className="mt-4">
          <Button variant="primary">Xem trước và xác nhận</Button>
        </div>
      )}
    </div>
  );
}
