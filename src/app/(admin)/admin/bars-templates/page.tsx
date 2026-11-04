// [FE] Mẫu BARS mặc định · tài liệu mục 3.3, 4.5 và A3.2
"use client";

import React, { useState } from "react";

interface CriterionLevel {
  level: number;
  label: string;
  behaviorText: string;
  points: number; // Điểm quy đổi (chỉ admin thấy, ẩn với học sinh)
}

interface BarsCriterion {
  id: string;
  title: string;
  description: string;
  weight: number;
  levels: CriterionLevel[];
}

export default function AdminBarsTemplatesPage() {
  const [viewMode, setViewMode] = useState<"admin" | "student_preview">("admin");

  const [criteria, setCriteria] = useState<BarsCriterion[]>([
    {
      id: "crit-1",
      title: "Trách nhiệm hoàn thành nhiệm vụ được giao",
      description: "Mức độ chủ động, chất lượng công việc và tính đúng hạn trên thẻ Kanban của dự án.",
      weight: 2,
      levels: [
        {
          level: 1,
          label: "Cần cố gắng",
          behaviorText: "Thường xuyên trễ hạn; cần bạn cùng nhóm nhắc nhở nhiều lần; nhiệm vụ giao làm qua loa hoặc bỏ dở.",
          points: 4.0,
        },
        {
          level: 2,
          label: "Đạt yêu cầu",
          behaviorText: "Hoàn thành nhiệm vụ nhưng đôi khi còn trễ hạn; chất lượng ở mức cơ bản, cần hỗ trợ thêm để hoàn thiện.",
          points: 6.0,
        },
        {
          level: 3,
          label: "Khá",
          behaviorText: "Hoàn thành đầy đủ công việc đúng thời hạn; chủ động cập nhật trạng thái thẻ việc và sản phẩm đạt chuẩn.",
          points: 8.0,
        },
        {
          level: 4,
          label: "Tốt / Xuất sắc",
          behaviorText: "Luôn hoàn thành trước hoặc đúng hạn với chất lượng vượt mong đợi; chủ động gánh vác việc khó và hỗ trợ bạn.",
          points: 10.0,
        },
      ],
    },
    {
      id: "crit-2",
      title: "Tinh thần hợp tác và giao tiếp trong nhóm",
      description: "Thái độ lắng nghe, tôn trọng ý kiến khác biệt và chia sẻ thông tin kịp thời trong nhóm.",
      weight: 1,
      levels: [
        {
          level: 1,
          label: "Cần cố gắng",
          behaviorText: "Hiếm khi tham gia trao đổi; không phản hồi tin nhắn trong nhóm; có thái độ tiêu cực hoặc áp đặt.",
          points: 4.0,
        },
        {
          level: 2,
          label: "Đạt yêu cầu",
          behaviorText: "Có tham gia thảo luận khi được hỏi; hoàn thành việc phân công nhưng ít chủ động giao tiếp.",
          points: 6.0,
        },
        {
          level: 3,
          label: "Khá",
          behaviorText: "Giao tiếp tích cực, tôn trọng đồng đội; chia sẻ tài liệu và thông tin đầy đủ, rõ ràng.",
          points: 8.0,
        },
        {
          level: 4,
          label: "Tốt / Xuất sắc",
          behaviorText: "Gắn kết nhóm hiệu quả; biết cách hòa giải bất đồng; lắng nghe và thúc đẩy các thành viên cùng tiến bộ.",
          points: 10.0,
        },
      ],
    },
    {
      id: "crit-3",
      title: "Đóng góp ý tưởng và giải pháp kỹ thuật Tin học",
      description: "Đề xuất thuật toán, cấu trúc mã nguồn, thiết kế giao diện hoặc giải quyết lỗi kỹ thuật.",
      weight: 1,
      levels: [
        {
          level: 1,
          label: "Cần cố gắng",
          behaviorText: "Không có ý tưởng mới; phụ thuộc hoàn toàn vào giải pháp có sẵn hoặc mã nguồn của người khác.",
          points: 4.0,
        },
        {
          level: 2,
          label: "Đạt yêu cầu",
          behaviorText: "Đóng góp một số ý tưởng đơn giản; có khả năng sửa các lỗi nhỏ theo chỉ dẫn.",
          points: 6.0,
        },
        {
          level: 3,
          label: "Khá",
          behaviorText: "Đưa ra giải pháp thuật toán / thiết kế hợp lý; chủ động tìm kiếm tài liệu để tháo gỡ vướng mắc.",
          points: 8.0,
        },
        {
          level: 4,
          label: "Tốt / Xuất sắc",
          behaviorText: "Đề xuất nhiều cải tiến sáng tạo, tối ưu thuật toán hoặc cấu trúc dự án; gỡ lỗi phức tạp cho nhóm.",
          points: 10.0,
        },
      ],
    },
  ]);

  const [editingCriterion, setEditingCriterion] = useState<BarsCriterion | null>(null);

  const handleSaveCriterion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCriterion) return;

    // Kiểm tra điểm quy đổi tăng nghiêm ngặt (mục 7.1)
    const pts = editingCriterion.levels.map((l) => l.points);
    for (let i = 0; i < pts.length - 1; i++) {
      const p1 = pts[i];
      const p2 = pts[i + 1];
      if (p1 !== undefined && p2 !== undefined && p1 >= p2) {
        alert("LỖI BẤT BIẾN BARS: Điểm quy đổi giữa các mức phải tăng nghiêm ngặt (Mức 1 < Mức 2 < Mức 3 < Mức 4)!");
        return;
      }
    }

    setCriteria(
      criteria.map((c) => (c.id === editingCriterion.id ? editingCriterion : c))
    );
    setEditingCriterion(null);
  };

  return (
    <div className="space-y-6">
      {/* Tiêu đề & Chuyển chế độ xem */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Bộ tiêu chí BARS mẫu (Behaviorally Anchored Rating Scale)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Thang đánh giá hành vi neo chuẩn dùng cho đánh giá đồng đẳng trong dạy học dự án môn Tin học
          </p>
        </div>

        {/* Nút chuyển chế độ xem */}
        <div className="flex items-center p-1 bg-slate-200/80 rounded-lg">
          <button
            onClick={() => setViewMode("admin")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              viewMode === "admin"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Quản trị (Thấy điểm quy đổi)
          </button>
          <button
            onClick={() => setViewMode("student_preview")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              viewMode === "student_preview"
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            👀 Xem trước như học sinh
          </button>
        </div>
      </div>

      {/* Thông báo chế độ xem trước */}
      {viewMode === "student_preview" && (
        <div className="p-4 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-xl text-xs flex items-center gap-3">
          <span className="text-xl">🎓</span>
          <div>
            <strong>Giao diện thực tế của học sinh:</strong> Học sinh chỉ quan sát và chọn các mô tả hành vi thực tế (Behavioral Anchors) mà không nhìn thấy điểm số quy đổi. Quy tắc này giúp ngăn ngừa thiên vị điểm số và tập trung vào nhận xét hành vi khách quan.
          </div>
        </div>
      )}

      {/* Danh sách các tiêu chí BARS */}
      <div className="space-y-5">
        {criteria.map((crit, idx) => (
          <div
            key={crit.id}
            className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    {crit.title}
                  </h3>
                  <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">
                    Trọng số w = {crit.weight}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 pl-8">
                  {crit.description}
                </p>
              </div>

              {viewMode === "admin" && (
                <button
                  onClick={() => setEditingCriterion(JSON.parse(JSON.stringify(crit)))}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline self-end sm:self-auto"
                >
                  Chỉnh sửa tiêu chí & điểm
                </button>
              )}
            </div>

            {/* 4 Mức hành vi (Level 1 to 4) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {crit.levels.map((lvl) => (
                <div
                  key={lvl.level}
                  className={`p-3.5 rounded-lg border text-xs flex flex-col justify-between ${
                    lvl.level === 4
                      ? "bg-emerald-50/50 border-emerald-200"
                      : lvl.level === 3
                      ? "bg-blue-50/40 border-blue-200"
                      : lvl.level === 2
                      ? "bg-amber-50/40 border-amber-200"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-800">
                        Mức {lvl.level}: {lvl.label}
                      </span>
                      {viewMode === "admin" && (
                        <span className="font-mono font-extrabold text-indigo-700 bg-white px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                          {lvl.points.toFixed(1)} đ
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      {lvl.behaviorText}
                    </p>
                  </div>
                  {viewMode === "student_preview" && (
                    <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center gap-1.5 text-slate-400">
                      <input type="radio" disabled className="text-indigo-600" />
                      <span className="text-[10px]">Tùy chọn chấm</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Chỉnh sửa tiêu chí & điểm quy đổi */}
      {editingCriterion && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900">
              Chỉnh sửa Tiêu chí & Điểm quy đổi BARS
            </h3>
            <form onSubmit={handleSaveCriterion} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên tiêu chí
                </label>
                <input
                  type="text"
                  required
                  value={editingCriterion.title}
                  onChange={(e) =>
                    setEditingCriterion({ ...editingCriterion, title: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Trọng số tiêu chí (w)
                </label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={editingCriterion.weight}
                  onChange={(e) =>
                    setEditingCriterion({
                      ...editingCriterion,
                      weight: Number(e.target.value),
                    })
                  }
                  className="w-24 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold text-slate-800 block">
                  Chi tiết 4 mức hành vi & Điểm quy đổi tương ứng:
                </span>
                {editingCriterion.levels.map((lvl, index) => (
                  <div key={lvl.level} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700">Mức {lvl.level}: {lvl.label}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500">Điểm quy đổi:</span>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="10"
                          required
                          value={lvl.points}
                          onChange={(e) => {
                            const newLevels = [...editingCriterion.levels];
                            const lvlObj = newLevels[index];
                            if (lvlObj) {
                              lvlObj.points = parseFloat(e.target.value) || 0;
                            }
                            setEditingCriterion({ ...editingCriterion, levels: newLevels });
                          }}
                          className="w-20 px-2 py-1 text-xs border border-slate-300 rounded bg-white font-mono font-bold text-indigo-700"
                        />
                      </div>
                    </div>
                    <textarea
                      rows={2}
                      required
                      value={lvl.behaviorText}
                      onChange={(e) => {
                        const newLevels = [...editingCriterion.levels];
                        const lvlObj = newLevels[index];
                        if (lvlObj) {
                          lvlObj.behaviorText = e.target.value;
                        }
                        setEditingCriterion({ ...editingCriterion, levels: newLevels });
                      }}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingCriterion(null)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
