// [FE] Huy hiệu trạng thái đợt đánh giá · tài liệu mục 4.7
import React from "react";
import { Badge } from "@/components/ui/badge";
import type { RoundStatus } from "@/shared/types/domain";

export function RoundStatusBadge({ status }: { status: RoundStatus }) {
  const map: Record<RoundStatus, { label: string; variant: "default" | "success" | "warning" | "danger" | "info" }> = {
    draft: { label: "Bản nháp", variant: "default" },
    open: { label: "Đang mở nhận phiếu", variant: "success" },
    closed: { label: "Đã chốt", variant: "warning" },
  };

  const { label, variant } = map[status] || { label: status, variant: "default" };

  return <Badge variant={variant}>{label}</Badge>;
}
