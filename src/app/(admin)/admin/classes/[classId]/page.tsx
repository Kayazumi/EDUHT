// [FE] Chi tiết một lớp học · tài liệu mục 3.3, 4.5 và A3.2
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface StudentItem {
  id: string;
  username: string;
  fullName: string;
  consentStatus: "granted" | "pending" | "declined";
  isInGroup: boolean; // Nếu true: chặn gỡ khỏi lớp (INV-02)
  enrolledAt: string;
}

export default function AdminClassDetailPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const [resolvedClassId, setResolvedClassId] = useState<string>("");
  const [teacher, setTeacher] = useState({
    username: "gv.nguyenvana",
    fullName: "Nguyễn Văn An",
  });
  const [isChangingTeacher, setIsChangingTeacher] = useState(false);
  const [newTeacherUsername, setNewTeacherUsername] = useState("gv.tranthib");
  const [hasRunningProjects] = useState(true);

  const [students, setStudents] = useState<StudentItem[]>([
    {
      id: "s-1",
      username: "hs.mau01",
      fullName: "Học Sinh Mẫu 1",
      consentStatus: "granted",
      isInGroup: true,
      enrolledAt: "2026-09-05",
    },
    {
      id: "s-2",
      username: "hs.mau02",
      fullName: "Học Sinh Mẫu 2",
      consentStatus: "granted",
      isInGroup: true,
      enrolledAt: "2026-09-05",
    },
    {
      id: "s-3",
      username: "hs.nguyenquanga",
      fullName: "Nguyễn Quang Anh",
      consentStatus: "granted",
      isInGroup: false,
      enrolledAt: "2026-09-05",
    },
    {
      id: "s-4",
      username: "hs.tranminhb",
      fullName: "Trần Minh Bình",
      consentStatus: "pending",
      isInGroup: false,
      enrolledAt: "2026-09-06",
    },
    {
      id: "s-5",
      username: "hs.phamthid",
      fullName: "Phạm Thị Dung",
      consentStatus: "declined",
      isInGroup: false,
      enrolledAt: "2026-09-06",
    },
  ]);

  const [addStudentInput, setAddStudentInput] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  React.useEffect(() => {
    params.then((p) => setResolvedClassId(p.classId));
  }, [params]);

  const classInfo = {
    id: resolvedClassId || "c-10a1",
    name: "10A1",
    grade: 10,
    schoolYear: "2026-2027",
    runningProjectsCount: 2,
  };

  const handleUpdateTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasRunningProjects) {
      if (
        !confirm(
          "CẢNH BÁO: Lớp học này đang có dự án chạy. Đổi giáo viên phụ trách sẽ chuyển quyền quản lý dự án và chấm điểm sang giáo viên mới. Bạn có chắc chắn muốn đổi?"
        )
      ) {
        return;
      }
    }
    const map: Record<string, string> = {
      "gv.nguyenvana": "Nguyễn Văn An",
      "gv.tranthib": "Trần Thị Bích",
      "gv.lequangc": "Lê Quang Cường",
    };
    setTeacher({
      username: newTeacherUsername,
      fullName: map[newTeacherUsername] || "Giáo viên mới",
    });
    setIsChangingTeacher(false);
  };

  const handleRemoveStudent = (student: StudentItem) => {
    // Kiểm tra ràng buộc INV-02
    if (student.isInGroup) {
      alert(
        `KHÔNG THỂ GỠ: Học sinh @${student.username} hiện đang thuộc một nhóm trong dự án đang thực hiện. Khóa ngoại INV-02 chặn gỡ học sinh khỏi lớp khi còn nằm trong nhóm.`
      );
      return;
    }

    if (confirm(`Bạn có chắc chắn muốn gỡ học sinh @${student.username} khỏi lớp ${classInfo.name}?`)) {
      setStudents(students.filter((s) => s.id !== student.id));
    }
  };

  const handleAddStudents = (e: React.FormEvent) => {
    e.preventDefault();
    const usernames = addStudentInput
      .split(/[\n, ]+/)
      .map((u) => u.trim())
      .filter((u) => u.length > 0);

    if (usernames.length === 0) return;

    const newEntries: StudentItem[] = usernames.map((u, idx) => ({
      id: `s-new-${Date.now()}-${idx}`,
      username: u.replace(/^@/, ""),
      fullName: `Học sinh (${u})`,
      consentStatus: "pending",
      isInGroup: false,
      enrolledAt: new Date().toISOString().slice(0, 10),
    }));

    setStudents([...students, ...newEntries]);
    setAddStudentInput("");
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/admin/classes" className="hover:underline">
              Quản lý lớp học
            </Link>
            <span>/</span>
            <span className="font-bold text-slate-900">{classInfo.name}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <span>Chi tiết Lớp {classInfo.name}</span>
            <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full font-semibold">
              Khối {classInfo.grade} • Năm học {classInfo.schoolYear}
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Mã định danh lớp học (UUID): <code className="font-mono text-xs text-indigo-700">{classInfo.id}</code>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm"
          >
            + Thêm học sinh vào lớp
          </button>
          <Link
            href="/admin/classes"
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-medium rounded-lg"
          >
            ← Về danh sách lớp
          </Link>
        </div>
      </div>

      {/* Thông tin giáo viên & Cảnh báo dự án */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm col-span-2 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Giáo viên phụ trách lớp
              </span>
              <div className="text-lg font-bold text-slate-900">{teacher.fullName}</div>
              <div className="text-xs font-mono text-indigo-700">@{teacher.username}</div>
            </div>
            <button
              onClick={() => setIsChangingTeacher(!isChangingTeacher)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
            >
              {isChangingTeacher ? "Đóng" : "Thay đổi giáo viên"}
            </button>
          </div>

          {isChangingTeacher && (
            <form onSubmit={handleUpdateTeacher} className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
              <select
                value={newTeacherUsername}
                onChange={(e) => setNewTeacherUsername(e.target.value)}
                className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="gv.nguyenvana">Nguyễn Văn An (gv.nguyenvana)</option>
                <option value="gv.tranthib">Trần Thị Bích (gv.tranthib)</option>
                <option value="gv.lequangc">Lê Quang Cường (gv.lequangc)</option>
              </select>
              <button
                type="submit"
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm"
              >
                Lưu thay đổi
              </button>
            </form>
          )}

          {hasRunningProjects && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-2">
              <span>⚠️</span>
              <span>
                Lớp này hiện có <strong>2 dự án PBL đang chạy</strong>. Mọi thao tác gỡ học sinh hoặc thay đổi giáo viên sẽ được kiểm soát chặt chẽ để bảo toàn dữ liệu đánh giá đồng đẳng.
              </span>
            </div>
          )}
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Thống kê sĩ số lớp
          </span>
          <div className="my-2">
            <div className="text-3xl font-extrabold text-slate-900">
              {students.length} <span className="text-sm font-medium text-slate-500">học sinh</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Đồng ý nghiên cứu:{" "}
              <strong className="text-emerald-700">
                {students.filter((s) => s.consentStatus === "granted").length}
              </strong>{" "}
              / {students.length}
            </div>
          </div>
          <span className="text-xs text-slate-400">Niên khóa chuẩn 2026 - 2027</span>
        </div>
      </div>

      {/* Danh sách học sinh ghi danh */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Danh sách học sinh ghi danh ({students.length})
          </h2>
          <span className="text-xs text-slate-500">
            Bảo đảm bất biến INV-02: Học sinh trong nhóm phải đang ghi danh tại lớp
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-12 text-center">STT</th>
                <th className="py-3 px-4">Tên đăng nhập</th>
                <th className="py-3 px-4">Họ và tên</th>
                <th className="py-3 px-4">Đồng ý nghiên cứu</th>
                <th className="py-3 px-4">Trạng thái nhóm</th>
                <th className="py-3 px-4">Ngày ghi danh</th>
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
                  <td className="py-2.5 px-4">
                    {student.consentStatus === "granted" && (
                      <Badge variant="success">Đã đồng ý</Badge>
                    )}
                    {student.consentStatus === "pending" && (
                      <Badge variant="warning">Chờ xác nhận</Badge>
                    )}
                    {student.consentStatus === "declined" && (
                      <Badge variant="danger">Từ chối</Badge>
                    )}
                  </td>
                  <td className="py-2.5 px-4">
                    {student.isInGroup ? (
                      <span className="text-indigo-700 font-semibold bg-indigo-50 px-2 py-0.5 rounded">
                        Đang trong nhóm PBL
                      </span>
                    ) : (
                      <span className="text-slate-400">Chưa vào nhóm</span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-slate-500">
                    {student.enrolledAt}
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <button
                      onClick={() => handleRemoveStudent(student)}
                      className={`font-semibold hover:underline ${
                        student.isInGroup ? "text-slate-400 cursor-not-allowed" : "text-rose-600 hover:text-rose-800"
                      }`}
                      title={student.isInGroup ? "Chặn gỡ vì học sinh đang thuộc nhóm dự án (INV-02)" : "Gỡ học sinh khỏi lớp"}
                    >
                      Gỡ khỏi lớp
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Thêm học sinh vào lớp */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Thêm học sinh vào lớp {classInfo.name}
            </h3>
            <p className="text-xs text-slate-500">
              Dán danh sách tên đăng nhập (username) của học sinh, phân tách bằng dấu phẩy, khoảng trắng hoặc xuống dòng.
            </p>
            <form onSubmit={handleAddStudents} className="space-y-4">
              <div>
                <textarea
                  rows={5}
                  required
                  value={addStudentInput}
                  onChange={(e) => setAddStudentInput(e.target.value)}
                  placeholder="hs.nguyenvana&#10;hs.tranthib&#10;hs.lequangc"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  Ghi danh vào lớp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
