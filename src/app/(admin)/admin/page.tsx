// [FE] Tổng quan hệ thống Admin · tài liệu mục 3.3, 4.5 và A3.2
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboardPage() {
  const [dbUsedMb] = useState(48.5);
  const dbMaxMb = 500;
  const dbPercent = Math.round((dbUsedMb / dbMaxMb) * 100);
  const lastKeepalive = "15 phút trước";
  const keepaliveDaysAgo = 0; // < 3 ngày: an toàn

  // 10 dòng nhật ký kiểm toán mới nhất
  const recentLogs = [
    {
      id: "1",
      time: "13:45:10 - Hôm nay",
      actor: "admin (Quản trị viên)",
      action: "user.create",
      target: "profiles: gv.nguyenvana",
      detail: "Tạo tài khoản giáo viên mới",
    },
    {
      id: "2",
      time: "13:30:22 - Hôm nay",
      actor: "cron.keepalive",
      action: "cron.keepalive",
      target: "system: db_ping",
      detail: "Kích hoạt định kỳ duy trì kết nối Supabase",
    },
    {
      id: "3",
      time: "11:20:05 - Hôm nay",
      actor: "admin (Quản trị viên)",
      action: "class.assign",
      target: "classes: 10A1",
      detail: "Phân công giáo viên gv.nguyenvana phụ trách",
    },
    {
      id: "4",
      time: "10:15:30 - Hôm nay",
      actor: "gv.nguyenvana",
      action: "round.finalize",
      target: "evaluation_rounds: R1-P1",
      detail: "Đóng đợt đánh giá BARS Dự án Tin học 10",
    },
    {
      id: "5",
      time: "09:40:12 - Hôm nay",
      actor: "gv.nguyenvana",
      action: "score.publish",
      target: "projects: P01-WEB",
      detail: "Công bố kết quả điểm cuối cùng cho học sinh",
    },
    {
      id: "6",
      time: "17:10:44 - Hôm qua",
      actor: "admin (Quản trị viên)",
      action: "user.import",
      target: "class_students: 10A2",
      detail: "Nhập danh sách 35 học sinh từ CSV",
    },
    {
      id: "7",
      time: "15:02:18 - Hôm qua",
      actor: "gv.tranthib",
      action: "score.adjust",
      target: "final_scores: hs.lethic",
      detail: "Điều chỉnh điểm: Đóng góp thêm vào phần báo cáo kỹ thuật",
    },
    {
      id: "8",
      time: "14:22:00 - Hôm qua",
      actor: "admin (Quản trị viên)",
      action: "curriculum.upsert",
      target: "learning_requirements: 10.CS.1",
      detail: "Cập nhật mô tả YCCĐ cấu trúc dữ liệu",
    },
    {
      id: "9",
      time: "10:05:40 - Hôm qua",
      actor: "admin (Quản trị viên)",
      action: "research.export",
      target: "research_exports: P01-WEB",
      detail: "Xuất dữ liệu nghiên cứu giả danh HMAC (165 học sinh)",
    },
    {
      id: "10",
      time: "08:30:15 - Hôm qua",
      actor: "cron.keepalive",
      action: "cron.keepalive",
      target: "system: db_ping",
      detail: "Kích hoạt định kỳ duy trì kết nối Supabase",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Tiêu đề & Tác vụ nhanh */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Tổng quan hệ thống
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Theo dõi hạ tầng, người dùng, tiến trình dự án và nhật ký kiểm toán toàn diện
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/users/new"
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
          >
            + Thêm giáo viên
          </Link>
          <Link
            href="/admin/users/import"
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-sm font-medium rounded-lg shadow-sm transition-colors"
          >
            Nhập CSV học sinh
          </Link>
        </div>
      </div>

      {/* 4 Thẻ chỉ số tổng quan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tài khoản */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Tài khoản người dùng
            </span>
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-bold">
              👤
            </span>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900">187</div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
              <span className="font-semibold text-indigo-700">1 Admin</span> •{" "}
              <span className="font-semibold text-indigo-700">6 Giáo viên</span> •{" "}
              <span className="font-semibold text-indigo-700">180 Học sinh</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-emerald-600 font-medium">100% Đang hoạt động</span>
            <Link href="/admin/users" className="text-indigo-600 hover:underline">
              Quản lý →
            </Link>
          </div>
        </div>

        {/* Card 2: Lớp học */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Lớp học THPT
            </span>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold">
              🏫
            </span>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900">6 Lớp</div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
              <span>Khối 10: <strong>2</strong></span> •{" "}
              <span>Khối 11: <strong>2</strong></span> •{" "}
              <span>Khối 12: <strong>2</strong></span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-600">Năm học: 2026 - 2027</span>
            <Link href="/admin/classes" className="text-indigo-600 hover:underline">
              Chi tiết →
            </Link>
          </div>
        </div>

        {/* Card 3: Dự án */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Dự án PBL Tin học
            </span>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-lg text-sm font-bold">
              📂
            </span>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900">7</div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
              <span className="text-emerald-700 font-semibold">4 Đang chạy</span> •{" "}
              <span className="text-slate-600">2 Bản nháp</span> •{" "}
              <span className="text-slate-600">1 Đã đóng</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">28 Nhóm đang thực hiện</span>
            <span className="text-emerald-600 font-medium">Bình thường</span>
          </div>
        </div>

        {/* Card 4: Nghiên cứu */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Đồng ý nghiên cứu
            </span>
            <span className="p-2 bg-purple-50 text-purple-600 rounded-lg text-sm font-bold">
              📝
            </span>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-purple-700">91.7%</div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
              <span className="text-emerald-700 font-semibold">165 Đồng ý</span> •{" "}
              <span className="text-amber-700 font-semibold">12 Chờ</span> •{" "}
              <span className="text-rose-700 font-semibold">3 Từ chối</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Mẫu đồng ý: v1.0</span>
            <Link href="/admin/research" className="text-indigo-600 hover:underline">
              Xuất dữ liệu →
            </Link>
          </div>
        </div>
      </div>

      {/* Cảnh báo & Tình trạng hạ tầng Supabase */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Dung lượng CSDL */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-slate-800">
                Dung lượng Cơ sở dữ liệu Supabase
              </span>
              <Badge variant={dbPercent > 80 ? "warning" : "success"}>
                {dbPercent > 80 ? "Cảnh báo vượt 80%" : "An toàn"}
              </Badge>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {dbUsedMb} MB / {dbMaxMb} MB
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                dbPercent > 80 ? "bg-amber-500" : "bg-indigo-600"
              }`}
              style={{ width: `${dbPercent}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-3">
            Hạn mức gói Supabase Free là 500 MB. Tự động kiểm tra qua thủ tục{" "}
            <code className="text-xs bg-slate-100 px-1 py-0.5 rounded text-indigo-700 font-mono">
              admin_db_size()
            </code>
            .
          </p>
        </div>

        {/* Tình trạng Keepalive */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-slate-800">
                Tình trạng Duy trì hoạt động (Keepalive)
              </span>
              <Badge variant={keepaliveDaysAgo > 3 ? "danger" : "success"}>
                {keepaliveDaysAgo > 3 ? "Cảnh báo tạm dừng" : "Đang duy trì"}
              </Badge>
            </div>
            <span className="text-xs text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded">
              Lần gửi gần nhất: {lastKeepalive}
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            API Cron <code className="text-xs bg-slate-100 px-1 py-0.5 rounded font-mono text-indigo-700">/api/cron/keepalive</code> được kích hoạt tự động mỗi ngày nhằm chống đóng băng dự án Supabase khi tạm ngừng thao tác.
          </p>
          <div className="mt-3 text-xs text-slate-400">
            Khóa kích hoạt: Bearer CRON_SECRET • Trạng thái HTTP 200 OK
          </div>
        </div>
      </div>

      {/* 10 Dòng nhật ký mới nhất */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Nhật ký kiểm toán mới nhất
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              10 thao tác quản trị và thay đổi nghiệp vụ quan trọng gần nhất
            </p>
          </div>
          <Link
            href="/admin/audit-log"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
          >
            Xem tất cả nhật ký →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Thời gian</th>
                <th className="py-3 px-4">Người thực hiện</th>
                <th className="py-3 px-4">Hành động</th>
                <th className="py-3 px-4">Đối tượng</th>
                <th className="py-3 px-4">Chi tiết tóm tắt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                    {log.time}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-900">
                    {log.actor}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[11px] font-semibold">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-mono text-[11px]">
                    {log.target}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {log.detail}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
