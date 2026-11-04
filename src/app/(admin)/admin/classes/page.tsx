// [FE] Quản lý danh sách lớp học · tài liệu mục 3.3, 4.5 và A3.2
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface ClassItem {
  id: string;
  name: string;
  grade: number;
  schoolYear: string;
  teacherName: string;
  teacherUsername: string;
  studentCount: number;
  projectCount: number;
  isArchived: boolean;
}

export default function AdminClassesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([
    {
      id: "c-10a1",
      name: "10A1",
      grade: 10,
      schoolYear: "2026-2027",
      teacherName: "Nguyễn Văn An",
      teacherUsername: "gv.nguyenvana",
      studentCount: 35,
      projectCount: 2,
      isArchived: false,
    },
    {
      id: "c-10a2",
      name: "10A2",
      grade: 10,
      schoolYear: "2026-2027",
      teacherName: "Nguyễn Văn An",
      teacherUsername: "gv.nguyenvana",
      studentCount: 34,
      projectCount: 1,
      isArchived: false,
    },
    {
      id: "c-11a1",
      name: "11A1",
      grade: 11,
      schoolYear: "2026-2027",
      teacherName: "Trần Thị Bích",
      teacherUsername: "gv.tranthib",
      studentCount: 36,
      projectCount: 2,
      isArchived: false,
    },
    {
      id: "c-11a2",
      name: "11A2",
      grade: 11,
      schoolYear: "2026-2027",
      teacherName: "Trần Thị Bích",
      teacherUsername: "gv.tranthib",
      studentCount: 35,
      projectCount: 1,
      isArchived: false,
    },
    {
      id: "c-12a1",
      name: "12A1",
      grade: 12,
      schoolYear: "2026-2027",
      teacherName: "Lê Quang Cường",
      teacherUsername: "gv.lequangc",
      studentCount: 38,
      projectCount: 1,
      isArchived: false,
    },
    {
      id: "c-10a1-old",
      name: "10A1",
      grade: 10,
      schoolYear: "2025-2026",
      teacherName: "Nguyễn Văn An",
      teacherUsername: "gv.nguyenvana",
      studentCount: 36,
      projectCount: 2,
      isArchived: true,
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [gradeFilter, setGradeFilter] = useState<string>("all");
  const [showArchived, setShowArchived] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form tạo lớp mới
  const [newClassName, setNewClassName] = useState("");
  const [newGrade, setNewGrade] = useState<number>(10);
  const [newSchoolYear, setNewSchoolYear] = useState("2026-2027");
  const [newTeacher, setNewTeacher] = useState("gv.nguyenvana");

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    // Kiểm tra tên lớp duy nhất trong cùng năm học
    const duplicate = classes.some(
      (c) =>
        c.name.toLowerCase() === newClassName.trim().toLowerCase() &&
        c.schoolYear === newSchoolYear &&
        !c.isArchived
    );

    if (duplicate) {
      alert(`Lớp ${newClassName} đã tồn tại trong năm học ${newSchoolYear}!`);
      return;
    }

    const teacherMap: Record<string, string> = {
      "gv.nguyenvana": "Nguyễn Văn An",
      "gv.tranthib": "Trần Thị Bích",
      "gv.lequangc": "Lê Quang Cường",
    };

    const newClass: ClassItem = {
      id: `c-${Date.now()}`,
      name: newClassName.trim().toUpperCase(),
      grade: Number(newGrade),
      schoolYear: newSchoolYear,
      teacherName: teacherMap[newTeacher] || "Chưa phân công",
      teacherUsername: newTeacher,
      studentCount: 0,
      projectCount: 0,
      isArchived: false,
    };

    setClasses([newClass, ...classes]);
    setIsModalOpen(false);
    setNewClassName("");
  };

  const handleToggleArchive = (id: string, name: string, isArchived: boolean) => {
    const action = isArchived ? "khôi phục" : "lưu trữ";
    if (confirm(`Bạn có chắc muốn ${action} lớp ${name}? Lớp lưu trữ sẽ ẩn khỏi danh sách giáo viên.`)) {
      setClasses(
        classes.map((c) => (c.id === id ? { ...c, isArchived: !isArchived } : c))
      );
    }
  };

  const filteredClasses = classes.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.teacherName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchGrade = gradeFilter === "all" || c.grade.toString() === gradeFilter;
    const matchArchived = showArchived ? true : !c.isArchived;

    return matchSearch && matchGrade && matchArchived;
  });

  return (
    <div className="space-y-6">
      {/* Tiêu đề & Hành động */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Quản lý Lớp học THPT
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Thiết lập niên khóa, phân công giáo viên phụ trách và quản lý ghi danh học sinh
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
        >
          + Tạo lớp học mới
        </button>
      </div>

      {/* Bộ lọc và tìm kiếm */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm tên lớp hoặc giáo viên..."
            className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
          />

          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="all">Tất cả các khối</option>
            <option value="10">Khối 10</option>
            <option value="11">Khối 11</option>
            <option value="12">Khối 12</option>
          </select>
        </div>

        <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer self-start sm:self-auto">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
            className="rounded text-indigo-600 focus:ring-indigo-500"
          />
          <span>Hiện cả lớp đã lưu trữ</span>
        </label>
      </div>

      {/* Bảng danh sách lớp học */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Tên lớp</th>
                <th className="py-3.5 px-4">Khối</th>
                <th className="py-3.5 px-4">Năm học</th>
                <th className="py-3.5 px-4">Giáo viên phụ trách</th>
                <th className="py-3.5 px-4 text-center">Học sinh ghi danh</th>
                <th className="py-3.5 px-4 text-center">Số dự án</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClasses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Không tìm thấy lớp học nào khớp với điều kiện lọc
                  </td>
                </tr>
              ) : (
                filteredClasses.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <Link
                        href={`/admin/classes/${c.id}`}
                        className="text-indigo-600 hover:text-indigo-800 hover:underline"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">
                      Khối {c.grade}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-600">
                      {c.schoolYear}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      <div>{c.teacherName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        @{c.teacherUsername}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-full text-xs">
                        {c.studentCount} HS
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-indigo-700">
                      {c.projectCount}
                    </td>
                    <td className="py-3 px-4">
                      {c.isArchived ? (
                        <Badge variant="default">Đã lưu trữ</Badge>
                      ) : (
                        <Badge variant="success">Đang học</Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <Link
                        href={`/admin/classes/${c.id}`}
                        className="text-xs font-semibold text-indigo-600 hover:underline"
                      >
                        Chi tiết HS
                      </Link>
                      <button
                        onClick={() => handleToggleArchive(c.id, c.name, c.isArchived)}
                        className={`text-xs font-semibold hover:underline ${
                          c.isArchived ? "text-emerald-600" : "text-amber-600"
                        }`}
                      >
                        {c.isArchived ? "Khôi phục" : "Lưu trữ"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tạo lớp học mới */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Tạo lớp học mới</h3>
            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên lớp học <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="Ví dụ: 10A3"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Khối học
                  </label>
                  <select
                    value={newGrade}
                    onChange={(e) => setNewGrade(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value={10}>Khối 10</option>
                    <option value={11}>Khối 11</option>
                    <option value={12}>Khối 12</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Năm học
                  </label>
                  <input
                    type="text"
                    required
                    value={newSchoolYear}
                    onChange={(e) => setNewSchoolYear(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phân công Giáo viên phụ trách
                </label>
                <select
                  value={newTeacher}
                  onChange={(e) => setNewTeacher(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="gv.nguyenvana">Nguyễn Văn An (gv.nguyenvana)</option>
                  <option value="gv.tranthib">Trần Thị Bích (gv.tranthib)</option>
                  <option value="gv.lequangc">Lê Quang Cường (gv.lequangc)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  Tạo lớp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
