// [FE] Nhật ký hệ thống · tài liệu mục 3.3, 4.5 và A3.2
"use client";

import React, { useState } from "react";

interface AuditLogEntry {
  id: string;
  createdAt: string;
  actorId: string;
  actorName: string;
  action: string;
  targetTable: string;
  targetId: string;
  detail: Record<string, unknown>;
}

export default function AdminAuditLogPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  const [logs] = useState<AuditLogEntry[]>([
    {
      id: "101",
      createdAt: "2026-11-04 13:45:10",
      actorId: "u-adm-01",
      actorName: "admin (Quản trị viên)",
      action: "user.create",
      targetTable: "profiles",
      targetId: "gv.nguyenvana",
      detail: {
        username: "gv.nguyenvana",
        full_name: "Nguyễn Văn An",
        role: "teacher",
        created_by_ip: "192.168.1.10",
      },
    },
    {
      id: "102",
      createdAt: "2026-11-04 13:30:22",
      actorId: "system",
      actorName: "cron.keepalive (Hệ thống)",
      action: "cron.keepalive",
      targetTable: "system",
      targetId: "db_ping",
      detail: {
        status: "success",
        db_size_bytes: 50855936,
        latency_ms: 45,
      },
    },
    {
      id: "103",
      createdAt: "2026-11-04 11:20:05",
      actorId: "u-adm-01",
      actorName: "admin (Quản trị viên)",
      action: "class.assign",
      targetTable: "classes",
      targetId: "c-10a1",
      detail: {
        class_name: "10A1",
        assigned_teacher: "gv.nguyenvana",
      },
    },
    {
      id: "104",
      createdAt: "2026-11-04 10:15:30",
      actorId: "u-tea-01",
      actorName: "gv.nguyenvana",
      action: "round.finalize",
      targetTable: "evaluation_rounds",
      targetId: "round-r1",
      detail: {
        project_id: "proj-p01",
        round_title: "Đợt 1: Đánh giá tiến độ giữa kỳ",
        total_reviews_processed: 35,
      },
    },
    {
      id: "105",
      createdAt: "2026-11-04 09:40:12",
      actorId: "u-tea-01",
      actorName: "gv.nguyenvana",
      action: "score.publish",
      targetTable: "projects",
      targetId: "proj-p01",
      detail: {
        published_students_count: 35,
        result_version: 1,
      },
    },
    {
      id: "106",
      createdAt: "2026-11-03 17:10:44",
      actorId: "u-adm-01",
      actorName: "admin (Quản trị viên)",
      action: "user.import",
      targetTable: "class_students",
      targetId: "c-10a2",
      detail: {
        imported_count: 34,
        class_name: "10A2",
        source: "CSV_upload",
      },
    },
    {
      id: "107",
      createdAt: "2026-11-03 15:02:18",
      actorId: "u-tea-02",
      actorName: "gv.tranthib",
      action: "score.adjust",
      targetTable: "final_scores",
      targetId: "hs.lethic",
      detail: {
        student_username: "hs.lethic",
        computed_score: 7.8,
        adjusted_score: 8.5,
        reason: "Học sinh chủ động sửa lỗi nghiêm trọng trong mã nguồn của nhóm",
      },
    },
    {
      id: "108",
      createdAt: "2026-11-03 10:05:40",
      actorId: "u-adm-01",
      actorName: "admin (Quản trị viên)",
      action: "research.export",
      targetTable: "research_exports",
      targetId: "proj-p01",
      detail: {
        project_id: "proj-p01",
        key_version: 1,
        exported_students_count: 64,
        method: "HMAC_SHA256",
      },
    },
  ]);

  const filteredLogs = logs.filter((log) => {
    const matchSearch =
      log.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.targetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase());
    const matchAction = actionFilter === "all" || log.action === actionFilter;
    return matchSearch && matchAction;
  });

  return (
    <div className="space-y-6">
      {/* Tiêu đề & Giải thích */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Nhật ký kiểm toán hệ thống (Audit Logs)
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Theo dõi toàn bộ các thao tác quản trị, đăng nhập, điều chỉnh điểm số và thay đổi dữ liệu theo nguyên tắc chỉ ghi thêm (Append-only)
        </p>
      </div>

      {/* Bộ lọc và tìm kiếm */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo người thực hiện, đối tượng..."
            className="px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
          />

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="all">Tất cả hành động</option>
            <option value="user.create">user.create (Tạo tài khoản)</option>
            <option value="user.import">user.import (Nhập CSV)</option>
            <option value="class.assign">class.assign (Phân công lớp)</option>
            <option value="round.finalize">round.finalize (Đóng đợt đánh giá)</option>
            <option value="score.adjust">score.adjust (Chỉnh điểm)</option>
            <option value="score.publish">score.publish (Công bố điểm)</option>
            <option value="research.export">research.export (Xuất dữ liệu)</option>
            <option value="cron.keepalive">cron.keepalive (Duy trì định kỳ)</option>
          </select>
        </div>

        <span className="text-xs text-slate-400 self-start sm:self-auto italic">
          Bảng chỉ ghi thêm • Trigger forbid_mutation bảo vệ toàn vẹn
        </span>
      </div>

      {/* Bảng Audit Logs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-40">Thời điểm</th>
                <th className="py-3 px-4">Người thực hiện</th>
                <th className="py-3 px-4">Mã hành động</th>
                <th className="py-3 px-4">Bảng & Đối tượng đích</th>
                <th className="py-3 px-4">Tóm tắt chi tiết</th>
                <th className="py-3 px-4 text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Không tìm thấy nhật ký kiểm toán phù hợp
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                      {log.createdAt}
                    </td>
                    <td className="py-2.5 px-4 font-medium text-slate-900">
                      {log.actorName}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="font-mono bg-slate-100 text-indigo-800 font-bold px-2 py-0.5 rounded text-[11px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-700 text-[11px]">
                      <span className="text-slate-400">{log.targetTable}:</span> {log.targetId}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 truncate max-w-xs">
                      {JSON.stringify(log.detail)}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                      >
                        Xem JSON
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal xem chi tiết JSON payload */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-base font-bold text-slate-900">
                Chi tiết nhật ký: {selectedLog.action}
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Mã dòng nhật ký (ID):</span>
                <span className="font-mono font-bold text-slate-800">{selectedLog.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Thời điểm ghi nhận:</span>
                <span className="font-mono text-slate-800">{selectedLog.createdAt}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Người thực hiện:</span>
                <span className="font-medium text-slate-900">{selectedLog.actorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Đối tượng:</span>
                <span className="font-mono text-slate-800">
                  {selectedLog.targetTable} → {selectedLog.targetId}
                </span>
              </div>
            </div>

            <div>
              <span className="block text-xs font-semibold text-slate-700 mb-1">
                Payload JSON chi tiết (Không lưu mật khẩu hay phiếu thô):
              </span>
              <pre className="p-3 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-lg overflow-x-auto max-h-56 leading-relaxed">
                {JSON.stringify(selectedLog.detail, null, 2)}
              </pre>
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
