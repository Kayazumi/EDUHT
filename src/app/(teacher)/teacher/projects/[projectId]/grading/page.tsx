// [FE] Chấm và công bố điểm · tài liệu mục 3.3, 4.5, 7.3, 7.4 và A3.3
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface StudentGradeRow {
  studentId: string;
  studentName: string;
  username: string;
  groupId: string;
  groupName: string;
  groupScore: number | null; // S_group ∈ [0, 10]
  peerScore: number | null; // S_peer ∈ [0, 10]
  computedScore: number | null; // a * S_group + b * S_peer
  adjustedScore: number | null; // Điểm điều chỉnh nếu có
  finalScore: number | null; // S_adjusted ?? S_computed
  adjustReason: string | null;
  resultVersion: number;
  // Chỉ số đối chiếu Kanban
  kanbanCompletionRate: number;
  kanbanOverdueRate: number | null;
}

export default function TeacherProjectGradingPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const [resolvedId, setResolvedId] = useState("");
  const weightA = 0.6; // Trọng số điểm nhóm (a)
  const weightB = 0.4; // Trọng số điểm đồng đẳng (b = 1 - a)

  const [isPublished, setIsPublished] = useState(false);
  const [publishedAt, setPublishedAt] = useState<string | null>(null);

  // Group scores state
  const [groupScores, setGroupScores] = useState<Record<string, number>>({
    g1: 8.5,
    g2: 7.5,
    g3: 8.0,
  });

  const [grades, setGrades] = useState<StudentGradeRow[]>([
    {
      studentId: "hs1",
      studentName: "Nguyễn Văn An",
      username: "hs.an01",
      groupId: "g1",
      groupName: "Nhóm 01",
      groupScore: 8.5,
      peerScore: 9.2,
      computedScore: 8.78,
      adjustedScore: null,
      finalScore: 8.78,
      adjustReason: null,
      resultVersion: 1,
      kanbanCompletionRate: 1.0,
      kanbanOverdueRate: 0.0,
    },
    {
      studentId: "hs2",
      studentName: "Trần Thị Bình",
      username: "hs.binh02",
      groupId: "g1",
      groupName: "Nhóm 01",
      groupScore: 8.5,
      peerScore: 8.0,
      computedScore: 8.3,
      adjustedScore: null,
      finalScore: 8.3,
      adjustReason: null,
      resultVersion: 1,
      kanbanCompletionRate: 0.75,
      kanbanOverdueRate: 0.25,
    },
    {
      studentId: "hs3",
      studentName: "Lê Hoàng Cường",
      username: "hs.cuong03",
      groupId: "g1",
      groupName: "Nhóm 01",
      groupScore: 8.5,
      peerScore: 7.0,
      computedScore: 7.9,
      adjustedScore: 8.2,
      finalScore: 8.2,
      adjustReason: "Có đóng góp kỹ thuật đặc biệt trong phần dựng video thuyết trình",
      resultVersion: 2,
      kanbanCompletionRate: 0.8,
      kanbanOverdueRate: 0.1,
    },
    {
      studentId: "hs4",
      studentName: "Phạm Hải Đăng",
      username: "hs.dang04",
      groupId: "g2",
      groupName: "Nhóm 02",
      groupScore: 7.5,
      peerScore: 8.5,
      computedScore: 7.9,
      adjustedScore: null,
      finalScore: 7.9,
      adjustReason: null,
      resultVersion: 1,
      kanbanCompletionRate: 1.0,
      kanbanOverdueRate: 0.0,
    },
    {
      studentId: "hs5",
      studentName: "Hoàng Mỹ Hạnh",
      username: "hs.hanh05",
      groupId: "g2",
      groupName: "Nhóm 02",
      groupScore: 7.5,
      peerScore: 7.0,
      computedScore: 7.3,
      adjustedScore: null,
      finalScore: 7.3,
      adjustReason: null,
      resultVersion: 1,
      kanbanCompletionRate: 0.5,
      kanbanOverdueRate: 0.33,
    },
    {
      studentId: "hs8",
      studentName: "Bùi Minh Nhật",
      username: "hs.nhat08",
      groupId: "g3",
      groupName: "Nhóm 03",
      groupScore: 8.0,
      peerScore: 8.8,
      computedScore: 8.32,
      adjustedScore: null,
      finalScore: 8.32,
      adjustReason: null,
      resultVersion: 1,
      kanbanCompletionRate: 0.9,
      kanbanOverdueRate: 0.0,
    },
  ]);

  // Modal điều chỉnh điểm
  const [selectedStudent, setSelectedStudent] = useState<StudentGradeRow | null>(null);
  const [adjustValue, setAdjustValue] = useState<string>("");
  const [adjustReasonInput, setAdjustReasonInput] = useState<string>("");
  const [adjustError, setAdjustError] = useState<string | null>(null);

  // Filter
  const [selectedGroupFilter, setSelectedGroupFilter] = useState("all");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  React.useEffect(() => {
    params.then((p) => setResolvedId(p.projectId));
  }, [params]);

  const handleGroupScoreChange = (groupId: string, val: number) => {
    setGroupScores((prev) => ({ ...prev, [groupId]: val }));
  };

  const handleSaveGroupScores = () => {
    setGrades((prev) =>
      prev.map((g) => {
        const newGroupScore = groupScores[g.groupId] ?? g.groupScore;
        const newComputed = newGroupScore !== null && g.peerScore !== null
          ? Number((weightA * newGroupScore + weightB * g.peerScore).toFixed(2))
          : null;
        return {
          ...g,
          groupScore: newGroupScore,
          computedScore: newComputed,
          finalScore: g.adjustedScore ?? newComputed,
        };
      })
    );
    setActionSuccess("Đã lưu điểm nhóm thành công!");
  };

  const handleComputeFinalScores = () => {
    setGrades((prev) =>
      prev.map((g) => {
        const sGroup = groupScores[g.groupId] ?? g.groupScore ?? 0;
        const sPeer = g.peerScore ?? 0;
        const comp = Number((weightA * sGroup + weightB * sPeer).toFixed(2));
        return {
          ...g,
          groupScore: sGroup,
          computedScore: comp,
          finalScore: g.adjustedScore ?? comp,
        };
      })
    );
    setActionSuccess("Đã tính toán điểm cá nhân (compute_final_scores) thành công theo trọng số a=0.6, b=0.4!");
  };

  const openAdjustModal = (student: StudentGradeRow) => {
    setSelectedStudent(student);
    setAdjustValue(student.adjustedScore !== null ? student.adjustedScore.toString() : (student.finalScore ?? "").toString());
    setAdjustReasonInput(student.adjustReason || "");
    setAdjustError(null);
  };

  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    const val = parseFloat(adjustValue);
    if (isNaN(val) || val < 0 || val > 10) {
      setAdjustError("Điểm điều chỉnh phải là số thực từ 0.0 đến 10.0.");
      return;
    }

    if (adjustReasonInput.trim().length < 10) {
      setAdjustError("Lý do điều chỉnh là bắt buộc và phải có ít nhất 10 ký tự (theo quy tắc dữ liệu INV-08).");
      return;
    }

    setGrades((prev) =>
      prev.map((g) => {
        if (g.studentId === selectedStudent.studentId) {
          return {
            ...g,
            adjustedScore: val,
            finalScore: val,
            adjustReason: adjustReasonInput.trim(),
            resultVersion: g.resultVersion + 1,
          };
        }
        return g;
      })
    );

    setSelectedStudent(null);
    setActionSuccess(`Đã cập nhật điểm điều chỉnh cho học sinh ${selectedStudent.studentName} (phiên bản kết quả tăng lên)!`);
  };

  const handleTogglePublish = () => {
    if (!isPublished) {
      // Validate: all students have final score
      const missing = grades.some((g) => g.finalScore === null);
      if (missing) {
        alert("Không thể công bố vì còn học sinh chưa có điểm cuối!");
        return;
      }
      setIsPublished(true);
      setPublishedAt(new Date().toLocaleString("vi-VN"));
      setActionSuccess("Đã công bố điểm cho toàn bộ học sinh trong dự án!");
    } else {
      if (confirm("Bạn có chắc chắn muốn rút lại công bố điểm? Học sinh sẽ không thể xem kết quả cho đến khi công bố lại.")) {
        setIsPublished(false);
        setPublishedAt(null);
        setActionSuccess("Đã rút lại công bố điểm. Học sinh không còn xem được kết quả.");
      }
    }
  };

  const filteredGrades = selectedGroupFilter === "all"
    ? grades
    : grades.filter((g) => g.groupId === selectedGroupFilter);

  return (
    <main className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link href="/teacher/projects" className="hover:text-blue-600">Dự án</Link>
            <span>/</span>
            <Link href={`/teacher/projects/${resolvedId}`} className="hover:text-blue-600">
              {resolvedId || "Dự án"}
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Chấm và công bố điểm</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Bảng chấm điểm & Công bố</h1>
            {isPublished ? (
              <Badge variant="success">Đã công bố ({publishedAt})</Badge>
            ) : (
              <Badge variant="warning">Chưa công bố (Dự thảo)</Badge>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Nhập điểm nhóm sản phẩm, kết hợp điểm đồng đẳng BARS theo công thức: Điểm cuối = {weightA} × Điểm_nhóm + {weightB} × Điểm_ĐĐ.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={`/teacher/projects/${resolvedId}/export`}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm"
          >
            Xuất bảng điểm (CSV)
          </Link>
          <button
            onClick={handleComputeFinalScores}
            className="px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 shadow-sm"
          >
            ⚡ Tính lại điểm cá nhân
          </button>
          <button
            onClick={handleTogglePublish}
            className={`px-4 py-2 text-sm font-semibold rounded-lg shadow-sm text-white ${
              isPublished
                ? "bg-amber-600 hover:bg-amber-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isPublished ? "Rút lại công bố" : "Công bố điểm cho học sinh"}
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm flex items-center justify-between">
          <span>{actionSuccess}</span>
          <button onClick={() => setActionSuccess(null)} className="text-green-800 font-bold ml-4">✕</button>
        </div>
      )}

      {/* Khối Nhập điểm nhóm */}
      <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Điểm nhóm sản phẩm chung (S_group)</h2>
            <p className="text-xs text-gray-500">
              Điểm đánh giá chung cho sản phẩm dự án của từng nhóm (thang 0.0 - 10.0, trọng số a = {weightA}).
            </p>
          </div>
          <button
            onClick={handleSaveGroupScores}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Lưu điểm nhóm
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3 bg-gray-50 border rounded-lg flex items-center justify-between">
            <span className="font-semibold text-sm text-gray-800">Nhóm 01 (AI Chatbot)</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={groupScores["g1"] ?? 0}
                onChange={(e) => handleGroupScoreChange("g1", parseFloat(e.target.value) || 0)}
                className="w-16 px-2 py-1 text-center font-bold text-sm border rounded bg-white"
              />
              <span className="text-xs text-gray-500">/ 10</span>
            </div>
          </div>

          <div className="p-3 bg-gray-50 border rounded-lg flex items-center justify-between">
            <span className="font-semibold text-sm text-gray-800">Nhóm 02 (IoT Vườn)</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={groupScores["g2"] ?? 0}
                onChange={(e) => handleGroupScoreChange("g2", parseFloat(e.target.value) || 0)}
                className="w-16 px-2 py-1 text-center font-bold text-sm border rounded bg-white"
              />
              <span className="text-xs text-gray-500">/ 10</span>
            </div>
          </div>

          <div className="p-3 bg-gray-50 border rounded-lg flex items-center justify-between">
            <span className="font-semibold text-sm text-gray-800">Nhóm 03 (Game 2D)</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={groupScores["g3"] ?? 0}
                onChange={(e) => handleGroupScoreChange("g3", parseFloat(e.target.value) || 0)}
                className="w-16 px-2 py-1 text-center font-bold text-sm border rounded bg-white"
              />
              <span className="text-xs text-gray-500">/ 10</span>
            </div>
          </div>
        </div>
      </section>

      {/* Bảng điểm cá nhân và đối chiếu Kanban */}
      <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Bảng điểm tổng hợp học sinh</h2>
            <p className="text-xs text-gray-500">
              Đối chiếu trực tiếp với tỷ lệ hoàn thành và trễ hạn trên Kanban khi giáo viên xem xét điều chỉnh điểm cá nhân.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-600">Lọc nhóm:</label>
            <select
              value={selectedGroupFilter}
              onChange={(e) => setSelectedGroupFilter(e.target.value)}
              className="text-xs border rounded-lg px-2.5 py-1.5 bg-white text-gray-700 outline-none"
            >
              <option value="all">Tất cả các nhóm</option>
              <option value="g1">Nhóm 01</option>
              <option value="g2">Nhóm 02</option>
              <option value="g3">Nhóm 03</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-gray-600">
            <thead className="bg-gray-50 text-gray-700 uppercase font-semibold border-b">
              <tr>
                <th className="px-3 py-3">Học sinh</th>
                <th className="px-3 py-3">Nhóm</th>
                <th className="px-3 py-3 text-center">Điểm nhóm (a={weightA})</th>
                <th className="px-3 py-3 text-center">Điểm ĐĐ BARS (b={weightB})</th>
                <th className="px-3 py-3 text-center">Điểm tính toán</th>
                <th className="px-3 py-3 text-center">Đối chiếu Kanban</th>
                <th className="px-3 py-3 text-center">Điểm điều chỉnh</th>
                <th className="px-3 py-3 text-center font-bold text-gray-900">Điểm chính thức</th>
                <th className="px-3 py-3 text-center">Phiên bản</th>
                <th className="px-3 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredGrades.map((row) => {
                const hasAdj = row.adjustedScore !== null;
                return (
                  <tr key={row.studentId} className="hover:bg-gray-50">
                    <td className="px-3 py-3 font-medium text-gray-900">
                      <div>{row.studentName}</div>
                      <div className="text-[11px] text-gray-400 font-mono">{row.username}</div>
                    </td>
                    <td className="px-3 py-3">{row.groupName}</td>
                    <td className="px-3 py-3 text-center font-mono">
                      {row.groupScore !== null ? row.groupScore.toFixed(1) : "—"}
                    </td>
                    <td className="px-3 py-3 text-center font-mono">
                      {row.peerScore !== null ? row.peerScore.toFixed(1) : "—"}
                    </td>
                    <td className="px-3 py-3 text-center font-mono font-semibold text-gray-700">
                      {row.computedScore !== null ? row.computedScore.toFixed(2) : "—"}
                    </td>

                    {/* Đối chiếu tiến độ Kanban */}
                    <td className="px-3 py-3 text-center">
                      <div className="inline-block text-[11px] bg-gray-100 rounded px-2 py-0.5 text-gray-700">
                        Xong: <strong>{Math.round(row.kanbanCompletionRate * 100)}%</strong>
                        {row.kanbanOverdueRate !== null && row.kanbanOverdueRate > 0 && (
                          <span className="text-red-600 ml-1">
                            (Trễ: {Math.round(row.kanbanOverdueRate * 100)}%)
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Điểm điều chỉnh & lý do */}
                    <td className="px-3 py-3 text-center">
                      {hasAdj ? (
                        <div>
                          <span className="font-mono font-bold text-amber-600">
                            {row.adjustedScore?.toFixed(2)}
                          </span>
                          <div className="text-[10px] text-gray-400 truncate max-w-[120px]" title={row.adjustReason || ""}>
                            {row.adjustReason}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    {/* Điểm chính thức */}
                    <td className="px-3 py-3 text-center font-mono font-bold text-sm text-blue-700">
                      {row.finalScore !== null ? row.finalScore.toFixed(2) : "—"}
                    </td>

                    <td className="px-3 py-3 text-center text-gray-400">
                      v{row.resultVersion}
                    </td>

                    <td className="px-3 py-3 text-right">
                      <button
                        onClick={() => openAdjustModal(row)}
                        className="px-2.5 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 rounded border border-blue-200"
                      >
                        {hasAdj ? "Sửa điều chỉnh" : "Điều chỉnh"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal Điều chỉnh điểm */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">
              Điều chỉnh điểm: {selectedStudent.studentName}
            </h3>

            <div className="bg-gray-50 rounded-lg p-3 text-xs space-y-1 text-gray-600">
              <div>Điểm nhóm ({weightA}): <strong>{selectedStudent.groupScore?.toFixed(1) ?? "—"}</strong></div>
              <div>Điểm ĐĐ BARS ({weightB}): <strong>{selectedStudent.peerScore?.toFixed(1) ?? "—"}</strong></div>
              <div>Điểm tính toán lý thuyết: <strong>{selectedStudent.computedScore?.toFixed(2) ?? "—"}</strong></div>
              <div>Tiến độ Kanban: <strong>{Math.round(selectedStudent.kanbanCompletionRate * 100)}% hoàn thành</strong></div>
            </div>

            <form onSubmit={handleSaveAdjustment} className="space-y-3 text-xs">
              {adjustError && (
                <div className="p-2.5 bg-red-50 text-red-700 rounded border border-red-200">
                  {adjustError}
                </div>
              )}

              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Điểm điều chỉnh mới (thang 0.0 - 10.0)
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  max="10"
                  required
                  value={adjustValue}
                  onChange={(e) => setAdjustValue(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm font-bold font-mono outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Lý do điều chỉnh <span className="text-red-500 font-bold">*</span> (tối thiểu 10 ký tự, INV-08)
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ghi rõ lý do (ví dụ: Học sinh chủ trì giải quyết lỗi nghiêm trọng trong buổi báo cáo cuối kỳ...)"
                  value={adjustReasonInput}
                  onChange={(e) => setAdjustReasonInput(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="text-[11px] text-gray-400 text-right mt-0.5">
                  Đã nhập: {adjustReasonInput.trim().length} ký tự
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Lưu điểm điều chỉnh (Tăng v{selectedStudent.resultVersion + 1})
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
