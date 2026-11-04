// [FE] Phiếu đánh giá một bạn · tài liệu mục 3.3, 4.5 và A3.4
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface BarsCriterionDisplay {
  id: string;
  name: string;
  description: string;
  levels: {
    level: number;
    behaviorText: string; // Chỉ hiển thị mô tả hành vi, KHÔNG hiển thị điểm
  }[];
}

export default function StudentProjectReviewRateePage({
  params,
}: {
  params: Promise<{ projectId: string; rateeId: string }>;
}) {
  const [resolvedParams, setResolvedParams] = useState({ projectId: "", rateeId: "" });
  const [selectedLevels, setSelectedLevels] = useState<Record<string, number>>({});
  const [comment, setComment] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  React.useEffect(() => {
    params.then((p) => {
      setResolvedParams(p);
      // Giả lập nếu ratee là hs2 thì đã nộp trước đó
      if (p.rateeId === "hs2") {
        setSelectedLevels({ "crit-1": 3, "crit-2": 4, "crit-3": 3 });
        setComment("Bạn Bình làm việc rất tích cực, hỗ trợ nhóm thu thập dữ liệu đúng hạn.");
        setIsSubmitted(true);
      }
    });
  }, [params]);

  // Thông tin bạn được chấm
  const rateeInfo: Record<string, { name: string; username: string; role: string }> = {
    hs2: { name: "Trần Thị Bình", username: "hs.binh02", role: "Thành viên nhóm" },
    hs3: { name: "Lê Hoàng Cường", username: "hs.cuong03", role: "Thành viên nhóm" },
  };

  const currentRatee = rateeInfo[resolvedParams.rateeId] || {
    name: "Bạn cùng nhóm",
    username: resolvedParams.rateeId,
    role: "Thành viên",
  };

  // Bộ tiêu chí BARS chuẩn hóa (KHÔNG CÓ ĐIỂM SỐ theo A3.4)
  const criteria: BarsCriterionDisplay[] = [
    {
      id: "crit-1",
      name: "Đóng góp ý tưởng & giải pháp kỹ thuật",
      description: "Mức độ tích cực thảo luận, đề xuất giải pháp công nghệ và thuật toán cho dự án.",
      levels: [
        {
          level: 1,
          behaviorText: "Mức 1: Hầu như không đóng góp ý kiến; thụ động chờ phân công mà không đề xuất sáng kiến.",
        },
        {
          level: 2,
          behaviorText: "Mức 2: Có đóng góp ý kiến khi được hỏi, nhưng ý tưởng còn rời rạc, chưa rõ tính khả thi.",
        },
        {
          level: 3,
          behaviorText: "Mức 3: Chủ động đưa ra các giải pháp kỹ thuật phù hợp với yêu cầu cần đạt của bài học.",
        },
        {
          level: 4,
          behaviorText: "Mức 4: Đưa ra các ý tưởng sáng tạo, dẫn dắt nhóm vượt qua các bài toán kỹ thuật phức tạp.",
        },
      ],
    },
    {
      id: "crit-2",
      name: "Trách nhiệm & Hoàn thành công việc đúng hạn",
      description: "Thực hiện các thẻ Kanban được phân công, cam kết chất lượng sản phẩm.",
      levels: [
        {
          level: 1,
          behaviorText: "Mức 1: Thường xuyên trễ hạn các thẻ được giao, chất lượng sơ sài làm ảnh hưởng tiến độ chung.",
        },
        {
          level: 2,
          behaviorText: "Mức 2: Hoàn thành nhiệm vụ nhưng cần bạn cùng nhóm nhắc nhở nhiều lần hoặc sản phẩm còn lỗi.",
        },
        {
          level: 3,
          behaviorText: "Mức 3: Tự giác nhận việc trên bảng Kanban, hoàn thành đúng hạn với chất lượng tốt.",
        },
        {
          level: 4,
          behaviorText: "Mức 4: Luôn hoàn thành trước hạn chót, chủ động giúp đỡ bạn khác gỡ vướng nhiệm vụ trễ.",
        },
      ],
    },
    {
      id: "crit-3",
      name: "Kỹ năng hợp tác & Làm việc nhóm",
      description: "Giao tiếp, lắng nghe tích cực và phối hợp nhịp nhàng với các thành viên khác.",
      levels: [
        {
          level: 1,
          behaviorText: "Mức 1: Giao tiếp thiếu xây dựng, không tham gia các buổi họp hoặc gây cản trở công việc.",
        },
        {
          level: 2,
          behaviorText: "Mức 2: Có mặt trong các buổi trao đổi nhưng ít tương tác, chia sẻ tài liệu hạn chế.",
        },
        {
          level: 3,
          behaviorText: "Mức 3: Lắng nghe tôn trọng, phản hồi mang tính đóng góp, phối hợp ăn ý với các bạn.",
        },
        {
          level: 4,
          behaviorText: "Mức 4: Gắn kết tinh thần đồng đội, hòa giải bất đồng và động viên bạn bè cùng tiến bộ.",
        },
      ],
    },
  ];

  // Kiểm tra không chấm chính mình (INV rule)
  const isSelf = resolvedParams.rateeId === "hs1";

  const handleSelectLevel = (critId: string, level: number) => {
    if (isSubmitted) return;
    setSelectedLevels((prev) => ({ ...prev, [critId]: level }));
    setIsDraftSaved(false);
    setErrorMessage(null);
  };

  const handleSaveDraft = () => {
    setIsDraftSaved(true);
    setErrorMessage(null);
  };

  const handleOpenSubmitModal = () => {
    setErrorMessage(null);

    // Kiểm tra đã chọn đủ tất cả tiêu chí chưa
    for (const c of criteria) {
      if (!selectedLevels[c.id]) {
        setErrorMessage(`Vui lòng chọn mức hành vi cho tiêu chí "${c.name}".`);
        return;
      }
    }

    // Quy tắc D5: Bắt buộc nhận xét khi chọn Mức 1 (mức thấp nhất)
    const hasLevel1 = Object.values(selectedLevels).some((lvl) => lvl === 1);
    if (hasLevel1 && comment.trim().length < 10) {
      setErrorMessage("Bạn đã chọn Mức 1 cho ít nhất một tiêu chí. Quy tắc yêu cầu bạn ghi nhận xét giải thích cụ thể (tối thiểu 10 ký tự).");
      return;
    }

    setShowSubmitModal(true);
  };

  const handleConfirmSubmit = () => {
    setIsSubmitted(true);
    setShowSubmitModal(false);
    setIsDraftSaved(false);
  };

  if (isSelf) {
    return (
      <main className="p-6 max-w-2xl mx-auto space-y-4">
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          ⚠️ Bạn không thể tự đánh giá chính mình. Vui lòng quay lại danh sách để chấm các bạn cùng nhóm.
        </div>
        <Link
          href={`/student/projects/${resolvedParams.projectId}/review`}
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-xs"
        >
          ← Quay lại danh sách
        </Link>
      </main>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl pb-10">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            <Link href="/student" className="hover:text-blue-600">Việc của tôi</Link>
            <span>/</span>
            <Link href={`/student/projects/${resolvedParams.projectId}`} className="hover:text-blue-600">
              {resolvedParams.projectId || "Dự án"}
            </Link>
            <span>/</span>
            <Link href={`/student/projects/${resolvedParams.projectId}/review`} className="hover:text-blue-600">
              Đánh giá đồng đẳng
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Phiếu chấm</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              Chấm bạn: {currentRatee.name}
            </h1>
            {isSubmitted ? (
              <Badge variant="success">Đã nộp phiếu (Chỉ xem)</Badge>
            ) : (
              <Badge variant="warning">Đang thực hiện</Badge>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Tài khoản: <strong className="text-gray-700 font-mono">@{currentRatee.username}</strong> · Vai trò: {currentRatee.role}
          </p>
        </div>

        <div className="text-right">
          <div className="text-xs text-gray-500">Đóng đợt sau:</div>
          <div className="text-sm font-bold font-mono text-blue-600">2 ngày 04:10</div>
        </div>
      </div>

      {isDraftSaved && (
        <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 text-xs rounded-lg flex items-center justify-between">
          <span>✓ Đã lưu bản nháp thành công! Bạn có thể quay lại hoàn thành sau.</span>
          <button onClick={() => setIsDraftSaved(false)} className="font-bold">✕</button>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg flex items-center justify-between">
          <span>⚠️ {errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="font-bold">✕</button>
        </div>
      )}

      {isSubmitted && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <span>✓</span>
          <span>Phiếu đánh giá đã được nộp thành công và chuyển sang chế độ chỉ đọc. Cảm ơn sự đóng góp của bạn!</span>
        </div>
      )}

      {/* Banner lưu ý bảo mật BARS */}
      <div className="p-3 bg-slate-100 rounded-lg text-[11px] text-slate-600 flex items-center justify-between">
        <span>
          📌 <em>Không có điểm số ở bất kỳ bước nào. Chọn mức hành vi phản ánh đúng nhất những gì bạn quan sát được.</em>
        </span>
        <span className="font-semibold text-slate-700">
          Đã chọn: {Object.keys(selectedLevels).length} / {criteria.length} tiêu chí
        </span>
      </div>

      {/* Danh sách tiêu chí BARS */}
      <div className="space-y-6">
        {criteria.map((crit, index) => {
          const selected = selectedLevels[crit.id];

          return (
            <div
              key={crit.id}
              className={`bg-white border rounded-xl p-5 shadow-xs space-y-3 transition-colors ${
                selected ? "border-blue-300 ring-1 ring-blue-100" : "border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider mr-2">
                    Tiêu chí {index + 1}/{criteria.length}
                  </span>
                  <h3 className="text-base font-bold text-gray-900 inline">{crit.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{crit.description}</p>
                </div>
                {selected && (
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    Đã chọn Mức {selected}
                  </span>
                )}
              </div>

              {/* 4 Mức mô tả hành vi */}
              <div className="space-y-2 pt-1">
                {crit.levels.map((lvl) => {
                  const isChecked = selected === lvl.level;

                  return (
                    <label
                      key={lvl.level}
                      onClick={() => handleSelectLevel(crit.id, lvl.level)}
                      className={`block p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                        isChecked
                          ? "bg-blue-50/80 border-blue-500 text-blue-950 font-medium shadow-2xs"
                          : "bg-gray-50/50 border-gray-200 text-gray-700 hover:bg-gray-100/70"
                      } ${isSubmitted ? "cursor-default opacity-85" : ""}`}
                    >
                      <div className="flex items-start gap-2.5">
                        <input
                          type="radio"
                          name={`crit-${crit.id}`}
                          checked={isChecked}
                          disabled={isSubmitted}
                          onChange={() => handleSelectLevel(crit.id, lvl.level)}
                          className="mt-0.5 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="leading-relaxed">{lvl.behaviorText}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Ô Nhận xét */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-2">
          <label className="block text-sm font-bold text-gray-900">
            Nhận xét góp ý cho bạn (không bắt buộc, trừ khi chọn Mức 1)
          </label>
          <p className="text-xs text-gray-500">
            Hãy đưa ra những nhận xét chân thành, mang tính xây dựng nhằm giúp bạn phát triển kỹ năng làm việc nhóm.
          </p>
          <textarea
            rows={3}
            disabled={isSubmitted}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Ví dụ: Bạn hợp tác rất tốt, luôn chủ động chia sẻ tài liệu; nếu bạn chủ động phát biểu trong buổi họp nhóm nữa thì tuyệt vời..."
            className="w-full p-3 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
          />
        </div>

        {/* Action buttons */}
        {!isSubmitted && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3">
            <Link
              href={`/student/projects/${resolvedParams.projectId}/review`}
              className="text-xs text-gray-600 hover:underline text-center sm:text-left"
            >
              ← Quay lại danh sách bạn
            </Link>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="flex-1 sm:flex-none px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg shadow-2xs"
              >
                Lưu nháp
              </button>
              <button
                type="button"
                onClick={handleOpenSubmitModal}
                className="flex-1 sm:flex-none px-6 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs"
              >
                Nộp phiếu đánh giá
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal xác nhận nộp phiếu */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-gray-900">Xác nhận nộp phiếu đánh giá</h3>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 space-y-1">
              <p className="font-bold">Lưu ý quan trọng (tài liệu A3.4):</p>
              <p>
                Sau khi nộp, phiếu đánh giá sẽ được ghi nhận vào hệ thống và <strong>không thể chỉnh sửa lại</strong>.
              </p>
            </div>
            <p className="text-xs text-gray-600">
              Bạn có chắc chắn muốn nộp phiếu đánh giá cho bạn <strong>{currentRatee.name}</strong>?
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Kiểm tra lại
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmit}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
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
