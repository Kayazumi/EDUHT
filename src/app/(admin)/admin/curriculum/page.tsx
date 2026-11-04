// [FE] Danh mục Yêu cầu cần đạt · tài liệu mục 3.3, 4.5 và A3.2
"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface RequirementItem {
  id: string;
  code: string;
  grade: number;
  strand: "dl" | "ict" | "cs";
  topic: string;
  description: string;
  taskCount: number;
  isActive: boolean;
}

export default function AdminCurriculumPage() {
  const [requirements, setRequirements] = useState<RequirementItem[]>([
    {
      id: "req-1",
      code: "10.CS.1",
      grade: 10,
      strand: "cs",
      topic: "Chủ đề F: Giải quyết vấn đề với sự trợ giúp của máy tính",
      description: "Biết cách thiết kế thuật toán phân rã vấn đề và cài đặt bằng ngôn ngữ lập trình bậc cao (Python).",
      taskCount: 8,
      isActive: true,
    },
    {
      id: "req-2",
      code: "10.DL.1",
      grade: 10,
      strand: "dl",
      topic: "Chủ đề A: Máy tính và xã hội tri thức",
      description: "Sử dụng thành thạo các công cụ tìm kiếm và đánh giá độ tin cậy của thông tin số.",
      taskCount: 5,
      isActive: true,
    },
    {
      id: "req-3",
      code: "10.ICT.1",
      grade: 10,
      strand: "ict",
      topic: "Chủ đề E: Ứng dụng tin học",
      description: "Soạn thảo văn bản, thiết kế bài trình chiếu và xử lý bảng tính phục vụ dự án học tập.",
      taskCount: 6,
      isActive: true,
    },
    {
      id: "req-4",
      code: "11.ICT.1",
      grade: 11,
      strand: "ict",
      topic: "Chủ đề E: Phần mềm ứng dụng đa phương tiện",
      description: "Thiết kế và biên tập đồ họa vector, xử lý ảnh tĩnh hoặc video clip ngắn giới thiệu sản phẩm.",
      taskCount: 4,
      isActive: true,
    },
    {
      id: "req-5",
      code: "11.CS.1",
      grade: 11,
      strand: "cs",
      topic: "Chủ đề F: Kỹ thuật lập trình và cấu trúc dữ liệu",
      description: "Hiện thực các cấu trúc dữ liệu cơ bản (danh sách, ngăn xếp, hàng đợi) và thuật toán sắp xếp/tìm kiếm.",
      taskCount: 7,
      isActive: true,
    },
    {
      id: "req-6",
      code: "12.CS.1",
      grade: 12,
      strand: "cs",
      topic: "Chủ đề G: Trí tuệ nhân tạo và học máy",
      description: "Hiểu nguyên lý cơ bản của mạng nơ-ron nhân tạo và ứng dụng mô hình phân loại dữ liệu đơn giản.",
      taskCount: 2,
      isActive: true,
    },
    {
      id: "req-7",
      code: "10.DL.2",
      grade: 10,
      strand: "dl",
      topic: "Chủ đề D: Đạo đức, pháp luật và văn hóa trong môi trường số",
      description: "Tuân thủ quyền tác giả và bảo mật thông tin cá nhân khi làm việc cộng tác trực tuyến.",
      taskCount: 3,
      isActive: false, // Ví dụ YCCĐ đã ẩn
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [gradeFilter, setGradeFilter] = useState<string>("all");
  const [strandFilter, setStrandFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form thêm YCCĐ mới
  const [code, setCode] = useState("");
  const [grade, setGrade] = useState<number>(10);
  const [strand, setStrand] = useState<"dl" | "ict" | "cs">("cs");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");

  const handleToggleActive = (id: string, code: string, currentStatus: boolean) => {
    const action = currentStatus ? "ẩn" : "kích hoạt lại";
    if (confirm(`Bạn có chắc muốn ${action} YCCĐ ${code}? Ẩn YCCĐ không làm ảnh hưởng đến các dự án cũ đã liên kết.`)) {
      setRequirements(
        requirements.map((r) => (r.id === id ? { ...r, isActive: !currentStatus } : r))
      );
    }
  };

  const handleCreateRequirement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !description.trim()) return;

    if (requirements.some((r) => r.code.toLowerCase() === code.trim().toLowerCase())) {
      alert(`Mã YCCĐ ${code} đã tồn tại! Mã phải là duy nhất.`);
      return;
    }

    const newReq: RequirementItem = {
      id: `req-${Date.now()}`,
      code: code.trim().toUpperCase(),
      grade: Number(grade),
      strand,
      topic: topic.trim() || "Chủ đề kiến thức chung",
      description: description.trim(),
      taskCount: 0,
      isActive: true,
    };

    setRequirements([newReq, ...requirements]);
    setIsModalOpen(false);
    setCode("");
    setTopic("");
    setDescription("");
  };

  const filtered = requirements.filter((r) => {
    const matchSearch =
      r.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.topic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchGrade = gradeFilter === "all" || r.grade.toString() === gradeFilter;
    const matchStrand = strandFilter === "all" || r.strand === strandFilter;

    return matchSearch && matchGrade && matchStrand;
  });

  return (
    <div className="space-y-6">
      {/* Tiêu đề & Hành động */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Danh mục Yêu cầu cần đạt (YCCĐ) Tin học THPT
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Chương trình GDPT 2018 môn Tin học theo 3 mạch kiến thức: Học vấn số hoá (DL), Tin học ứng dụng (ICT), Khoa học máy tính (CS)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
          >
            + Thêm YCCĐ mới
          </button>
        </div>
      </div>

      {/* Bộ lọc và tìm kiếm */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
            Tìm kiếm
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Mã YCCĐ, chủ đề hoặc nội dung..."
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
            Khối lớp
          </label>
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="all">Tất cả khối (10, 11, 12)</option>
            <option value="10">Khối 10</option>
            <option value="11">Khối 11</option>
            <option value="12">Khối 12</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
            Mạch kiến thức
          </label>
          <select
            value={strandFilter}
            onChange={(e) => setStrandFilter(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="all">Tất cả các mạch</option>
            <option value="cs">Khoa học máy tính (CS)</option>
            <option value="ict">Tin học ứng dụng (ICT)</option>
            <option value="dl">Học vấn số hoá phổ thông (DL)</option>
          </select>
        </div>
      </div>

      {/* Bảng danh sách YCCĐ */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 w-28">Mã chuẩn</th>
                <th className="py-3.5 px-4 w-20">Khối</th>
                <th className="py-3.5 px-4 w-32">Mạch kiến thức</th>
                <th className="py-3.5 px-4">Chủ đề & Nội dung yêu cầu cần đạt</th>
                <th className="py-3.5 px-4 text-center w-28">Nhiệm vụ dùng</th>
                <th className="py-3.5 px-4 w-28">Trạng thái</th>
                <th className="py-3.5 px-4 text-right w-24">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Không tìm thấy YCCĐ nào khớp với điều kiện lọc
                  </td>
                </tr>
              ) : (
                filtered.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 text-sm">
                      {req.code}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">
                      Lớp {req.grade}
                    </td>
                    <td className="py-3 px-4">
                      {req.strand === "cs" && (
                        <span className="font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                          CS (KHMT)
                        </span>
                      )}
                      {req.strand === "ict" && (
                        <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                          ICT (Ứng dụng)
                        </span>
                      )}
                      {req.strand === "dl" && (
                        <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                          DL (Số hoá)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 mb-0.5">
                        {req.topic}
                      </div>
                      <div className="text-slate-600 leading-relaxed text-[11px]">
                        {req.description}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded-full text-[11px]">
                        {req.taskCount} thẻ
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {req.isActive ? (
                        <Badge variant="success">Kích hoạt</Badge>
                      ) : (
                        <Badge variant="default">Đã ẩn</Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleToggleActive(req.id, req.code, req.isActive)}
                        className={`font-semibold hover:underline ${
                          req.isActive ? "text-amber-600" : "text-emerald-600"
                        }`}
                      >
                        {req.isActive ? "Ẩn" : "Hiện"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
          <span>
            Tổng số: <strong>{filtered.length}</strong> yêu cầu cần đạt
          </span>
          <span className="italic">
            Quy tắc: Không xóa cứng YCCĐ để bảo đảm toàn vẹn liên kết nhiệm vụ mẫu của các dự án đã chạy.
          </span>
        </div>
      </div>

      {/* Modal Thêm YCCĐ mới */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Thêm Yêu cầu cần đạt mới
            </h3>
            <form onSubmit={handleCreateRequirement} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mã chuẩn <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="10.CS.2"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Khối lớp
                  </label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value={10}>Khối 10</option>
                    <option value={11}>Khối 11</option>
                    <option value={12}>Khối 12</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mạch kiến thức
                  </label>
                  <select
                    value={strand}
                    onChange={(e) => setStrand(e.target.value as "dl" | "ict" | "cs")}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="cs">CS (Khoa học máy tính)</option>
                    <option value="ict">ICT (Ứng dụng tin học)</option>
                    <option value="dl">DL (Học vấn số hoá)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Chủ đề chương trình 2018
                </label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Ví dụ: Chủ đề F: Giải quyết vấn đề với sự trợ giúp của máy tính"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mô tả chi tiết YCCĐ <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả cụ thể hành vi hoặc năng lực học sinh cần đạt được..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
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
                  Lưu YCCĐ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
