// [FE] Cấu hình BARS và đợt đánh giá · tài liệu mục 3.3, 4.5 và A3.3
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface BarsLevel {
  level: number;
  description: string;
  points: number;
}

interface BarsCriterion {
  id: string;
  name: string;
  description: string;
  weight: number;
  levels: BarsLevel[];
}

interface EvaluationRound {
  id: string;
  name: string;
  status: "draft" | "open" | "closed";
  startDate: string;
  endDate: string;
  submittedCount: number;
  expectedCount: number;
}

export default function TeacherProjectEvaluationPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const [resolvedId, setResolvedId] = useState("");
  const [rounds, setRounds] = useState<EvaluationRound[]>([
    {
      id: "round-1",
      name: "Đợt 1: Đánh giá tiến độ giai đoạn 1",
      status: "open",
      startDate: "2026-11-01 08:00",
      endDate: "2026-11-08 23:59",
      submittedCount: 22,
      expectedCount: 30,
    },
    {
      id: "round-2",
      name: "Đợt 2: Tổng kết cuối kỳ dự án",
      status: "draft",
      startDate: "2026-11-20 08:00",
      endDate: "2026-11-25 23:59",
      submittedCount: 0,
      expectedCount: 30,
    },
  ]);

  const [criteria] = useState<BarsCriterion[]>([
    {
      id: "crit-1",
      name: "Đóng góp ý tưởng & giải pháp kỹ thuật",
      description: "Mức độ chủ động đề xuất giải pháp, thuật toán, cấu trúc dữ liệu cho dự án",
      weight: 1.0,
      levels: [
        { level: 1, points: 1.0, description: "Hiếm khi đưa ra ý kiến, thụ động chờ phân công mà không có đề xuất sáng tạo." },
        { level: 2, points: 2.0, description: "Có nêu ý tưởng khi được hỏi nhưng còn rời rạc, chưa rõ tính khả thi." },
        { level: 3, points: 3.0, description: "Chủ động đề xuất các giải pháp kỹ thuật hợp lý, bám sát yêu cầu cần đạt của bài học." },
        { level: 4, points: 4.0, description: "Đề xuất các ý tưởng xuất sắc, tối ưu hiệu năng hoặc trải nghiệm, dẫn dắt giải quyết bài toán khó." },
      ],
    },
    {
      id: "crit-2",
      name: "Trách nhiệm & Hoàn thành công việc đúng hạn",
      description: "Thực hiện các thẻ Kanban được giao, mức độ cam kết tiến độ và chất lượng",
      weight: 1.0,
      levels: [
        { level: 1, points: 1.0, description: "Thường xuyên chậm trễ, để thẻ quá hạn ảnh hưởng lớn đến tiến độ chung của nhóm." },
        { level: 2, points: 2.0, description: "Hoàn thành phần việc nhưng cần nhắc nhở nhiều lần hoặc sản phẩm còn nhiều lỗi." },
        { level: 3, points: 3.0, description: "Tự giác nhận việc, hoàn thành đúng hạn các thẻ nhiệm vụ được phân công với chất lượng tốt." },
        { level: 4, points: 4.0, description: "Luôn hoàn thành trước hạn, chủ động hỗ trợ bạn khác giải quyết thẻ bị nghẽn (doing/late)." },
      ],
    },
    {
      id: "crit-3",
      name: "Hợp tác & Kỹ năng làm việc nhóm",
      description: "Giao tiếp, lắng nghe, phản hồi xây dựng và hỗ trợ đồng đội trong nhóm",
      weight: 1.0,
      levels: [
        { level: 1, points: 1.0, description: "Giao tiếp tiêu cực, gây bất hòa hoặc không tham gia các buổi họp nhóm." },
        { level: 2, points: 2.0, description: "Có tham gia nhưng ít tương tác, không chủ động chia sẻ thông tin hoặc tài liệu." },
        { level: 3, points: 3.0, description: "Lắng nghe tích cực, phản hồi mang tính xây dựng, phối hợp nhịp nhàng với bạn cùng nhóm." },
        { level: 4, points: 4.0, description: "Gắn kết thành viên, giải quyết mâu thuẫn khéo léo, lan tỏa tinh thần trách nhiệm và tích cực." },
      ],
    },
  ]);

  const [showNewRoundModal, setShowNewRoundModal] = useState(false);
  const [newRoundName, setNewRoundName] = useState("");
  const [newRoundStart, setNewRoundStart] = useState("");
  const [newRoundEnd, setNewRoundEnd] = useState("");

  const [showApplyTemplateModal, setShowApplyTemplateModal] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  React.useEffect(() => {
    params.then((p) => setResolvedId(p.projectId));
  }, [params]);

  const hasOpenRound = rounds.some((r) => r.status === "open");

  // Kiểm tra điều kiện mở đợt (INV-04 và A3.3):
  // 1. Nhóm đã khóa (giả lập true)
  // 2. Dự án active
  // 3. Mỗi tiêu chí có đúng 4 mức điểm tăng dần
  const validateOpenConditions = () => {
    if (criteria.length === 0) return "Cần ít nhất một tiêu chí BARS.";
    for (const c of criteria) {
      if (c.levels.length !== 4) return `Tiêu chí "${c.name}" chưa đủ 4 mức hành vi (INV-04).`;
      for (let i = 0; i < c.levels.length - 1; i++) {
        const p1 = c.levels[i]?.points;
        const p2 = c.levels[i + 1]?.points;
        if (p1 !== undefined && p2 !== undefined && p1 >= p2) {
          return `Điểm các mức trong tiêu chí "${c.name}" phải tăng dần nghiêm ngặt (INV-04).`;
        }
      }
    }
    return null;
  };

  const handleOpenRound = (roundId: string) => {
    const error = validateOpenConditions();
    if (error) {
      setActionError(error);
      return;
    }
    setRounds(
      rounds.map((r) => (r.id === roundId ? { ...r, status: "open" } : r))
    );
    setActionSuccess("Đã mở đợt đánh giá thành công! Học sinh trong nhóm đã có thể vào chấm điểm.");
    setActionError(null);
  };

  const handleCreateRound = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoundName.trim() || !newRoundStart || !newRoundEnd) {
      setActionError("Vui lòng nhập đầy đủ thông tin đợt đánh giá.");
      return;
    }
    const newRound: EvaluationRound = {
      id: `round-${rounds.length + 1}`,
      name: newRoundName,
      status: "draft",
      startDate: newRoundStart,
      endDate: newRoundEnd,
      submittedCount: 0,
      expectedCount: 30,
    };
    setRounds([...rounds, newRound]);
    setShowNewRoundModal(false);
    setNewRoundName("");
    setNewRoundStart("");
    setNewRoundEnd("");
    setActionSuccess("Đã tạo đợt đánh giá mới dạng dự thảo (draft).");
  };

  return (
    <main className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link href="/teacher/projects" className="hover:text-blue-600">Dự án</Link>
            <span>/</span>
            <Link href={`/teacher/projects/${resolvedId}`} className="hover:text-blue-600">
              {resolvedId || "Chi tiết dự án"}
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Cấu hình BARS & Đợt đánh giá</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Đánh giá đồng đẳng BARS</h1>
          <p className="text-sm text-gray-500">
            Thiết lập tiêu chí đánh giá theo mỏ neo hành vi (BARS) và quản lý các đợt thu phiếu đánh giá đồng đẳng.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/teacher/projects/${resolvedId}/grading`}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm"
          >
            Chuyển sang Chấm điểm
          </Link>
          <button
            onClick={() => {
              setActionError(null);
              setActionSuccess(null);
              setShowNewRoundModal(true);
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm"
          >
            + Tạo đợt đánh giá
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm flex items-center justify-between">
          <span>{actionSuccess}</span>
          <button onClick={() => setActionSuccess(null)} className="text-green-800 font-bold ml-4">✕</button>
        </div>
      )}

      {actionError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center justify-between">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} className="text-red-800 font-bold ml-4">✕</button>
        </div>
      )}

      {/* Danh sách các đợt đánh giá */}
      <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Các đợt đánh giá đồng đẳng</h2>
            <p className="text-xs text-gray-500">
              Mỗi đợt tương ứng một thời điểm thu nhận phiếu đánh giá giữa các thành viên cùng nhóm.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-semibold border-b">
              <tr>
                <th className="px-4 py-3">Tên đợt</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Thời gian mở - đóng</th>
                <th className="px-4 py-3">Tiến độ nộp phiếu</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rounds.map((round) => {
                const pct = round.expectedCount > 0 ? Math.round((round.submittedCount / round.expectedCount) * 100) : 0;
                return (
                  <tr key={round.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      <Link
                        href={`/teacher/projects/${resolvedId}/evaluation/${round.id}`}
                        className="text-blue-600 hover:underline font-semibold"
                      >
                        {round.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      {round.status === "open" && <Badge variant="success">Đang mở</Badge>}
                      {round.status === "draft" && <Badge variant="warning">Dự thảo</Badge>}
                      {round.status === "closed" && <Badge variant="default">Đã đóng</Badge>}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      <div>Từ: {round.startDate}</div>
                      <div>Đến: {round.endDate}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="w-48">
                        <div className="flex justify-between text-xs mb-1">
                          <span>{round.submittedCount}/{round.expectedCount} phiếu</span>
                          <span className="font-semibold text-gray-700">{pct}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${pct === 100 ? "bg-green-600" : "bg-blue-600"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <Link
                        href={`/teacher/projects/${resolvedId}/evaluation/${round.id}`}
                        className="px-2.5 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 rounded"
                      >
                        Ma trận nộp
                      </Link>
                      {round.status === "draft" && (
                        <button
                          onClick={() => handleOpenRound(round.id)}
                          className="px-2.5 py-1 text-xs font-medium text-green-700 hover:bg-green-100 bg-green-50 rounded border border-green-200"
                        >
                          Mở đợt
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Cấu hình tiêu chí BARS */}
      <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900">Bộ tiêu chí BARS của dự án</h2>
              {hasOpenRound ? (
                <Badge variant="warning">Đang khóa (có đợt mở)</Badge>
              ) : (
                <Badge variant="success">Có thể chỉnh sửa</Badge>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Quy tắc INV-04: Mỗi tiêu chí bắt buộc có đúng 4 mức hành vi với điểm tăng dần nghiêm ngặt (Mức 1 &lt; Mức 2 &lt; Mức 3 &lt; Mức 4).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={hasOpenRound}
              onClick={() => setShowApplyTemplateModal(true)}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50"
            >
              Áp dụng mẫu có sẵn
            </button>
          </div>
        </div>

        {hasOpenRound && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
            ⚠️ Một đợt đánh giá đang mở thu phiếu. Tiêu chí BARS đã được khóa để đảm bảo tính nhất quán dữ liệu cho học sinh chấm điểm.
          </div>
        )}

        <div className="space-y-4">
          {criteria.map((crit, index) => (
            <div key={crit.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase text-blue-600 mr-2">Tiêu chí {index + 1}</span>
                  <span className="font-bold text-gray-900 text-sm">{crit.name}</span>
                  <p className="text-xs text-gray-500 mt-0.5">{crit.description}</p>
                </div>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded border">
                  Hệ số: {crit.weight}
                </span>
              </div>

              {/* 4 Mức hành vi */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                {crit.levels.map((lvl) => (
                  <div
                    key={lvl.level}
                    className="p-3 bg-white border border-gray-200 rounded-lg text-xs flex flex-col justify-between shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1 pb-1 border-b border-gray-100">
                        <span className="font-semibold text-gray-700">Mức {lvl.level}</span>
                        <span className="font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded text-[11px]">
                          {lvl.points.toFixed(1)} điểm
                        </span>
                      </div>
                      <p className="text-gray-600 text-[11px] leading-relaxed">{lvl.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modal Tạo đợt mới */}
      {showNewRoundModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Tạo đợt đánh giá mới</h3>
            <form onSubmit={handleCreateRound} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Tên đợt đánh giá</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Đợt 2 - Đánh giá giai đoạn cuối"
                  value={newRoundName}
                  onChange={(e) => setNewRoundName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Thời gian mở nhận phiếu</label>
                <input
                  type="datetime-local"
                  required
                  value={newRoundStart}
                  onChange={(e) => setNewRoundStart(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Hạn chót đóng đợt</label>
                <input
                  type="datetime-local"
                  required
                  value={newRoundEnd}
                  onChange={(e) => setNewRoundEnd(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewRoundModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Lưu đợt đánh giá
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Áp dụng mẫu BARS */}
      {showApplyTemplateModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Chọn mẫu BARS từ thư viện</h3>
            <p className="text-xs text-gray-500">
              Chọn mẫu được chuẩn hóa từ Chương trình GDPT 2018 Tin học THPT để ghi đè vào dự án hiện tại.
            </p>
            <div className="space-y-2">
              <div className="p-3 border rounded-lg hover:border-blue-500 cursor-pointer bg-blue-50/50">
                <div className="font-semibold text-sm text-gray-900">Mẫu chuẩn Tin học THPT - 4 tiêu chí cốt lõi</div>
                <div className="text-xs text-gray-500">Đóng góp kỹ thuật, Tiến độ & cam kết, Hợp tác nhóm, Giao tiếp</div>
              </div>
              <div className="p-3 border rounded-lg hover:border-blue-500 cursor-pointer">
                <div className="font-semibold text-sm text-gray-900">Mẫu rút gọn - 3 tiêu chí</div>
                <div className="text-xs text-gray-500">Kỹ năng chuyên môn, Tinh thần trách nhiệm, Tương tác nhóm</div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowApplyTemplateModal(false)}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  setShowApplyTemplateModal(false);
                  setActionSuccess("Đã áp dụng mẫu BARS thành công!");
                }}
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Xác nhận áp dụng
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
