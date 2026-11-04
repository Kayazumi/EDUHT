// [FE] Kho nhiệm vụ dự án · tài liệu mục 3.3, 4.5 và A3.3
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface TaskTemplate {
  id: string;
  title: string;
  description: string;
  defaultDueOnDays: number;
  reqCodes: string[];
}

export default function TeacherProjectTasksPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const [resolvedId, setResolvedId] = useState("");
  const isDraft = true; // Cho phép sửa khi draft

  React.useEffect(() => {
    params.then((p) => setResolvedId(p.projectId));
  }, [params]);

  const [templates, setTemplates] = useState<TaskTemplate[]>([
    {
      id: "tt-1",
      title: "Xác định chủ đề, cấu trúc trang web và phân tích người dùng",
      description: "Thảo luận nhóm để lựa chọn chủ đề trang web và vẽ sơ đồ wireframe các trang.",
      defaultDueOnDays: 5,
      reqCodes: ["10.DL.1", "10.ICT.1"],
    },
    {
      id: "tt-2",
      title: "Thiết kế giao diện HTML/CSS và bố cục trang chủ",
      description: "Viết mã HTML5 ngữ nghĩa và định dạng CSS Flexbox/Grid chuẩn đáp ứng thiết bị di động.",
      defaultDueOnDays: 12,
      reqCodes: ["10.ICT.1"],
    },
    {
      id: "tt-3",
      title: "Lập trình tương tác với JavaScript và xử lý dữ liệu biểu mẫu",
      description: "Cài đặt thuật toán kiểm tra dữ liệu đầu vào và các hiệu ứng tương tác trực quan.",
      defaultDueOnDays: 20,
      reqCodes: ["10.CS.1"],
    },
    {
      id: "tt-4",
      title: "Kiểm thử tương thích, tối ưu tốc độ và triển khai lên GitHub Pages",
      description: "Kiểm tra độ tin cậy thông tin, bản quyền hình ảnh và đưa trang web lên môi trường mạng.",
      defaultDueOnDays: 28,
      reqCodes: ["10.DL.1"],
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newDueDays, setNewDueDays] = useState(7);
  const [selectedReqs, setSelectedReqs] = useState<string[]>(["10.CS.1"]);

  const availableReqs = [
    { code: "10.CS.1", strand: "CS", title: "Thiết kế thuật toán và cài đặt ngôn ngữ bậc cao" },
    { code: "10.DL.1", strand: "DL", title: "Tìm kiếm và đánh giá độ tin cậy thông tin số" },
    { code: "10.ICT.1", strand: "ICT", title: "Soạn thảo văn bản và phần mềm ứng dụng" },
    { code: "10.DL.2", strand: "DL", title: "Đạo đức, văn hóa và bản quyền trong môi trường số" },
  ];

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    if (selectedReqs.length === 0) {
      alert("MỖI NHIỆM VỤ MẪU BẮT BUỘC PHẢI GẮN ÍT NHẤT 1 YCCĐ (Mục 7.1)!");
      return;
    }

    const newT: TaskTemplate = {
      id: `tt-${Date.now()}`,
      title: newTitle.trim(),
      description: newDesc.trim(),
      defaultDueOnDays: Number(newDueDays),
      reqCodes: [...selectedReqs],
    };

    setTemplates([...templates, newT]);
    setIsModalOpen(false);
    setNewTitle("");
    setNewDesc("");
  };

  const handleDelete = (id: string) => {
    if (confirm("Bạn có chắc muốn xóa nhiệm vụ mẫu này?")) {
      setTemplates(templates.filter((t) => t.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href={`/teacher/projects/${resolvedId || "proj-p01"}`} className="hover:underline">
              Tổng quan dự án
            </Link>
            <span>/</span>
            <span>Kho nhiệm vụ mẫu & YCCĐ</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Kho nhiệm vụ mẫu & Độ phủ Yêu cầu cần đạt (YCCĐ)
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Khi khóa nhóm, hệ thống sẽ tự động nhân bản các nhiệm vụ mẫu này thành thẻ việc Kanban cho từng nhóm
          </p>
        </div>

        {isDraft && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm"
          >
            + Thêm nhiệm vụ mẫu
          </button>
        )}
      </div>

      {/* MA TRẬN ĐỘ PHỦ YCCĐ (Curriculum Coverage) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Bảng kiểm tra độ phủ YCCĐ của dự án
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {availableReqs.map((req) => {
            const count = templates.filter((t) => t.reqCodes.includes(req.code)).length;
            return (
              <div
                key={req.code}
                className={`p-3 rounded-lg border text-xs ${
                  count > 0 ? "border-emerald-200 bg-emerald-50/40" : "border-slate-200 bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-bold text-slate-900">{req.code}</span>
                  <span
                    className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                      count > 0 ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {count} nhiệm vụ
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 line-clamp-2">{req.title}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* DANH SÁCH NHIỆM VỤ MẪU */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Nhiệm vụ mẫu khởi tạo ({templates.length})
          </h2>
          <span className="text-xs text-slate-500">
            Mỗi nhiệm vụ có ít nhất một YCCĐ để đảm bảo dự án kích hoạt được
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {templates.map((t, idx) => (
            <div key={t.id} className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-400 text-xs font-bold w-6">#{idx + 1}</span>
                  <h3 className="font-bold text-sm text-slate-900">{t.title}</h3>
                  <span className="text-[11px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-medium">
                    Hạn gợi ý: Ngày thứ {t.defaultDueOnDays}
                  </span>
                </div>
                <p className="text-xs text-slate-600 pl-8">{t.description}</p>
                <div className="flex items-center gap-1.5 pl-8 pt-1">
                  <span className="text-[11px] text-slate-400">YCCĐ gắn kèm:</span>
                  {t.reqCodes.map((code) => (
                    <span
                      key={code}
                      className="font-mono text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded"
                    >
                      {code}
                    </span>
                  ))}
                  {t.reqCodes.length === 0 && (
                    <Badge variant="danger">Thiếu YCCĐ (Không thể kích hoạt)</Badge>
                  )}
                </div>
              </div>

              {isDraft && (
                <div className="flex items-center gap-2 self-end sm:self-auto pl-8 sm:pl-0">
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="text-xs font-semibold text-rose-600 hover:underline"
                  >
                    Xóa
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal Thêm nhiệm vụ mẫu */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Thêm Nhiệm vụ mẫu vào Kho dự án
            </h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tiêu đề nhiệm vụ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ví dụ: Thiết kế cơ sở dữ liệu và sơ đồ quan hệ thực thể"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mô tả công việc chi tiết
                </label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Hướng dẫn học sinh các bước thực hiện trên thẻ Kanban..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hạn hoàn thành gợi ý (số ngày kể từ lúc kích hoạt dự án)
                </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={newDueDays}
                  onChange={(e) => setNewDueDays(Number(e.target.value))}
                  className="w-32 px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Gắn Yêu cầu cần đạt môn Tin học (bắt buộc chọn ≥ 1) <span className="text-rose-500">*</span>
                </label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto border border-slate-200 rounded-lg p-2 bg-slate-50">
                  {availableReqs.map((req) => (
                    <label key={req.code} className="flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedReqs.includes(req.code)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedReqs([...selectedReqs, req.code]);
                          else setSelectedReqs(selectedReqs.filter((c) => c !== req.code));
                        }}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="font-mono font-bold text-slate-800">{req.code}</span>
                      <span className="text-slate-600 truncate">{req.title}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  Thêm nhiệm vụ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
