// [FE] Lớp của tôi, học sinh · tài liệu mục 3.3, 4.5 và A3.3
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface StudentRow {
  id: string;
  username: string;
  fullName: string;
  groupName: string;
  consentStatus: "granted" | "pending" | "declined";
  consentedBy?: "student" | "guardian" | "both";
}

function createTempPassword(username: string): string {
  return `Hs@${username.replace(/[^a-zA-Z0-9]/g, "")}99`;
}

export default function TeacherClassDetailPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const [resolvedClassId, setResolvedClassId] = useState("");
  const [tempPasswordModal, setTempPasswordModal] = useState<{
    username: string;
    pass: string;
  } | null>(null);

  const [students, setStudents] = useState<StudentRow[]>([
    {
      id: "s-1",
      username: "hs.mau01",
      fullName: "Học Sinh Mẫu 1",
      groupName: "Nhóm 01",
      consentStatus: "granted",
      consentedBy: "both",
    },
    {
      id: "s-2",
      username: "hs.mau02",
      fullName: "Học Sinh Mẫu 2",
      groupName: "Nhóm 01",
      consentStatus: "granted",
      consentedBy: "student",
    },
    {
      id: "s-3",
      username: "hs.nguyenquanga",
      fullName: "Nguyễn Quang Anh",
      groupName: "Nhóm 02",
      consentStatus: "granted",
      consentedBy: "guardian",
    },
    {
      id: "s-4",
      username: "hs.tranminhb",
      fullName: "Trần Minh Bình",
      groupName: "Nhóm 02",
      consentStatus: "pending",
    },
    {
      id: "s-5",
      username: "hs.phamthid",
      fullName: "Phạm Thị Dung",
      groupName: "Nhóm 03",
      consentStatus: "declined",
      consentedBy: "guardian",
    },
  ]);

  const [consentModalStudent, setConsentModalStudent] = useState<StudentRow | null>(null);
  const [formVersion, setFormVersion] = useState("v1.0");
  const [selectedConsentStatus, setSelectedConsentStatus] = useState<"granted" | "declined">("granted");
  const [selectedParty, setSelectedParty] = useState<"student" | "guardian" | "both">("both");

  React.useEffect(() => {
    params.then((p) => setResolvedClassId(p.classId));
  }, [params]);

  const classInfo = {
    id: resolvedClassId || "c-10a1",
    name: "10A1",
    grade: 10,
    schoolYear: "2026-2027",
    projects: [
      { id: "proj-p01", name: "Dự án Tin học 10: Xây dựng Trang web cá nhân", status: "active" },
    ],
  };

  const handleResetPassword = (username: string) => {
    if (confirm(`Đặt lại mật khẩu cho học sinh @${username}? Mật khẩu tạm thời sẽ hiển thị duy nhất một lần.`)) {
      const generated = createTempPassword(username);
      setTempPasswordModal({ username, pass: generated });
    }
  };

  const handleSaveConsent = () => {
    if (!consentModalStudent) return;
    setStudents(
      students.map((s) =>
        s.id === consentModalStudent.id
          ? {
              ...s,
              consentStatus: selectedConsentStatus,
              consentedBy: selectedParty,
            }
          : s
      )
    );
    setConsentModalStudent(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/teacher" className="hover:underline">
              Tổng quan
            </Link>
            <span>/</span>
            <span>Lớp phụ trách</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <span>Lớp {classInfo.name}</span>
            <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full font-semibold">
              Khối {classInfo.grade} • Năm học {classInfo.schoolYear}
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Giáo viên phụ trách lớp quản lý danh sách học sinh, đồng ý nghiên cứu và mở dự án
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/teacher/classes/${classInfo.id}/students/import`}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm"
          >
            + Nhập học sinh (CSV)
          </Link>
          <Link
            href="/teacher/projects/new"
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-medium rounded-lg"
          >
            Mở dự án mới
          </Link>
        </div>
      </div>

      {/* Hiển thị mật khẩu tạm */}
      {tempPasswordModal && (
        <div className="bg-amber-50 border-2 border-amber-400 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-amber-900 text-sm">
              🔑 Mật khẩu tạm thời mới của học sinh @{tempPasswordModal.username}
            </span>
            <button
              onClick={() => setTempPasswordModal(null)}
              className="text-xs text-amber-800 hover:underline"
            >
              Đóng ✕
            </button>
          </div>
          <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-amber-200">
            <span className="font-mono text-xl font-extrabold text-indigo-700">
              {tempPasswordModal.pass}
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(tempPasswordModal.pass);
                alert("Đã sao chép mật khẩu!");
              }}
              className="px-3 py-1 bg-indigo-600 text-white text-xs font-semibold rounded-md"
            >
              Sao chép
            </button>
          </div>
          <p className="text-xs text-amber-800">
            Mật khẩu chỉ hiển thị một lần. Hãy bàn giao trực tiếp cho học sinh.
          </p>
        </div>
      )}

      {/* Dự án của lớp */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
          Dự án PBL của lớp {classInfo.name}
        </h2>
        <div className="flex flex-wrap gap-3">
          {classInfo.projects.map((proj) => (
            <Link
              key={proj.id}
              href={`/teacher/projects/${proj.id}`}
              className="p-3 border border-slate-200 rounded-lg hover:border-indigo-400 transition-colors flex items-center justify-between gap-4 w-full sm:w-96"
            >
              <div>
                <span className="font-semibold text-xs text-slate-900 block">
                  {proj.name}
                </span>
                <span className="text-[11px] text-emerald-600 font-medium">
                  Trạng thái: Đang chạy (Active)
                </span>
              </div>
              <span className="text-xs text-indigo-600 font-semibold">Xem dự án →</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Bảng danh sách học sinh */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Danh sách học sinh lớp {classInfo.name} ({students.length})
          </h2>
          <span className="text-xs text-slate-500">
            Đã đồng ý:{" "}
            <strong>{students.filter((s) => s.consentStatus === "granted").length}</strong> em
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-12 text-center">STT</th>
                <th className="py-3 px-4">Tên đăng nhập</th>
                <th className="py-3 px-4">Họ và tên</th>
                <th className="py-3 px-4">Nhóm trong dự án</th>
                <th className="py-3 px-4">Đồng ý nghiên cứu</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((student, idx) => (
                <tr key={student.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-4 text-center font-mono text-slate-400">
                    {idx + 1}
                  </td>
                  <td className="py-2.5 px-4 font-mono font-medium text-slate-900">
                    @{student.username}
                  </td>
                  <td className="py-2.5 px-4 font-medium text-slate-800">
                    {student.fullName}
                  </td>
                  <td className="py-2.5 px-4 font-semibold text-indigo-700">
                    {student.groupName}
                  </td>
                  <td className="py-2.5 px-4">
                    {student.consentStatus === "granted" && (
                      <Badge variant="success">
                        Đồng ý ({student.consentedBy === "both" ? "HS & PH" : student.consentedBy})
                      </Badge>
                    )}
                    {student.consentStatus === "pending" && (
                      <Badge variant="warning">Chờ xác nhận</Badge>
                    )}
                    {student.consentStatus === "declined" && (
                      <Badge variant="danger">Từ chối</Badge>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-right space-x-2">
                    <button
                      onClick={() => setConsentModalStudent(student)}
                      className="text-xs font-semibold text-indigo-600 hover:underline"
                    >
                      Ghi nhận đồng ý
                    </button>
                    <button
                      onClick={() => handleResetPassword(student.username)}
                      className="text-xs font-semibold text-amber-600 hover:underline"
                    >
                      Reset mật khẩu
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Ghi nhận đồng ý nghiên cứu */}
      {consentModalStudent && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Ghi nhận đồng ý nghiên cứu: {consentModalStudent.fullName}
            </h3>
            <p className="text-xs text-slate-500">
              Cập nhật thông tin phiếu đồng ý tham gia nghiên cứu (gọi thủ tục <code className="font-mono text-indigo-700">record_consent</code>).
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Trạng thái đồng ý
                </label>
                <select
                  value={selectedConsentStatus}
                  onChange={(e) => setSelectedConsentStatus(e.target.value as "granted" | "declined")}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="granted">Đồng ý tham gia (Granted)</option>
                  <option value="declined">Từ chối tham gia (Declined)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Bên ký phiếu xác nhận
                </label>
                <select
                  value={selectedParty}
                  onChange={(e) => setSelectedParty(e.target.value as "student" | "guardian" | "both")}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="both">Cả học sinh và phụ huynh (both)</option>
                  <option value="student">Chỉ học sinh (student)</option>
                  <option value="guardian">Chỉ phụ huynh (guardian)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Phiên bản mẫu phiếu (form_version)
                </label>
                <input
                  type="text"
                  value={formVersion}
                  onChange={(e) => setFormVersion(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConsentModalStudent(null)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveConsent}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg"
              >
                Lưu vào hệ thống
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
