// [FE] Phiếu đánh giá một bạn · tài liệu mục 3.3, 4.5 và A3.4
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { PortalDataState } from "@/components/ui/portal-data-state";
import { usePortalData } from "@/hooks/use-portal-data";
import { saveDraftReview, submitReview } from "@/server/actions/reviews";

type DataRow = Record<string, unknown>;

interface ReviewFormData {
  review: DataRow;
  criteria: DataRow[];
  levels: DataRow[];
  answers: DataRow[];
  ratee: DataRow | null;
  round: DataRow | null;
}

interface BarsCriterionDisplay {
  id: string;
  name: string;
  description: string;
  levels: { level: number; behaviorText: string }[];
}

function readString(row: DataRow | null | undefined, key: string, fallback = "") {
  const value = row?.[key];
  return typeof value === "string" ? value : fallback;
}

function readNumber(row: DataRow, key: string) {
  const value = row[key];
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Chưa có hạn" : new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default function StudentProjectReviewRateePage({
  params,
}: {
  params: Promise<{ projectId: string; rateeId: string }>;
}) {
  const { projectId, rateeId } = React.use(params);
  const [userSelectedLevels, setUserSelectedLevels] = useState<Record<string, number>>({});
  const [userComment, setUserComment] = useState<string | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const [submittedOverride, setSubmittedOverride] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { data, error, isLoading, refresh } = usePortalData<ReviewFormData>(
    "studentReviewForm",
    projectId,
    rateeId
  );

  const initialLevels = React.useMemo(() => {
    if (!data?.answers) return {};
    const saved: Record<string, number> = {};
    for (const answer of data.answers) {
      saved[readString(answer, "criterion_id")] = readNumber(answer, "level");
    }
    return saved;
  }, [data]);

  const selectedLevels = { ...initialLevels, ...userSelectedLevels };
  const comment = userComment !== null ? userComment : (data ? readString(data.review, "comment") : "");

  if (isLoading) {
    return <PortalDataState label="phiếu đánh giá" />;
  }
  if (error) return <PortalDataState label="phiếu đánh giá" error={error} onRetry={refresh} />;
  if (!data) return <PortalDataState label="phiếu đánh giá" error="Không tìm thấy phiếu đánh giá được giao cho bạn." onRetry={refresh} />;

  const criteria: BarsCriterionDisplay[] = data.criteria.map((criterion) => ({
    id: readString(criterion, "id"),
    name: readString(criterion, "title", "Tiêu chí đánh giá"),
    description: readString(criterion, "description"),
    levels: data.levels
      .filter((level) => readString(level, "criterion_id") === readString(criterion, "id"))
      .sort((a, b) => readNumber(a, "level") - readNumber(b, "level"))
      .map((level) => ({ level: readNumber(level, "level"), behaviorText: readString(level, "behavior_text") })),
  }));
  const rateeName = readString(data.ratee, "full_name", "Thành viên nhóm");
  const roundId = readString(data.review, "round_id");
  const submittedAt = readString(data.review, "submitted_at");
  const isSubmitted = Boolean(submittedAt) || submittedOverride;

  const handleSelectLevel = (criterionId: string, level: number) => {
    if (isSubmitted || isSaving) return;
    setUserSelectedLevels((previous) => ({ ...previous, [criterionId]: level }));
    setIsDraftSaved(false);
    setErrorMessage(null);
  };

  const reviewInput = () => ({
    roundId,
    rateeId,
    answers: Object.entries(selectedLevels).map(([criterionId, level]) => ({ criterionId, level })),
    comment,
  });

  const handleSaveDraft = async () => {
    if (!Object.keys(selectedLevels).length) {
      setErrorMessage("Hãy chọn ít nhất một mức hành vi trước khi lưu nháp.");
      return;
    }
    setIsSaving(true);
    setErrorMessage(null);
    const result = await saveDraftReview(reviewInput());
    setIsSaving(false);
    if (!result.ok) {
      setErrorMessage(result.error);
      return;
    }
    setUserSelectedLevels({});
    setUserComment(null);
    setIsDraftSaved(true);
    refresh();
  };

  const handleOpenSubmitModal = () => {
    setErrorMessage(null);
    const missing = criteria.find((criterion) => !selectedLevels[criterion.id]);
    if (missing) {
      setErrorMessage(`Vui lòng chọn mức hành vi cho tiêu chí “${missing.name}”.`);
      return;
    }
    const hasLevel1 = Object.values(selectedLevels).some((level) => level === 1);
    if (hasLevel1 && comment.trim().length < 10) {
      setErrorMessage("Khi chọn Mức 1, hãy ghi nhận xét giải thích cụ thể (tối thiểu 10 ký tự).");
      return;
    }
    setShowSubmitModal(true);
  };

  const handleConfirmSubmit = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    const result = await submitReview(reviewInput());
    setIsSaving(false);
    if (!result.ok) {
      setErrorMessage(result.error);
      setShowSubmitModal(false);
      return;
    }
    setSubmittedOverride(true);
    setIsDraftSaved(false);
    setShowSubmitModal(false);
    setUserSelectedLevels({});
    setUserComment(null);
    refresh();
  };

  return (
    <div className="space-y-6 max-w-4xl pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            <Link href="/student" className="hover:text-blue-600">Việc của tôi</Link>
            <span>/</span>
            <Link href={`/student/projects/${projectId}`} className="hover:text-blue-600">Dự án</Link>
            <span>/</span>
            <Link href={`/student/projects/${projectId}/review`} className="hover:text-blue-600">Đánh giá đồng đẳng</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Phiếu chấm</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Chấm bạn: {rateeName}</h1>
            {isSubmitted ? <Badge variant="success">Đã nộp · Chỉ xem</Badge> : <Badge variant="warning">Đang thực hiện</Badge>}
          </div>
          <p className="text-xs text-gray-500 mt-1">Đợt đánh giá: {readString(data.round, "title", "Đánh giá đồng đẳng")}</p>
        </div>
        <div className="text-left sm:text-right">
          <div className="text-xs text-gray-500">Hạn đóng đợt:</div>
          <div className="text-sm font-bold text-blue-700">{formatDate(readString(data.round, "closes_at"))}</div>
        </div>
      </div>

      {isDraftSaved && <div role="status" className="p-3 bg-blue-50 border border-blue-200 text-blue-800 text-xs rounded-lg">Đã lưu bản nháp vào hệ thống.</div>}
      {errorMessage && <div role="alert" className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg">{errorMessage}</div>}
      {isSubmitted && <div role="status" className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl">Phiếu đã nộp{submittedAt ? ` lúc ${formatDate(submittedAt)}` : ""} và đang ở chế độ chỉ xem.</div>}

      <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 flex items-start gap-3">
        <span className="text-base">🔒</span>
        <div className="text-xs text-sky-900 leading-relaxed">
          <span className="font-bold">Quyền riêng tư đánh giá đồng đẳng:</span> Điểm số và nhận xét của bạn được bảo mật danh tính đối với các thành viên trong lớp và trong nhóm ({rateeName} sẽ không biết mức đánh giá của bạn). Chỉ giáo viên bộ môn mới có thể xem chi tiết người đánh giá để phục vụ công tác hướng dẫn và ghi nhận điểm quá trình.
        </div>
      </div>

      <div className="p-3 bg-slate-100 rounded-lg text-[11px] text-slate-600 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <span><em>Không hiển thị điểm số. Chọn mức hành vi phản ánh đúng điều bạn quan sát được.</em></span>
        <span className="font-semibold text-slate-700">Đã chọn: {Object.keys(selectedLevels).length}/{criteria.length} tiêu chí</span>
      </div>

      {criteria.length === 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">Đợt đánh giá chưa có tiêu chí BARS.</div>
      ) : criteria.map((criterion, index) => (
        <fieldset key={criterion.id} className={`bg-white border rounded-xl p-5 shadow-xs space-y-3 ${selectedLevels[criterion.id] ? "border-blue-300 ring-1 ring-blue-100" : "border-gray-200"}`}>
          <legend className="sr-only">{criterion.name}</legend>
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider mr-2">Tiêu chí {index + 1}/{criteria.length}</span>
            <h2 className="text-base font-bold text-gray-900 inline">{criterion.name}</h2>
            {criterion.description && <p className="text-xs text-gray-500 mt-0.5">{criterion.description}</p>}
          </div>
          <div className="space-y-2">
            {criterion.levels.map((level) => {
              const checked = selectedLevels[criterion.id] === level.level;
              return (
                <label key={level.level} className={`block p-3 rounded-lg border text-xs cursor-pointer ${checked ? "bg-blue-50/80 border-blue-500 text-blue-950 font-medium" : "bg-gray-50/50 border-gray-200 text-gray-700 hover:bg-gray-100/70"} ${isSubmitted ? "cursor-default opacity-85" : ""}`}>
                  <span className="flex items-start gap-2.5">
                    <input type="radio" name={`criterion-${criterion.id}`} checked={checked} disabled={isSubmitted || isSaving} onChange={() => handleSelectLevel(criterion.id, level.level)} className="mt-0.5 text-blue-600 focus:ring-blue-500" />
                    <span className="leading-relaxed">{level.behaviorText}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}

      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-2">
        <label htmlFor="review-comment" className="block text-sm font-bold text-gray-900">Nhận xét góp ý cho bạn</label>
        <p className="text-xs text-gray-500">Bắt buộc khi có tiêu chí ở Mức 1; tối thiểu 10 ký tự.</p>
        <textarea id="review-comment" rows={3} disabled={isSubmitted || isSaving} value={comment} onChange={(event) => setUserComment(event.target.value)} className="w-full p-3 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500" />
      </div>

      {!isSubmitted && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3">
          <Link href={`/student/projects/${projectId}/review`} className="text-xs text-gray-600 hover:underline">← Quay lại danh sách bạn</Link>
          <div className="flex items-center gap-3">
            <button type="button" disabled={isSaving} onClick={handleSaveDraft} className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg disabled:opacity-50">{isSaving ? "Đang lưu…" : "Lưu nháp"}</button>
            <button type="button" disabled={isSaving} onClick={handleOpenSubmitModal} className="px-6 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50">Nộp phiếu đánh giá</button>
          </div>
        </div>
      )}

      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="confirm-review-title" className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h2 id="confirm-review-title" className="text-base font-bold text-gray-900">Xác nhận nộp phiếu đánh giá</h2>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
              <span className="text-sm">⚠️</span>
              <div>Sau khi nộp, phiếu đánh giá sẽ được ghi nhận chính thức và <strong>không thể chỉnh sửa lại</strong>.</div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-700">Rà soát mức bạn đã chọn cho <strong>{rateeName}</strong>:</p>
              <div className="max-h-56 overflow-y-auto space-y-2 pr-1 border border-gray-200 rounded-lg p-2.5 bg-gray-50">
                {criteria.map((c, idx) => {
                  const lvl = selectedLevels[c.id];
                  const lvlObj = c.levels.find((l) => l.level === lvl);
                  return (
                    <div key={c.id} className="text-xs bg-white p-2.5 rounded-md border border-gray-200">
                      <span className="font-bold text-gray-800">{idx + 1}. {c.name}</span>
                      <div className="text-blue-700 font-semibold mt-0.5">
                        Mức {lvl}: {lvlObj?.behaviorText || `Mức ${lvl}`}
                      </div>
                    </div>
                  );
                })}
                {comment && (
                  <div className="text-xs bg-white p-2.5 rounded-md border border-gray-200">
                    <span className="font-bold text-gray-800">Nhận xét góp ý:</span>
                    <p className="text-gray-600 italic mt-0.5">“{comment}”</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button type="button" disabled={isSaving} onClick={() => setShowSubmitModal(false)} className="px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">Kiểm tra lại</button>
              <button type="button" disabled={isSaving} onClick={handleConfirmSubmit} className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors disabled:opacity-50">{isSaving ? "Đang nộp…" : "Đồng ý nộp phiếu"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
