"use client";

import React from "react";

interface PortalDataStateProps {
  label?: string;
  error?: string | null;
  onRetry?: () => void;
}

export function PortalDataState({ label = "đang tải dữ liệu", error, onRetry }: PortalDataStateProps) {
  if (error) {
    return (
      <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-900">
        <p className="font-semibold">Không thể tải {label}.</p>
        <p className="mt-1 text-rose-800">{error}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-900 hover:bg-rose-100"
          >
            Thử tải lại
          </button>
        )}
      </div>
    );
  }

  return (
    <div role="status" aria-live="polite" className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
      Đang tải {label}…
    </div>
  );
}
