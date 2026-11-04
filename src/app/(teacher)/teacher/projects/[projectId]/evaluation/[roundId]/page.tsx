// [FE] Chi tiết một đợt đánh giá · tài liệu mục 3.3, 4.5 và A3.3
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface MemberReviewStatus {
  raterId: string;
  raterName: string;
  evaluations: Record<string, boolean>; // rateeId -> submitted
  isComplete: boolean;
}

interface GroupMatrix {
  groupId: string;
  groupName: string;
  members: { id: string; name: string }[];
  expectedSubmissions: number; // n * (n - 1)
  submittedCount: number;
  raterRows: MemberReviewStatus[];
}

export default function TeacherProjectEvaluationRoundPage({
  params,
}: {
  params: Promise<{ projectId: string; roundId: string }>;
}) {
  const [resolvedParams, setResolvedParams] = useState({ projectId: "", roundId: "" });
  const [roundStatus, setRoundStatus] = useState<"open" | "closed">("open");
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [extendedDeadline, setExtendedDeadline] = useState("2026-11-10T23:59");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [selectedGroupFilter, setSelectedGroupFilter] = useState("all");

  React.useEffect(() => {
    params.then((p) => setResolvedParams(p));
  }, [params]);

  const [groups] = useState<GroupMatrix[]>([
    {
      groupId: "g1",
      groupName: "Nhóm 01 - AI Chatbot",
      members: [
        { id: "hs1", name: "Nguyễn Văn An" },
        { id: "hs2", name: "Trần Thị Bình" },
        { id: "hs3", name: "Lê Hoàng Cường" },
      ],
      expectedSubmissions: 6, // 3 * 2
      submittedCount: 6,
      raterRows: [
        { raterId: "hs1", raterName: "Nguyễn Văn An", evaluations: { hs2: true, hs3: true }, isComplete: true },
        { raterId: "hs2", raterName: "Trần Thị Bình", evaluations: { hs1: true, hs3: true }, isComplete: true },
        { raterId: "hs3", raterName: "Lê Hoàng Cường", evaluations: { hs1: true, hs2: true }, isComplete: true },
      ],
    },
    {
      groupId: "g2",
      groupName: "Nhóm 02 - IoT Vườn Thông Minh",
      members: [
        { id: "hs4", name: "Phạm Hải Đăng" },
        { id: "hs5", name: "Hoàng Mỹ Hạnh" },
        { id: "hs6", name: "Đỗ Quốc Khánh" },
        { id: "hs7", name: "Vũ Phương Linh" },
      ],
      expectedSubmissions: 12, // 4 * 3
      submittedCount: 9,
      raterRows: [
        { raterId: "hs4", raterName: "Phạm Hải Đăng", evaluations: { hs5: true, hs6: true, hs7: true }, isComplete: true },
        { raterId: "hs5", raterName: "Hoàng Mỹ Hạnh", evaluations: { hs4: true, hs6: true, hs7: true }, isComplete: true },
        { raterId: "hs6", raterName: "Đỗ Quốc Khánh", evaluations: { hs4: true, hs5: true, hs7: true }, isComplete: true },
        { raterId: "hs7", raterName: "Vũ Phương Linh", evaluations: { hs4: false, hs5: false, hs6: false }, isComplete: false },
      ],
    },
    {
      groupId: "g3",
      groupName: "Nhóm 03 - Game 2D Lịch Sử",
      members: [
        { id: "hs8", name: "Bùi Minh Nhật" },
        { id: "hs9", name: "Đặng Thu Thảo" },
        { id: "hs10", name: "Ngô Gia Phúc" },
      ],
      expectedSubmissions: 6,
      submittedCount: 3,
      raterRows: [
        { raterId: "hs8", raterName: "Bùi Minh Nhật", evaluations: { hs9: true, hs10: true }, isComplete: true },
        { raterId: "hs9", raterName: "Đặng Thu Thảo", evaluations: { hs8: false, hs10: true }, isComplete: false },
        { raterId: "hs10", raterName: "Ngô Gia Phúc", evaluations: { hs8: false, hs9: false }, isComplete: false },
      ],
    },
  ]);

  const totalExpected = groups.reduce((acc, g) => acc + g.expectedSubmissions, 0);
  const totalSubmitted = groups.reduce((acc, g) => acc + g.submittedCount, 0);
  const totalPct = totalExpected > 0 ? Math.round((totalSubmitted / totalExpected) * 100) : 0;

  // Lấy danh sách học sinh chưa nộp đủ
  const missingStudents: { name: string; group: string; missingCount: number }[] = [];
  groups.forEach((g) => {
    g.raterRows.forEach((r) => {
      if (!r.isComplete) {
        const notDone = Object.values(r.evaluations).filter((v) => !v).length;
        missingStudents.push({ name: r.raterName, group: g.groupName, missingCount: notDone });
      }
    });
  });

  const handleFinalize = () => {
    setRoundStatus("closed");
    setShowFinalizeModal(false);
    setActionSuccess("Đã chốt đợt đánh giá (finalize_round)! Điểm BARS trung bình của từng học sinh đã được tính toán.");
  };

  const handleRemindAll = () => {
    setActionSuccess(`Đã gửi thông báo nhắc nhở đến ${missingStudents.length} học sinh chưa nộp đủ phiếu đánh giá!`);
  };

  const filteredGroups = selectedGroupFilter === "all"
    ? groups
    : groups.filter((g) => g.groupId === selectedGroupFilter);

  return (
    <main className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link href="/teacher/projects" className="hover:text-blue-600">Dự án</Link>
            <span>/</span>
            <Link href={`/teacher/projects/${resolvedParams.projectId}`} className="hover:text-blue-600">
              {resolvedParams.projectId || "Dự án"}
            </Link>
            <span>/</span>
            <Link href={`/teacher/projects/${resolvedParams.projectId}/evaluation`} className="hover:text-blue-600">
              Đợt đánh giá
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{resolvedParams.roundId || "Chi tiết đợt"}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Chi tiết đợt đánh giá</h1>
            {roundStatus === "open" ? (
              <Badge variant="success">Đang mở nhận phiếu</Badge>
            ) : (
              <Badge variant="default">Đã chốt (Closed)</Badge>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Theo dõi ma trận nộp phiếu n × (n - 1) của từng nhóm, nhắc nhở học sinh và chốt đợt để tính điểm trung bình BARS.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {roundStatus === "open" && (
            <>
              <button
                onClick={() => setShowExtendModal(true)}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Gia hạn đợt
              </button>
              <button
                onClick={() => setShowFinalizeModal(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm"
              >
                Chốt đợt (finalize_round)
              </button>
            </>
          )}
          {roundStatus === "closed" && (
            <Link
              href={`/teacher/projects/${resolvedParams.projectId}/grading`}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Chuyển sang Bảng chấm điểm
            </Link>
          )}
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

      {/* Thông tin tổng quan đợt */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="text-xs text-gray-500 font-medium">Đồng hồ đếm ngược</div>
          <div className="text-xl font-bold text-gray-900 mt-1">
            {roundStatus === "open" ? "Còn 3 ngày 09:44" : "Đã kết thúc"}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">Hạn chót: 08/11/2026 23:59</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="text-xs text-gray-500 font-medium">Tỷ lệ nộp toàn dự án</div>
          <div className="text-xl font-bold text-blue-600 mt-1">
            {totalSubmitted} / {totalExpected} phiếu ({totalPct}%)
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${totalPct}%` }} />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="text-xs text-gray-500 font-medium">Số nhóm hoàn thành 100%</div>
          <div className="text-xl font-bold text-green-600 mt-1">
            {groups.filter((g) => g.submittedCount === g.expectedSubmissions).length} / {groups.length} nhóm
          </div>
          <div className="text-xs text-gray-400 mt-0.5">Yêu cầu đủ phiếu để điểm chuẩn xác</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="text-xs text-gray-500 font-medium">Học sinh chưa hoàn thành</div>
          <div className="text-xl font-bold text-amber-600 mt-1">
            {missingStudents.length} học sinh
          </div>
          {missingStudents.length > 0 && roundStatus === "open" && (
            <button
              onClick={handleRemindAll}
              className="mt-1 text-xs text-blue-600 hover:underline font-medium inline-block"
            >
              Gửi nhắc nhở ngay →
            </button>
          )}
        </div>
      </div>

      {/* Bộ lọc và Danh sách ma trận các nhóm */}
      <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Ma trận nộp phiếu theo nhóm</h2>
            <p className="text-xs text-gray-500">
              Công thức tổng số phiếu mong đợi mỗi nhóm: n × (n - 1) với n là số thành viên nhóm.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-600">Lọc nhóm:</label>
            <select
              value={selectedGroupFilter}
              onChange={(e) => setSelectedGroupFilter(e.target.value)}
              className="text-xs border rounded-lg px-2.5 py-1.5 bg-white text-gray-700 outline-none"
            >
              <option value="all">Tất cả các nhóm ({groups.length})</option>
              {groups.map((g) => (
                <option key={g.groupId} value={g.groupId}>
                  {g.groupName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-6">
          {filteredGroups.map((group) => {
            const grpPct = group.expectedSubmissions > 0
              ? Math.round((group.submittedCount / group.expectedSubmissions) * 100)
              : 0;

            return (
              <div key={group.groupId} className="border border-gray-200 rounded-xl p-4 bg-gray-50/40 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-900 text-sm">{group.groupName}</span>
                    <Badge variant={grpPct === 100 ? "success" : "warning"}>
                      {group.submittedCount}/{group.expectedSubmissions} phiếu ({grpPct}%)
                    </Badge>
                  </div>
                  <div className="w-40 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${grpPct === 100 ? "bg-green-600" : "bg-amber-500"}`}
                      style={{ width: `${grpPct}%` }}
                    />
                  </div>
                </div>

                {/* Bảng ma trận rater x ratee */}
                <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-2xs">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-gray-50 text-gray-600 border-b">
                      <tr>
                        <th className="px-3 py-2 font-semibold">Người đánh giá (Rater) \ Người được chấm</th>
                        {group.members.map((m) => (
                          <th key={m.id} className="px-3 py-2 text-center font-medium">
                            {m.name}
                          </th>
                        ))}
                        <th className="px-3 py-2 text-center font-semibold">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {group.raterRows.map((row) => (
                        <tr key={row.raterId} className="hover:bg-gray-50/70">
                          <td className="px-3 py-2 font-medium text-gray-900 flex items-center gap-2">
                            <span>{row.raterName}</span>
                          </td>
                          {group.members.map((m) => {
                            if (m.id === row.raterId) {
                              return (
                                <td key={m.id} className="px-3 py-2 text-center bg-gray-100 text-gray-400 font-bold">
                                  —
                                </td>
                              );
                            }
                            const isSubmitted = row.evaluations[m.id];
                            return (
                              <td key={m.id} className="px-3 py-2 text-center">
                                {isSubmitted ? (
                                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-700 text-xs font-bold" title="Đã nộp phiếu">
                                    ✓
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold" title="Chưa nộp">
                                    ⌛
                                  </span>
                                )}
                              </td>
                            );
                          })}
                          <td className="px-3 py-2 text-center">
                            {row.isComplete ? (
                              <span className="text-green-700 font-medium">Hoàn thành</span>
                            ) : (
                              <span className="text-amber-600 font-medium">Chưa hoàn tất</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Modal Chốt đợt (finalize_round) */}
      {showFinalizeModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Xác nhận chốt đợt đánh giá</h3>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 space-y-2">
              <p className="font-semibold">Lưu ý nghiệp vụ (tài liệu mục A3.3 và 7.3):</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Sau khi chốt (finalize_round), đợt sẽ đóng vĩnh viễn và không nhận thêm phiếu mới.</li>
                <li>Hệ thống sẽ chạy RPC tính điểm trung bình BARS cho từng học sinh.</li>
                <li>
                  Hiện tại còn <strong>{missingStudents.length}</strong> học sinh chưa nộp đủ phiếu.
                </li>
              </ul>
            </div>
            <p className="text-xs text-gray-500">
              Bạn có chắc chắn muốn chốt đợt đánh giá này ngay bây giờ không?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowFinalizeModal(false)}
                className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleFinalize}
                className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
              >
                Đồng ý chốt đợt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Gia hạn */}
      {showExtendModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Gia hạn thời gian nộp phiếu</h3>
            <div className="space-y-2 text-xs">
              <label className="block font-medium text-gray-700">Hạn chót mới</label>
              <input
                type="datetime-local"
                value={extendedDeadline}
                onChange={(e) => setExtendedDeadline(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowExtendModal(false)}
                className="px-3 py-1.5 text-xs text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowExtendModal(false);
                  setActionSuccess(`Đã gia hạn đợt đánh giá thành công đến ${extendedDeadline}!`);
                }}
                className="px-3 py-1.5 text-xs text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Lưu hạn mới
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
