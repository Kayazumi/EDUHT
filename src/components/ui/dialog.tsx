// [FE] Hộp thoại xác nhận · tài liệu mục 4.7
'use client';

import React from "react";

export interface DialogProps {
  open: boolean;
  title: string;
  description?: string;
  children?: React.ReactNode;
  onClose: () => void;
  onConfirm?: () => void;
}

export function Dialog({ open, title, description, children, onClose, onConfirm }: DialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {description && <p className="mt-2 text-sm text-gray-600">{description}</p>}
        <div className="mt-4">{children}</div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-50"
          >
            Hủy
          </button>
          {onConfirm && (
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              Xác nhận
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
