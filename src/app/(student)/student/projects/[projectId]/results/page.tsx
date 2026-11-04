// [FE] Kết quả đánh giá · tài liệu mục 3.3, 4.5, 7.3 và A3.4
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface CriterionScore {
  id: string;
  name: string;
  averageLevel: number; // Thang 1.0 đến 4.0
  maxLevel: number;
}

interface PeerFeedbackComment {
  id: string;
  raterDisplay: string; // "Ẩn danh" hoặc tên thật tùy rater_visibility (D1)
  content: string;
  roundName: string;
}

export default function StudentProjectResultsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const [resolvedId, setResolvedId] = useState("");
  // Giả lập trạng thái công bố điểm của giáo viên
  const [isPublished, setIsPublished] = useState(true);

  React.useEffect(() => {
    params.then((p) => setResolvedId(p.projectId));
  }, [params]);

  const resultData = {
    projectName: "Dự án Tin học 12: Xây dựng Hệ thống Trợ lý AI và Chatbot",
    groupName: "Nhóm 01 - AI Chatbot",
    publishedDate: "03/11/2026",
    weightA: 0.6, // Điểm nhóm
    weightB: 0.4, // Điểm đồng đẳng
    groupScore: 8.5, // Thang 10
    peerScore: 9.2, // Thang 10, quy đổi từ BARS
    receivedReviewsCount: 2,
    expectedReviewsCount: 2,
    finalScore: 8.78, // a * groupScore + b * peerScore
    resultVersion: 1,
    calculationNote:
      "Điểm cuối được tính theo công thức: 0.6 × Điểm_nhóm (8.5) + 0.4 × Điểm_ĐĐ (9.2) = 8.78",
  };

  const criteriaAverages: CriterionScore[] = [
    {
      id: "c1",
      name: "Đóng góp ý tưởng & giải pháp kỹ thuật",
      averageLevel: 3.5,
      maxLevel: 4.0,
    },
    {
      id: "c2",
      name: "Trách nhiệm & Hoàn thành công việc đúng hạn",
      averageLevel: 4.0,
      maxLevel: 4.0,
    },
    {
      id: "c3",
      name: "Kỹ năng hợp tác & Làm việc nhóm",
      averageLevel: 3.5,
      maxLevel: 4.0,
    },
  ];

  const peerComments: PeerFeedbackComment[] = [
    {
      id: "fb-1",
      raterDisplay: "Bạn cùng nhóm (Ẩn danh)",
      content:
        "Bạn An làm việc rất nghiêm túc, luôn chủ động giải quyết các khó khăn kỹ thuật về API và hỗ trợ mình sửa lỗi code.",
      roundName: "Đợt 1: Đánh giá tiến độ giai đoạn 1",
    },
    {
      id: "fb-2",
      raterDisplay: "Bạn cùng nhóm (Ẩn danh)",
      content:
        "Hoàn thành các thẻ Kanban đúng hạn, tinh thần trách nhiệm rất cao. Đề xuất nhóm duy trì tiến độ tốt như thế này.",
      roundName: "Đợt 1: Đánh giá tiến độ giai đoạn 1",
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl pb-10">
      {/* Breadcrumb & Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
          <Link href="/student" className="hover:text-blue-600">Việc của tôi</Link>
          <span>/</span>
          <Link href={`/student/projects/${resolvedId}`} className="hover:text-blue-600">
            {resolvedId || "Dự án"}
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Kết quả đánh giá</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kết quả tổng kết dự án</h1>
            <p className="text-xs text-gray-500 mt-1">
              Dự án: <strong className="text-gray-700">{resultData.projectName}</strong> · {resultData.groupName}
            </p>
          </div>

          {/* Toggle demo switch: Cho phép chuyển đổi chế độ xem đã công bố / chưa công bố */}
          <button
            onClick={() => setIsPublished(!isPublished)}
            className="text-[11px] text-gray-500 hover:text-gray-800 underline self-start sm:self-auto"
            title="Nhấn để xem trạng thái trước/sau khi giáo viên công bố"
          >
            Chuyển chế độ xem ({isPublished ? "Đang xem: Đã công bố" : "Đang xem: Chưa công bố"})
          </button>
        </div>
      </div>

      {/* Trạng thái chưa công bố */}
      {!isPublished ? (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-3xl mx-auto">
            ⏳
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-lg font-bold text-gray-900">Giáo viên đang rà soát lại kết quả</h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              Điểm tổng kết và nhận xét đánh giá đồng đẳng của dự án này hiện chưa được công bố. Giáo viên đang trong quá trình đối chiếu tiến độ Kanban và hoàn tất chấm điểm. Vui lòng quay lại sau!
            </p>
          </div>
          <div className="pt-2">
            <Link
              href={`/student/projects/${resolvedId || "p01"}/board`}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
            >
              Xem bảng Kanban nhóm →
            </Link>
          </div>
        </div>
      ) : (
        /* Trạng thái đã công bố điểm */
        <div className="space-y-6">
          {/* Khối Điểm tổng kết nổi bật */}
          <div className="bg-gradient-to-br from-blue-700 via-indigo-800 to-purple-800 text-white rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/20 pb-6">
              <div>
                <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">
                  Điểm tổng kết chính thức
                </span>
                <div className="text-4xl sm:text-5xl font-black mt-1 text-white font-mono">
                  {resultData.finalScore.toFixed(2)}
                  <span className="text-xl text-blue-200 font-normal ml-1">/ 10</span>
                </div>
              </div>

              <div className="text-xs text-blue-100 sm:text-right space-y-1">
                <div>Ngày công bố: <strong>{resultData.publishedDate}</strong></div>
                <div>Phiên bản kết quả: <Badge variant="info">v{resultData.resultVersion}</Badge></div>
              </div>
            </div>

            {/* Cơ cấu điểm thành phần */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-xs rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between text-xs text-blue-100 mb-1">
                  <span>Điểm sản phẩm nhóm</span>
                  <span className="font-bold text-white">Trọng số {Math.round(resultData.weightA * 100)}%</span>
                </div>
                <div className="text-2xl font-bold font-mono text-white">
                  {resultData.groupScore.toFixed(1)} <span className="text-xs text-blue-200 font-normal">/ 10</span>
                </div>
                <p className="text-[11px] text-blue-200 mt-1">Đánh giá chung cho sản phẩm của {resultData.groupName}</p>
              </div>

              <div className="bg-white/10 backdrop-blur-xs rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between text-xs text-blue-100 mb-1">
                  <span>Điểm đồng đẳng BARS</span>
                  <span className="font-bold text-white">Trọng số {Math.round(resultData.weightB * 100)}%</span>
                </div>
                <div className="text-2xl font-bold font-mono text-white">
                  {resultData.peerScore.toFixed(1)} <span className="text-xs text-blue-200 font-normal">/ 10</span>
                </div>
                <p className="text-[11px] text-blue-200 mt-1">
                  Quy đổi từ {resultData.receivedReviewsCount}/{resultData.expectedReviewsCount} phiếu hợp lệ của các bạn trong nhóm
                </p>
              </div>
            </div>

            <div className="text-xs text-blue-100 bg-black/20 rounded-lg p-3 font-mono">
              💡 {resultData.calculationNote}
            </div>
          </div>

          {/* Mức trung bình theo từng tiêu chí BARS (Thang 1.0 - 4.0) */}
          <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">Điểm trung bình theo tiêu chí BARS</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Mức đánh giá trung bình từ các bạn cùng nhóm (quy đổi theo thang mỏ neo hành vi từ 1.0 đến 4.0).
              </p>
            </div>

            <div className="space-y-4 pt-2">
              {criteriaAverages.map((crit) => {
                const percentage = (crit.averageLevel / crit.maxLevel) * 100;

                return (
                  <div key={crit.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-gray-800">{crit.name}</span>
                      <span className="font-mono font-bold text-blue-700">
                        {crit.averageLevel.toFixed(1)} / {crit.maxLevel.toFixed(1)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Nhận xét từ các bạn cùng nhóm */}
          <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">Nhận xét từ các thành viên trong nhóm</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Các lời góp ý từ bạn cùng nhóm giúp bạn nhận diện điểm mạnh và các khía cạnh cần hoàn thiện hơn.
              </p>
            </div>

            <div className="space-y-3">
              {peerComments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between text-gray-500">
                    <span className="font-semibold text-blue-900 flex items-center gap-1.5">
                      <span>💬</span> {comment.raterDisplay}
                    </span>
                    <span className="text-[11px] text-gray-400">{comment.roundName}</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed italic">
                    &quot;{comment.content}&quot;
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
