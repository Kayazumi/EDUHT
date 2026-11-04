// [FE] Tạo dự án mới · tài liệu mục 3.3, 4.5 và A3.3
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TeacherNewProjectPage() {
  const router = useRouter();

  const [className, setClassName] = useState("10A1");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("2026-11-10");
  const [endDate, setEndDate] = useState("2026-12-20");
  const [minGroupSize, setMinGroupSize] = useState<number>(4);
  const [maxGroupSize, setMaxGroupSize] = useState<number>(5);
  const [weightGroup, setWeightGroup] = useState<string>(""); // Không có giá trị mặc định (A3.3)
  const [allowCustomTasks, setAllowCustomTasks] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tính trọng số b tự động (b = 1 - a)
  const weightGroupNum = parseFloat(weightGroup);
  const weightPeer = !isNaN(weightGroupNum) && weightGroupNum >= 0 && weightGroupNum <= 1
    ? (1 - weightGroupNum).toFixed(2)
    : "--";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Vui lòng nhập tên dự án.");
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setError("Ngày kết thúc không được trước ngày bắt đầu.");
      return;
    }

    if (minGroupSize < 2 || maxGroupSize > 8 || maxGroupSize < minGroupSize) {
      setError("Số thành viên nhóm phải thỏa mãn: Tối thiểu ≥ 2, Tối đa ≤ 8 và Tối đa ≥ Tối thiểu.");
      return;
    }

    if (isNaN(weightGroupNum) || weightGroupNum <= 0 || weightGroupNum >= 1) {
      setError("Trọng số a (điểm nhóm) phải nằm trong khoảng (0, 1) - ví dụ: 0.6.");
      return;
    }

    // Chuyển sang trang quản lý dự án mới
    const mockNewId = "proj-" + Date.now();
    router.push(`/teacher/projects/${mockNewId}`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/teacher/projects" className="hover:underline">
              Dự án của tôi
            </Link>
            <span>/</span>
            <span>Khởi tạo mới</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Khởi tạo Dự án dạy học Tin học (PBL)
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Dự án được khởi tạo ở trạng thái Bản nháp (Draft) để chuẩn bị kho nhiệm vụ và chia nhóm
          </p>
        </div>
        <Link
          href="/teacher/projects"
          className="text-xs text-slate-600 hover:text-slate-900 font-medium"
        >
          ← Quay lại
        </Link>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        {error && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Lớp học áp dụng <span className="text-rose-500">*</span>
            </label>
            <select
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="10A1">Lớp 10A1 (Khối 10, Năm học 2026-2027)</option>
              <option value="10A2">Lớp 10A2 (Khối 10, Năm học 2026-2027)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tên dự án học tập <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Thiết kế Website quảng bá di sản địa phương"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mô tả mục tiêu dự án
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả bối cảnh, nhiệm vụ chính và sản phẩm học tập kỳ vọng của các nhóm..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ngày bắt đầu dự án
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ngày kết thúc dự án
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono"
              />
            </div>
          </div>

          {/* Quy định số thành viên nhóm */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <span className="text-xs font-bold text-slate-800 block">
              Quy chuẩn quy mô nhóm [min, max]:
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">
                  Số học sinh tối thiểu / nhóm (≥ 2)
                </label>
                <input
                  type="number"
                  min={2}
                  max={8}
                  value={minGroupSize}
                  onChange={(e) => setMinGroupSize(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 mb-1">
                  Số học sinh tối đa / nhóm (≤ 8)
                </label>
                <input
                  type="number"
                  min={minGroupSize}
                  max={8}
                  value={maxGroupSize}
                  onChange={(e) => setMaxGroupSize(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded bg-white"
                />
              </div>
            </div>
          </div>

          {/* Thiết lập Trọng số a và b */}
          <div className="p-3 bg-indigo-50/60 border border-indigo-200 rounded-lg space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-indigo-950">
                Thiết lập Trọng số điểm: Điểm_CN = a × Điểm_nhóm + b × Điểm_ĐĐ
              </span>
              <span className="text-[10px] text-indigo-700 bg-white px-2 py-0.5 rounded font-mono border border-indigo-200">
                a + b = 1.0
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 items-center pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Trọng số a (Điểm nhóm do GV chấm):
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0.1"
                  max="0.9"
                  required
                  value={weightGroup}
                  onChange={(e) => setWeightGroup(e.target.value)}
                  placeholder="Ví dụ: 0.6"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-mono font-bold text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <span className="block text-[11px] text-slate-600 mb-1">
                  Trọng số b (Điểm BARS đồng đẳng tự động tính):
                </span>
                <div className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-lg font-mono font-bold text-slate-700">
                  {weightPeer}
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 italic">
              * Theo quy tắc thiết kế A3.3, giáo viên bắt buộc tự điền trọng số a (không để mặc định) để suy ngẫm mức độ tự chủ của dự án.
            </p>
          </div>

          <label className="flex items-center gap-2 pt-1 text-xs text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={allowCustomTasks}
              onChange={(e) => setAllowCustomTasks(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span>Cho phép học sinh tự thêm thẻ việc ngoài kho nhiệm vụ gợi ý</span>
          </label>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link
              href="/teacher/projects"
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Hủy bỏ
            </Link>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm"
            >
              Tạo bản nháp dự án →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
