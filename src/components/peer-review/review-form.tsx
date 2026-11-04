// [FE] Phiếu đánh giá đồng đẳng theo tiêu chí BARS · tài liệu mục 4.7
'use client';

import React, { useState } from "react";
import { BarsCriterionField, type BarsLevelOption } from "./bars-criterion-field";
import { Button } from "@/components/ui/button";

export interface CriterionItem {
  id: string;
  title: string;
  description?: string;
  levels: BarsLevelOption[];
}

export interface ReviewFormProps {
  rateeName: string;
  criteria?: CriterionItem[];
  onSubmit?: (data: unknown) => void;
  onSaveDraft?: (data: unknown) => void;
}

export function ReviewForm({ rateeName, criteria = [], onSubmit, onSaveDraft }: ReviewFormProps) {
  const [selectedLevels, setSelectedLevels] = useState<Record<string, number>>({});
  const [comment, setComment] = useState("");

  const handleSelect = (criterionId: string, level: number) => {
    setSelectedLevels((prev) => ({ ...prev, [criterionId]: level }));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900">
          Đang đánh giá bạn: <span className="font-bold">{rateeName}</span>
        </h3>
        <p className="text-xs text-blue-700 mt-1">
          Học sinh chọn mô tả hành vi phù hợp nhất quan sát được trong quá trình làm việc nhóm.
        </p>
      </div>

      <div className="space-y-4">
        {criteria.map((c) => (
          <BarsCriterionField
            key={c.id}
            criterionId={c.id}
            title={c.title}
            description={c.description}
            levels={c.levels}
            selectedLevel={selectedLevels[c.id]}
            onSelectLevel={(lvl) => handleSelect(c.id, lvl)}
          />
        ))}
      </div>

      <div className="bg-white border rounded-lg p-4 shadow-sm">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nhận xét đóng góp (tùy chọn)
        </label>
        <textarea
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Nhập nhận xét cụ thể để giúp bạn cùng nhóm cải thiện..."
          className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={() => onSaveDraft?.({ selectedLevels, comment })}>
          Lưu nháp
        </Button>
        <Button variant="primary" onClick={() => onSubmit?.({ selectedLevels, comment })}>
          Nộp phiếu đánh giá
        </Button>
      </div>
    </div>
  );
}
