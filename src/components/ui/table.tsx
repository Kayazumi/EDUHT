// [FE] Bảng dữ liệu phân trang · tài liệu mục 4.7
import React from "react";

export interface TableProps {
  headers: string[];
  children?: React.ReactNode;
}

export function Table({ headers, children }: TableProps) {
  return (
    <div className="w-full overflow-x-auto border rounded-lg bg-white shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-50 border-b">
          <tr>
            {headers.map((h, idx) => (
              <th key={idx} className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y text-sm text-gray-700">{children}</tbody>
      </table>
    </div>
  );
}
