// [FE] Danh sách bạn cần chấm · tài liệu mục 3.3, 4.5 và A3.4
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface PeerToReview {
  rateeId: string;
  name: string;
  username: string;
  role: string;
  status: "not_started" | "draft" | "submitted";
  lastSavedAt?: string;
}

export default function StudentProjectReviewPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const [resolvedId, setResolvedId] = useState("");

  React.useEffect(() => {
    params.then((p) => setResolvedId(p.projectId));
  }, [params]);

  // Thông tin đợt đánh giá đang mở
  const [round] = useState({
    id: "round-1",
    name: "Đợt 1: Đánh giá tiến độ giai đoạn 1",
    isOpen: true,
    deadlineCountdown: "Còn 2 ngày 14 giờ 20 phút",
    closeTime: "23:59 ngày 08/11/2026",
  });

  // Danh sách n - 1 bạn cùng nhóm (Nhóm 01 có 3 bạn, trừ bản thân còn 2 bạn)
  const [peers] = useState<PeerToReview[]>([
    {
      rateeId: "hs2",
      name: "Trần Thị Bình",
      username: "hs.binh02",
      role: "Thành viên nhóm",
      status: "submitted",
      lastSavedAt: "Hôm qua 15:30",
    },
    {
      rateeId: "hs3",
      name: "Lê Hoàng Cường",
      username: "hs.cuong03",
      role: "Thành viên nhóm",
      status: "not_started",
    },
  ]);

  const submittedCount = peers.filter((p) => p.status === "submitted").length;
  const totalCount = peers.length;
  const isAllSubmitted = submittedCount === totalCount;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Breadcrumb & Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
          <Link href="/student" className="hover:text-blue-600">Việc của tôi</Link>
          <span>/</span>
          <Link href={`/student/projects/${resolvedId}`} className="hover:text-blue-600">
            {resolvedId || "Dự án"}
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Đánh giá đồng đẳng</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Đánh giá đồng đẳng BARS</h1>
        <p className="text-xs text-gray-500 mt-1">
          Đánh giá sự đóng góp và hành vi làm việc nhóm của các bạn cùng nhóm. Đánh giá hoàn toàn khách quan theo thang mô tả hành vi.
        </p>
      </div>

      {/* Banner Đợt đang mở + Đếm ngược */}
      {round.isOpen ? (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-5 rounded-xl shadow-xs space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⏳</span>
              <div>
                <h2 className="text-base font-bold">{round.name}</h2>
                <p className="text-xs text-blue-100">Hạn chót đóng đợt: {round.closeTime}</p>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-xs px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-white border border-white/30 self-start sm:self-auto">
              {round.deadlineCountdown}
            </div>
          </div>

          <div className="pt-2 text-xs text-blue-100 flex items-center justify-between border-t border-white/20">
            <span>Tiến độ hoàn thành của bạn:</span>
            <span className="font-bold text-white">
              {submittedCount}/{totalCount} phiếu ({Math.round((submittedCount / totalCount) * 100)}%)
            </span>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-gray-100 text-gray-700 rounded-xl text-xs text-center">
          Hiện tại không có đợt đánh giá nào đang mở hoặc đợt đánh giá đã đóng.
        </div>
      )}

      {/* Quy tắc bảo mật BARS */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1.5">
        <div className="font-bold flex items-center gap-1.5">
          <span>🔒</span> Lưu ý quan trọng khi đánh giá đồng đẳng (tài liệu A3.4):
        </div>
        <ul className="list-disc pl-5 space-y-1 text-amber-800">
          <li>Mỗi tiêu chí gồm 4 mức mô tả hành vi quan sát được trong quá trình làm việc nhóm, không hiển thị điểm số.</li>
          <li>Bạn có thể lưu nháp và quay lại sửa; nhưng sau khi bấm <strong>Nộp phiếu</strong>, kết quả sẽ bị khóa và không thể thay đổi.</li>
          <li>Học sinh không thể tự đánh giá chính mình. Đánh giá của bạn được bảo mật theo chính sách hiển thị của giáo viên.</li>
        </ul>
      </div>

      {/* Danh sách n - 1 bạn cùng nhóm */}
      <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="text-base font-bold text-gray-900">Danh sách bạn cùng nhóm cần đánh giá</h2>
          {isAllSubmitted ? (
            <Badge variant="success">Đã hoàn thành mọi phiếu</Badge>
          ) : (
            <Badge variant="warning">Còn {totalCount - submittedCount} bạn chưa nộp</Badge>
          )}
        </div>

        <div className="divide-y divide-gray-100">
          {peers.map((peer) => {
            const isDone = peer.status === "submitted";
            const isDraft = peer.status === "draft";

            return (
              <div
                key={peer.rateeId}
                className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-gray-50/70 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
                    {peer.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-gray-900">{peer.name}</h3>
                    <div className="text-xs text-gray-400 font-mono">
                      @{peer.username} · {peer.role}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  {isDone && (
                    <div className="text-right">
                      <Badge variant="success">✓ Đã nộp phiếu</Badge>
                      <div className="text-[10px] text-gray-400 mt-0.5">{peer.lastSavedAt}</div>
                    </div>
                  )}

                  {isDraft && (
                    <div className="text-right">
                      <Badge variant="warning">Đang lưu nháp</Badge>
                      <div className="text-[10px] text-gray-400 mt-0.5">{peer.lastSavedAt}</div>
                    </div>
                  )}

                  {!isDone && !isDraft && (
                    <Badge variant="default">Chưa làm</Badge>
                  )}

                  <Link
                    href={`/student/projects/${resolvedId || "p01"}/review/${peer.rateeId}`}
                    className={`px-4 py-2 text-xs font-semibold rounded-lg shadow-2xs transition-colors ${
                      isDone
                        ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {isDone ? "Xem lại phiếu đã nộp" : isDraft ? "Tiếp tục đánh giá →" : "Bắt đầu chấm →"}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
