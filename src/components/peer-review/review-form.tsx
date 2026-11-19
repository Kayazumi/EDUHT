// [FE] Phiếu đánh giá đồng đẳng theo tiêu chí BARS · tài liệu mục 4.7
"use client";

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
  onSubmit?: (data: { selectedLevels: Record<string, number>; comment: string }) => void;
  onSaveDraft?: (data: { selectedLevels: Record<string, number>; comment: string }) => void;
  isSubmitted?: boolean;
}

export function ReviewForm({
  rateeName,
  criteria = [],
  onSubmit,
  onSaveDraft,
  isSubmitted = false,
}: ReviewFormProps) {
  const [selectedLevels, setSelectedLevels] = useState<Record<string, number>>({});
  const [comment, setComment] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSelect = (criterionId: string, level: number) => {
    if (isSubmitted) return;
    setSelectedLevels((prev) => ({ ...prev, [criterionId]: level }));
    setValidationError(null);
  };

  const handleOpenSubmit = () => {
    setValidationError(null);
    const unselected = criteria.find((c) => !selectedLevels[c.id]);
    if (unselected) {
      setValidationError(`Vui lòng chọn mức hành vi cho tiêu chí: “${unselected.title}”`);
      return;
    }
    const hasLevel1 = Object.values(selectedLevels).some((lvl) => lvl === 1);
    if (hasLevel1 && comment.trim().length < 10) {
      setValidationError("Khi chọn Mức 1 ở bất kỳ tiêu chí nào, bạn cần ghi nhận xét cụ thể (tối thiểu 10 ký tự).");
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = () => {
    setShowConfirmModal(false);
    onSubmit?.({ selectedLevels, comment });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Banner thông tin đang đánh giá */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-semibold text-blue-900">
          Đang đánh giá bạn: <span className="font-bold text-blue-950">{rateeName}</span>
        </h3>
        <p className="text-xs text-blue-700 mt-1">
          Hãy chọn mô tả hành vi phản ánh đúng nhất những gì bạn quan sát được trong quá trình cộng tác nhóm.
        </p>
      </div>

      {/* Thông báo quyền riêng tư (Privacy Disclosure) */}
      <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 flex items-start gap-3">
        <span className="text-base">🔒</span>
        <div className="text-xs text-sky-900 leading-relaxed">
          <span className="font-bold">Quyền riêng tư đánh giá:</span> Điểm số và nhận xét của bạn được giữ bí mật với bạn học ({rateeName} và các thành viên khác sẽ không biết bạn cho mức nào). Chỉ giáo viên bộ môn mới có quyền xem thông tin người đánh giá để đảm bảo tính khách quan và công bằng.
        </div>
      </div>

      {validationError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl" role="alert">
          {validationError}
        </div>
      )}

      {/* Danh sách tiêu chí BARS */}
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

      {/* Nhận xét */}
      <div className="bg-white border rounded-xl p-5 shadow-2xs space-y-2">
        <label className="block text-sm font-semibold text-gray-800">
          Nhận xét đóng góp (tùy chọn)
        </label>
        <p className="text-xs text-gray-500">
          Ghi nhận xét mang tính xây dựng để giúp bạn mình phát huy điểm mạnh và khắc phục hạn chế.
        </p>
        <textarea
          rows={3}
          value={comment}
          disabled={isSubmitted}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Nhập nhận xét cụ thể để giúp bạn cùng nhóm cải thiện..."
          className="w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
        />
      </div>

      {/* Nút hành động */}
      {!isSubmitted && (
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={() => onSaveDraft?.({ selectedLevels, comment })}>
            Lưu nháp
          </Button>
          <Button variant="primary" onClick={handleOpenSubmit}>
            Nộp phiếu đánh giá
          </Button>
        </div>
      )}

      {/* Modal xác nhận nộp phiếu */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150"
          >
            <h2 id="confirm-modal-title" className="text-lg font-bold text-gray-900">
              Xác nhận nộp phiếu đánh giá
            </h2>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
              <span className="text-sm">⚠️</span>
              <div>
                <strong>Lưu ý quan trọng:</strong> Sau khi nộp, phiếu đánh giá sẽ được ghi nhận và{" "}
                <strong>không thể chỉnh sửa hoặc hoàn tác</strong>.
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-700">Rà soát lại kết quả đánh giá cho {rateeName}:</p>
              <div className="max-h-56 overflow-y-auto space-y-2 pr-1 border rounded-lg p-2.5 bg-gray-50">
                {criteria.map((c, idx) => {
                  const lvl = selectedLevels[c.id];
                  const lvlObj = c.levels.find((l) => l.level === lvl);
                  return (
                    <div key={c.id} className="text-xs bg-white p-2.5 rounded-md border border-gray-200">
                      <span className="font-bold text-gray-800">
                        {idx + 1}. {c.title}
                      </span>
                      <div className="text-blue-700 font-semibold mt-0.5">
                        Mức {lvl}: {lvlObj?.behaviorText || `Mức ${lvl}`}
                      </div>
                    </div>
                  );
                })}
                {comment && (
                  <div className="text-xs bg-white p-2.5 rounded-md border border-gray-200">
                    <span className="font-bold text-gray-800">Nhận xét:</span>
                    <p className="text-gray-600 italic mt-0.5">“{comment}”</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Kiểm tra lại
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmit}
                className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
              >
                Đồng ý nộp phiếu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
