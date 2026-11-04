// [FE] Một tiêu chí đánh giá BARS với 4 mức hành vi · tài liệu mục 4.7
'use client';

import React from "react";

export interface BarsLevelOption {
  level: number;
  behaviorText: string;
}

export interface BarsCriterionFieldProps {
  criterionId: string;
  title: string;
  description?: string;
  levels: BarsLevelOption[];
  selectedLevel?: number;
  onSelectLevel?: (level: number) => void;
}

export function BarsCriterionField({
  title,
  description,
  levels,
  selectedLevel,
  onSelectLevel,
}: BarsCriterionFieldProps) {
  return (
    <div className="bg-white border rounded-lg p-5 mb-4 shadow-sm">
      <h4 className="text-base font-semibold text-gray-900">{title}</h4>
      {description && <p className="text-sm text-gray-500 mt-1 mb-3">{description}</p>}
      <div className="space-y-2 mt-3">
        {levels.map((lvl) => (
          <label
            key={lvl.level}
            className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
              selectedLevel === lvl.level
                ? "border-blue-500 bg-blue-50/50"
                : "border-gray-200 hover:bg-gray-50"
            }`}
          >
            <input
              type="radio"
              name={`criterion-${title}`}
              checked={selectedLevel === lvl.level}
              onChange={() => onSelectLevel?.(lvl.level)}
              className="mt-1 text-blue-600 focus:ring-blue-500"
            />
            <div className="text-sm">
              <span className="font-semibold text-gray-700 mr-2">Mức {lvl.level}:</span>
              <span className="text-gray-800">{lvl.behaviorText}</span>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
