// [FE] Hộp thoại chi tiết thẻ việc Kanban · tài liệu mục 4.7
'use client';

import React from "react";
import { Dialog } from "@/components/ui/dialog";

export interface TaskDialogProps {
  open: boolean;
  onClose: () => void;
  taskId?: string;
  title?: string;
  description?: string;
}

export function TaskDialog({ open, onClose, title = "Chi tiết thẻ việc", description }: TaskDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} title={title}>
      <p className="text-sm text-gray-600">{description || "Chưa có mô tả chi tiết."}</p>
    </Dialog>
  );
}
