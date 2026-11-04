// [FE] Thành phần chọn người phụ trách thẻ Kanban · tài liệu mục 4.7
'use client';

import React from "react";
import { Select } from "@/components/ui/select";

export interface AssigneeOption {
  id: string;
  fullName: string;
}

export interface AssigneePickerProps {
  assignees?: AssigneeOption[];
  value?: string;
  onChange?: (val: string) => void;
}

export function AssigneePicker({ assignees = [], value, onChange }: AssigneePickerProps) {
  return (
    <Select
      label="Người phụ trách"
      value={value || ""}
      onChange={(e) => onChange?.(e.target.value)}
      options={[
        { value: "", label: "-- Chưa giao --" },
        ...assignees.map((a) => ({ value: a.id, label: a.fullName })),
      ]}
    />
  );
}
