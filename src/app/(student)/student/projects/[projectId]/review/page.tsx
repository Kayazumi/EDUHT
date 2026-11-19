// [FE] Danh sách bạn cần chấm · tài liệu mục 3.3, 4.5 và A3.4
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { PortalDataState } from "@/components/ui/portal-data-state";
import { usePortalData } from "@/hooks/use-portal-data";

type DataRow = Record<string, unknown>;

interface StudentReviewData {
  rounds: DataRow[];
  reviews: DataRow[];
  profiles: DataRow[];
}

function readString(row: DataRow | null | undefined, key: string, fallback = "") {
  const value = row?.[key];
  return typeof value === "string" ? value : fallback;
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Chưa có hạn" : new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

interface PeerToReview {
  rateeId: string;
  name: string;
  status: "not_started" | "draft" | "submitted";
  lastSavedAt?: string;
}

export default function StudentProjectReviewPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = React.use(params);
  const [now] = useState(() => Date.now());
  const { data, error, isLoading, refresh } = usePortalData<StudentReviewData>("studentReview", projectId);

  if (isLoading) return <PortalDataState label="đợt và phiếu đánh giá" />;
  if (error) return <PortalDataState label="đợt và phiếu đánh giá" error={error} onRetry={refresh} />;

  const projectRounds = (data?.rounds ?? [])
    .filter((round) => readString(round, "project_id") === projectId)
    .sort((a, b) => readString(b, "opens_at").localeCompare(readString(a, "opens_at")));
  const activeRound = projectRounds.find((round) =>
    readString(round, "status") === "open" &&
    new Date(readString(round, "opens_at")).getTime() <= now &&
    new Date(readString(round, "closes_at")).getTime() > now
  );
  const round = activeRound ?? projectRounds[0] ?? null;
  const isRoundOpen = Boolean(activeRound);
  const profileById = new Map((data?.profiles ?? []).map((profile) => [readString(profile, "id"), profile]));
  const peers: PeerToReview[] = (data?.reviews ?? [])
    .filter((review) => readString(review, "round_id") === readString(round, "id"))
    .map((review) => {
      const rateeId = readString(review, "ratee_id");
      const profile = profileById.get(rateeId);
      const submittedAt = readString(review, "submitted_at");
      const updatedAt = readString(review, "updated_at");
      const createdAt = readString(review, "created_at");
      return {
        rateeId,
        name: readString(profile, "full_name", "Học sinh"),
        status: submittedAt ? "submitted" : updatedAt && updatedAt !== createdAt ? "draft" : "not_started",
        lastSavedAt: updatedAt ? formatDate(updatedAt) : undefined,
      };
    });

  const submittedCount = peers.filter((p) => p.status === "submitted").length;
  const totalCount = peers.length;
  const isAllSubmitted = totalCount > 0 && submittedCount === totalCount;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Breadcrumb & Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
          <Link href="/student" className="hover:text-blue-600">Việc của tôi</Link>
          <span>/</span>
          <Link href={`/student/projects/${projectId}`} className="hover:text-blue-600">
            {projectId || "Dự án"}
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
      {round && isRoundOpen ? (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-5 rounded-xl shadow-xs space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⏳</span>
              <div>
                <h2 className="text-base font-bold">{readString(round, "title", "Đợt đánh giá")}</h2>
                <p className="text-xs text-blue-100">Hạn chót đóng đợt: {formatDate(readString(round, "closes_at"))}</p>
              </div>
            </div>
          </div>

          <div className="pt-2 text-xs text-blue-100 flex items-center justify-between border-t border-white/20">
            <span>Tiến độ hoàn thành của bạn:</span>
            <span className="font-bold text-white">
              {submittedCount}/{totalCount} phiếu ({totalCount ? Math.round((submittedCount / totalCount) * 100) : 0}%)
            </span>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-gray-100 text-gray-700 rounded-xl text-xs text-center">
          {round ? `Đợt “${readString(round, "title", "Đánh giá")}” hiện đã đóng.` : "Dự án chưa có đợt đánh giá đồng đẳng."}
        </div>
      )}

      {/* Quy tắc bảo mật BARS */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1.5">
        <div className="font-bold flex items-center gap-1.5">
          <span>🔒</span> Lưu ý quan trọng & Quyền riêng tư khi đánh giá:
        </div>
        <ul className="list-disc pl-5 space-y-1 text-amber-800">
          <li>Mỗi tiêu chí gồm 4 mức mô tả hành vi quan sát được trong quá trình làm việc nhóm, không hiển thị điểm số.</li>
          <li>Bạn có thể lưu nháp và quay lại sửa; sau khi bấm <strong>Nộp phiếu</strong>, kết quả sẽ bị khóa và không thể thay đổi.</li>
          <li><strong>Bảo mật danh tính:</strong> Các bạn trong nhóm sẽ không biết bạn đánh giá ai bao nhiêu điểm hay nhận xét gì. Chỉ giáo viên bộ môn mới có quyền xem chi tiết để đảm bảo tính khách quan và xây dựng.</li>
        </ul>
      </div>

      {/* Các phiếu được giao trong đợt được chọn */}
      <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="text-base font-bold text-gray-900">Danh sách bạn cùng nhóm cần đánh giá</h2>
          {totalCount === 0 ? null : isAllSubmitted ? (
            <Badge variant="success">Đã hoàn thành mọi phiếu</Badge>
          ) : (
            <Badge variant="warning">Còn {totalCount - submittedCount} bạn chưa nộp</Badge>
          )}
        </div>

        <div className="divide-y divide-gray-100">
          {peers.length === 0 && <p className="py-8 text-center text-sm text-gray-500">{round ? "Bạn chưa được giao phiếu đánh giá trong đợt này." : "Khi giáo viên mở đợt và giao phiếu, danh sách sẽ xuất hiện tại đây."}</p>}
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
                      Thành viên nhóm
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
                    href={`/student/projects/${projectId}/review/${peer.rateeId}`}
                    aria-disabled={!isRoundOpen && !isDone}
                    onClick={(event) => { if (!isRoundOpen && !isDone) event.preventDefault(); }}
                    className={`px-4 py-2 text-xs font-semibold rounded-lg shadow-2xs transition-colors ${!isRoundOpen && !isDone ? "bg-gray-100 text-gray-400 cursor-not-allowed" : isDone
                        ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                  >
                    {isDone ? "Xem phiếu đã nộp" : !isRoundOpen ? "Đợt đã đóng" : isDraft ? "Tiếp tục đánh giá →" : "Bắt đầu chấm →"}
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
