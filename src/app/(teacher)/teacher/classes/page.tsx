// [FE] Danh sách lớp phụ trách của giáo viên · tài liệu mục 3.3 và 4.5
"use client";

import React from "react";
import Link from "next/link";
import { PortalDataState } from "@/components/ui/portal-data-state";
import { usePortalData } from "@/hooks/use-portal-data";

interface TeacherDashboardData {
  classes: { id: string; name: string; grade: number }[];
  projects: { id: string; class_id: string; title: string; status: "draft" | "active" | "closed" }[];
  memberships: { class_id: string; student_id: string }[];
}

export default function TeacherClassesPage() {
  const { data, error, isLoading, refresh } = usePortalData<TeacherDashboardData>("teacherDashboard");

  if (isLoading) return <PortalDataState label="danh sách lớp phụ trách" />;
  if (error) return <PortalDataState label="danh sách lớp phụ trách" error={error} onRetry={refresh} />;

  const classes = data?.classes ?? [];
  const projects = data?.projects ?? [];
  const memberships = data?.memberships ?? [];

  const myClasses = classes.map((cls) => ({
    ...cls,
    studentCount: memberships.filter((member) => member.class_id === cls.id).length,
    projectCount: projects.filter((project) => project.class_id === cls.id).length,
  }));

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/teacher" className="hover:underline">
              Bàn làm việc GV
            </Link>
            <span>/</span>
            <span>Lớp học & Học sinh</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Quản lý Lớp học & Tài khoản Học sinh
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Chọn một lớp để tạo tài khoản từng em, nhập đồng loạt từ file Excel/CSV hoặc đặt lại mật khẩu về mặc định (Abc_1111)
          </p>
        </div>
      </div>

      {/* Danh sách các lớp */}
      {myClasses.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center space-y-3">
          <span className="text-4xl block">🏫</span>
          <h3 className="text-base font-bold text-slate-800">Chưa có lớp học được phân công</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Tài khoản của bạn hiện chưa được phân công lớp học nào. Hãy liên hệ Quản trị viên (Admin) để tạo lớp và gán giáo viên phụ trách.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myClasses.map((cls) => (
            <div
              key={cls.id}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-all space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      Khối {cls.grade}
                    </span>
                    <h2 className="text-lg font-bold text-slate-900 mt-1">Lớp {cls.name}</h2>
                  </div>
                  <span className="text-xs font-medium text-slate-500">
                    Sĩ số: <strong className="text-slate-900">{cls.studentCount}</strong> em
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Đang diễn ra <strong>{cls.projectCount}</strong> dự án học tập.
                </p>
              </div>

              {/* Thao tác */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                <Link
                  href={`/teacher/classes/${cls.id}`}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <span>👥</span> <span>Quản lý học sinh & Mật khẩu</span>
                </Link>
                <Link
                  href={`/teacher/classes/${cls.id}/students/import`}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <span>📥</span> <span>Nhập Excel / CSV</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

