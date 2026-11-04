// [FE] Thành phần chọn hạn chót theo giờ Việt Nam · tài liệu mục 4.7
'use client';

import React from "react";
import { Input } from "@/components/ui/input";

export interface DueDatePickerProps {
  value?: string;
  onChange?: (val: string) => void;
  label?: string;
}

export function DueDatePicker({ value, onChange, label = "Hạn chót (giờ Việt Nam)" }: DueDatePickerProps) {
  return (
    <Input
      type="datetime-local"
      label={label}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
    />
  );
}
