// [FE] Quản lý danh sách lớp học · tài liệu mục 3.3, 4.5 và A3.2
"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { usePortalData } from "@/hooks/use-portal-data";
import { createClass, archiveClass } from "@/server/actions/classes";

interface AdminClassesData {
  classes: Array<{
    id: string;
    name: string;
    grade: number;
    school_year: string;
    teacher_id: string;
    archived_at: string | null;
  }>;
  profiles: Array<{
    id: string;
    username: string;
    full_name: string;
    role: string;
  }>;
  memberships: Array<{
    class_id: string;
    student_id: string;
  }>;
  projects: Array<{
    id: string;
    class_id: string;
  }>;
}

export default function AdminClassesPage() {
  const { data, error: loadError, isLoading, refresh } = usePortalData<AdminClassesData>("adminClasses");

  const [searchTerm, setSearchTerm] = useState("");
  const [gradeFilter, setGradeFilter] = useState<string>("all");
  const [showArchived, setShowArchived] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form tạo lớp mới
  const [newClassName, setNewClassName] = useState("");
  const [newGrade, setNewGrade] = useState<number>(10);
  const [newSchoolYear, setNewSchoolYear] = useState("2026-2027");
  const [newTeacherId, setNewTeacherId] = useState("");

  const teachers = useMemo(() => {
    return (data?.profiles ?? []).filter((p) => p.role === "teacher");
  }, [data]);

  const classes = useMemo(() => {
    if (!data) return [];
    const teacherMap = new Map(data.profiles.map((p) => [p.id, p]));
    return data.classes.map((c) => {
      const teacher = teacherMap.get(c.teacher_id);
      const studentCount = data.memberships.filter((m) => m.class_id === c.id).length;
      const projectCount = data.projects.filter((p) => p.class_id === c.id).length;
      return {
        id: c.id,
        name: c.name,
        grade: c.grade,
        schoolYear: c.school_year,
        teacherName: teacher?.full_name || "Chưa phân công",
        teacherUsername: teacher?.username || "—",
        studentCount,
        projectCount,
        isArchived: Boolean(c.archived_at),
      };
    });
  }, [data]);

  // Bộ lọc
  const filteredClasses = useMemo(() => {
    return classes.filter((c) => {
      if (!showArchived && c.isArchived) return false;
      if (showArchived && !c.isArchived) return false;

      const matchesSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.teacherUsername.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesGrade =
        gradeFilter === "all" || c.grade.toString() === gradeFilter;

      return matchesSearch && matchesGrade;
    });
  }, [classes, showArchived, searchTerm, gradeFilter]);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    setActionSuccess(null);

    const targetTeacherId = newTeacherId || teachers[0]?.id;
    if (!targetTeacherId) {
      setActionError("Hệ thống chưa có giáo viên nào để phân công phụ trách lớp.");
      return;
    }

    setSubmitting(true);
    const result = await createClass({
      name: newClassName.trim(),
      grade: Number(newGrade),
      schoolYear: newSchoolYear.trim(),
      teacherId: targetTeacherId,
    });
    setSubmitting(false);

    if (!result.ok) {
      setActionError(result.error);
      return;
    }

    setActionSuccess(`Tạo thành công lớp ${newClassName}!`);
    setNewClassName("");
    setIsModalOpen(false);
    refresh();
  };

  const handleArchiveClass = async (classId: string, className: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn lưu trữ lớp ${className}? Lớp học sẽ được ẩn khỏi danh sách chính.`)) {
      return;
    }
    setActionError(null);
    const result = await archiveClass({ classId });
    if (!result.ok) {
      setActionError(result.error);
      return;
    }
    refresh();
  };

  return (
    <div className="space-y-6">
      {/* Header & Tiêu đề */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Quản lý Lớp học
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý thông tin lớp, phân công giáo viên phụ trách và theo dõi sĩ số thực tế từ cơ sở dữ liệu
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>+</span>
          <span>Tạo lớp học mới</span>
        </button>
      </div>

      {(actionError || loadError) && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg">
          {actionError || loadError}
        </div>
      )}

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-lg">
          {actionSuccess}
        </div>
      )}

      {/* Bộ lọc và Tìm kiếm */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        <div className="flex flex-1 gap-3 flex-col sm:flex-row">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              🔍
            </span>
            <input
              type="text"
              placeholder="Tìm theo tên lớp, giáo viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Tất cả các khối</option>
            <option value="10">Khối 10</option>
            <option value="11">Khối 11</option>
            <option value="12">Khối 12</option>
          </select>
        </div>

        <div className="flex items-center gap-2 border-t md:border-t-0 pt-3 md:pt-0">
          <button
            onClick={() => setShowArchived(false)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              !showArchived
                ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Đang hoạt động ({classes.filter((c) => !c.isArchived).length})
          </button>
          <button
            onClick={() => setShowArchived(true)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              showArchived
                ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Đã lưu trữ ({classes.filter((c) => c.isArchived).length})
          </button>
        </div>
      </div>

      {/* Danh sách lớp học */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-12 text-center text-sm text-slate-500">
            Đang tải dữ liệu lớp học từ cơ sở dữ liệu...
          </div>
        ) : filteredClasses.length === 0 ? (
          <div className="py-12 text-center">
            <span className="text-3xl block mb-2">🏫</span>
            <p className="text-sm font-medium text-slate-700">
              Không tìm thấy lớp học nào phù hợp
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Thử thay đổi bộ lọc tìm kiếm hoặc tạo lớp học mới
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Tên lớp</th>
                  <th className="py-3 px-4">Khối</th>
                  <th className="py-3 px-4">Niên khóa</th>
                  <th className="py-3 px-4">Giáo viên phụ trách</th>
                  <th className="py-3 px-4 text-center">Sĩ số học sinh</th>
                  <th className="py-3 px-4 text-center">Dự án</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClasses.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <Link
                        href={`/admin/classes/${item.id}`}
                        className="hover:text-indigo-600 hover:underline"
                      >
                        {item.name}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-xs">
                        Khối {item.grade}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                      {item.schoolYear}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-900">
                        {item.teacherName}
                      </div>
                      <div className="text-xs text-slate-500 font-mono">
                        @{item.teacherUsername}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-semibold text-slate-800">
                      {item.studentCount} HS
                    </td>
                    <td className="py-3.5 px-4 text-center font-semibold text-indigo-700">
                      {item.projectCount}
                    </td>
                    <td className="py-3.5 px-4">
                      {item.isArchived ? (
                        <Badge variant="default">Đã lưu trữ</Badge>
                      ) : (
                        <Badge variant="success">Hoạt động</Badge>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/classes/${item.id}`}
                          className="px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded transition-colors"
                        >
                          Chi tiết
                        </Link>
                        {!item.isArchived && (
                          <button
                            onClick={() => handleArchiveClass(item.id, item.name)}
                            className="px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                          >
                            Lưu trữ
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal tạo lớp mới */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-lg">
                Tạo lớp học mới
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên lớp (VD: 10C4, 10C5, 11A1...)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nhập tên lớp..."
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Khối lớp
                  </label>
                  <select
                    value={newGrade}
                    onChange={(e) => setNewGrade(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value={10}>Khối 10</option>
                    <option value={11}>Khối 11</option>
                    <option value={12}>Khối 12</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Niên khóa
                  </label>
                  <input
                    type="text"
                    required
                    value={newSchoolYear}
                    onChange={(e) => setNewSchoolYear(e.target.value)}
                    placeholder="2026-2027"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phân công Giáo viên phụ trách
                </label>
                <select
                  value={newTeacherId}
                  onChange={(e) => setNewTeacherId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.full_name} (@{t.username})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg shadow-sm cursor-pointer"
                >
                  {submitting ? "Đang tạo..." : "Xác nhận tạo lớp"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
