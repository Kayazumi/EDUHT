// [FE] Quản lý nhóm dự án và phân công thành viên thực tế từ CSDL
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { PortalDataState } from "@/components/ui/portal-data-state";
import { usePortalData } from "@/hooks/use-portal-data";
import {
  createGroup,
  renameGroup,
  deleteGroup,
  assignMember,
  removeMember,
} from "@/server/actions/groups";

interface GroupData {
  id: string;
  name: string;
  locked_at: string | null;
}

interface MemberData {
  group_id: string;
  student_id: string;
  project_id: string;
}

interface StudentData {
  id: string;
  username: string;
  full_name: string;
  student_code: string | null;
}

interface TeacherGroupsData {
  project?: {
    id: string;
    title: string;
    class_id: string;
  };
  groups: GroupData[];
  members: MemberData[];
  students: StudentData[];
}

export default function TeacherProjectGroupsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const [resolvedId, setResolvedId] = useState("");
  const { data, error, isLoading, refresh } = usePortalData<TeacherGroupsData>(
    "teacherGroups",
    resolvedId
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [busyStudentId, setBusyStudentId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Lưu lựa chọn nhóm mục tiêu cho từng học sinh chưa phân nhóm
  const [selectedGroupForStudent, setSelectedGroupForStudent] = useState<Record<string, string>>({});

  // Chỉnh sửa tên nhóm inline
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingGroupName, setEditingGroupName] = useState("");

  React.useEffect(() => {
    params.then((p) => setResolvedId(p.projectId));
  }, [params]);

  if (!resolvedId || isLoading) return <PortalDataState label="nhóm và danh sách học sinh" />;
  if (error) return <PortalDataState label="nhóm và danh sách học sinh" error={error} onRetry={refresh} />;
  if (!data) return <PortalDataState label="nhóm và danh sách học sinh" error="Không tìm thấy dữ liệu nhóm dự án." onRetry={refresh} />;

  const groups = data.groups ?? [];
  const members = data.members ?? [];
  const allStudents = data.students ?? [];
  const projectTitle = data.project?.title || "Dự án học tập";

  // Danh sách học sinh chưa có nhóm
  const assignedStudentIds = new Set(members.map((m) => m.student_id));
  const unassignedStudents = allStudents.filter((s) => !assignedStudentIds.has(s.id));

  // Lọc tìm kiếm học sinh
  const filteredUnassigned = unassignedStudents.filter((s) => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    return (
      s.full_name.toLowerCase().includes(q) ||
      s.username.toLowerCase().includes(q) ||
      (s.student_code && s.student_code.toLowerCase().includes(q))
    );
  });

  // Xử lý thêm học sinh vào nhóm (Lưu trực tiếp vào CSDL)
  const handleAssignStudent = async (studentId: string, groupId: string) => {
    if (!groupId) {
      setActionError("Vui lòng chọn một nhóm để phân công học sinh.");
      return;
    }
    setActionError(null);
    setActionSuccess(null);
    setBusyStudentId(studentId);

    const result = await assignMember({
      projectId: resolvedId,
      groupId,
      studentId,
    });
    setBusyStudentId(null);

    if (!result.ok) {
      setActionError(result.error);
      return;
    }

    const student = allStudents.find((s) => s.id === studentId);
    const group = groups.find((g) => g.id === groupId);
    setActionSuccess(`Đã thêm học sinh "${student?.full_name}" vào "${group?.name}" thành công vào cơ sở dữ liệu!`);
    refresh();
  };

  // Xử lý gỡ học sinh khỏi nhóm (Xóa trực tiếp khỏi CSDL)
  const handleRemoveStudent = async (studentId: string, groupId: string) => {
    const student = allStudents.find((s) => s.id === studentId);
    if (!confirm(`Bạn có chắc muốn gỡ học sinh "${student?.full_name || "này"}" ra khỏi nhóm?`)) {
      return;
    }
    setActionError(null);
    setActionSuccess(null);
    setBusyStudentId(studentId);

    const result = await removeMember({
      groupId,
      studentId,
    });
    setBusyStudentId(null);

    if (!result.ok) {
      setActionError(result.error);
      return;
    }

    setActionSuccess(`Đã gỡ học sinh "${student?.full_name}" khỏi nhóm và cập nhật vào cơ sở dữ liệu!`);
    refresh();
  };

  // Xử lý tạo nhóm mới
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    setActionError(null);
    setActionSuccess(null);
    setIsCreatingGroup(true);

    const result = await createGroup({
      projectId: resolvedId,
      name: newGroupName.trim(),
    });
    setIsCreatingGroup(false);

    if (!result.ok) {
      setActionError(result.error);
      return;
    }

    setActionSuccess(`Đã tạo nhóm "${newGroupName.trim()}" thành công!`);
    setNewGroupName("");
    refresh();
  };

  // Xử lý đổi tên nhóm
  const handleSaveRename = async (groupId: string) => {
    if (!editingGroupName.trim()) {
      setEditingGroupId(null);
      return;
    }
    setActionError(null);
    const result = await renameGroup({
      groupId,
      name: editingGroupName.trim(),
    });
    setEditingGroupId(null);

    if (!result.ok) {
      setActionError(result.error);
      return;
    }

    refresh();
  };

  // Xử lý xóa nhóm
  const handleDeleteGroup = async (groupId: string, groupName: string) => {
    const groupMemberCount = members.filter((m) => m.group_id === groupId).length;
    const confirmMsg = groupMemberCount > 0
      ? `Nhóm "${groupName}" đang có ${groupMemberCount} học sinh. Bạn có chắc muốn xóa nhóm này? Các học sinh sẽ trở về trạng thái chưa có nhóm.`
      : `Bạn có chắc muốn xóa nhóm "${groupName}"?`;

    if (!confirm(confirmMsg)) return;

    setActionError(null);
    const result = await deleteGroup({ groupId });
    if (!result.ok) {
      setActionError(result.error);
      return;
    }

    setActionSuccess(`Đã xóa nhóm "${groupName}" thành công!`);
    refresh();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <Link href="/teacher" className="hover:underline">Bàn làm việc</Link>
            <span>/</span>
            <Link href="/teacher/projects" className="hover:underline">Dự án</Link>
            <span>/</span>
            <Link href={`/teacher/projects/${resolvedId}`} className="hover:underline truncate max-w-[200px]">
              {projectTitle}
            </Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-slate-200 font-medium">Nhóm & Phân công</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-title">
            Phân nhóm & Quản lý thành viên
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Dữ liệu nhóm và thành viên được lưu trực tiếp vào cơ sở dữ liệu. Mọi thay đổi đều được lưu vĩnh viễn.
          </p>
        </div>

        {/* Nút quay lại tổng quan dự án */}
        <div className="flex items-center gap-2">
          <Link
            href={`/teacher/projects/${resolvedId}`}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            ← Về tổng quan dự án
          </Link>
          <Link
            href={`/teacher/projects/${resolvedId}/dashboard`}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            Xem tiến độ dự án →
          </Link>
        </div>
      </div>

      {/* Thông báo Thành công / Lỗi */}
      {actionSuccess && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold">✓</span>
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-600 hover:underline cursor-pointer">✕</button>
        </div>
      )}

      {actionError && (
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold">⚠️</span>
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-rose-600 hover:underline cursor-pointer">✕</button>
        </div>
      )}

      {/* Thẻ thống kê tổng quan */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Tổng số học sinh lớp</span>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
            {allStudents.length} <span className="text-xs text-slate-500 font-normal">học sinh</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Đã phân vào nhóm</span>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {allStudents.length - unassignedStudents.length} <span className="text-xs text-slate-500 font-normal">em ({groups.length} nhóm)</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Chưa có nhóm (Sẵn sàng xếp)</span>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
            {unassignedStudents.length} <span className="text-xs text-slate-500 font-normal">học sinh</span>
          </div>
        </div>
      </div>

      {/* KHỐI 1: HỌC SINH CHƯA CÓ NHÓM (CÓ TÌM KIẾM & NÚT THÊM THẬT VÀO CSDL) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-title flex items-center gap-2">
              <span>Học sinh chưa có nhóm</span>
              <Badge variant={unassignedStudents.length === 0 ? "success" : "warning"}>
                {unassignedStudents.length} em
              </Badge>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Chọn nhóm mục tiêu và nhấn &quot;Thêm vào nhóm&quot; để lưu trực tiếp vào cơ sở dữ liệu.
            </p>
          </div>

          {/* Ô Tìm kiếm học sinh */}
          <div className="w-full sm:w-72 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="🔍 Tìm theo tên, username, mã HS..."
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {unassignedStudents.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
            🎉 Tuyệt vời! Toàn bộ {allStudents.length} học sinh trong lớp đều đã được xếp vào nhóm dự án.
          </div>
        ) : filteredUnassigned.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
            Không tìm thấy học sinh nào khớp với từ khóa &quot;{searchTerm}&quot;.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredUnassigned.map((student) => {
              const selectedGroup = selectedGroupForStudent[student.id] || (groups[0]?.id ?? "");
              const isBusy = busyStudentId === student.id;

              return (
                <div
                  key={student.id}
                  className="p-3 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl flex flex-col justify-between gap-2.5 shadow-2xs hover:border-amber-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                        {student.full_name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                        @{student.username} {student.student_code && `• ${student.student_code}`}
                      </div>
                    </div>
                    <Badge variant="warning">Chưa có nhóm</Badge>
                  </div>

                  {/* Dropdown chọn nhóm và nút thêm */}
                  <div className="pt-2 border-t border-amber-200/60 dark:border-amber-900/30 flex items-center gap-2">
                    <select
                      aria-label={`Chọn nhóm cho ${student.full_name}`}
                      value={selectedGroup}
                      onChange={(e) =>
                        setSelectedGroupForStudent({
                          ...selectedGroupForStudent,
                          [student.id]: e.target.value,
                        })
                      }
                      className="flex-1 px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none"
                    >
                      {groups.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      disabled={isBusy || groups.length === 0}
                      onClick={() => handleAssignStudent(student.id, selectedGroup)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded shadow-2xs transition-colors shrink-0 cursor-pointer"
                    >
                      {isBusy ? "Đang lưu..." : "+ Thêm vào nhóm"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* KHỐI 2: DANH SÁCH CÁC NHÓM TRONG CSDL */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 font-title">
            Danh sách nhóm dự án ({groups.length} nhóm)
          </h2>

          {/* Form tạo nhóm mới */}
          <form onSubmit={handleCreateGroup} className="flex items-center gap-2">
            <input
              type="text"
              required
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Nhập tên nhóm mới..."
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 w-48 sm:w-56 outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={isCreatingGroup}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              {isCreatingGroup ? "Đang tạo..." : "+ Tạo nhóm"}
            </button>
          </form>
        </div>

        {groups.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-500 dark:text-slate-400">
            Chưa có nhóm nào trong dự án này. Hãy tạo nhóm đầu tiên bằng ô nhập bên trên!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((group) => {
              const groupMembers = allStudents.filter((s) =>
                members.some((m) => m.group_id === group.id && m.student_id === s.id)
              );
              const isEditing = editingGroupId === group.id;

              return (
                <div
                  key={group.id}
                  className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between overflow-hidden"
                >
                  {/* Tiêu đề nhóm */}
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-2">
                    {isEditing ? (
                      <div className="flex items-center gap-1.5 flex-1">
                        <input
                          type="text"
                          value={editingGroupName}
                          onChange={(e) => setEditingGroupName(e.target.value)}
                          className="px-2 py-0.5 text-xs border rounded bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex-1 outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveRename(group.id)}
                          className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
                        >
                          Lưu
                        </button>
                        <button
                          onClick={() => setEditingGroupId(null)}
                          className="text-xs text-slate-400 hover:underline cursor-pointer"
                        >
                          Hủy
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate font-title">
                          {group.name}
                        </h3>
                        <button
                          onClick={() => {
                            setEditingGroupId(group.id);
                            setEditingGroupName(group.name);
                          }}
                          className="text-[10px] text-slate-400 hover:text-blue-600 cursor-pointer"
                          title="Đổi tên nhóm"
                        >
                          ✏️
                        </button>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        {groupMembers.length} em
                      </span>
                      <button
                        onClick={() => handleDeleteGroup(group.id, group.name)}
                        className="text-slate-400 hover:text-rose-600 text-xs px-1 cursor-pointer"
                        title="Xóa nhóm này"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {/* Danh sách thành viên trong nhóm */}
                  <div className="p-3 divide-y divide-slate-100 dark:divide-slate-800/60 min-h-[140px] flex-1">
                    {groupMembers.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-[11px] text-slate-400 italic py-6">
                        Chưa có học sinh nào trong nhóm này
                      </div>
                    ) : (
                      groupMembers.map((member, idx) => (
                        <div
                          key={member.id}
                          className="py-2 flex items-center justify-between gap-2 text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <div className="truncate">
                              <span className="font-medium text-slate-900 dark:text-slate-100 block truncate">
                                {member.full_name}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                @{member.username} {member.student_code && `• ${member.student_code}`}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            disabled={busyStudentId === member.id}
                            onClick={() => handleRemoveStudent(member.id, group.id)}
                            className="text-[11px] text-rose-600 hover:text-rose-800 dark:text-rose-400 hover:underline shrink-0 cursor-pointer disabled:opacity-50"
                            title="Gỡ khỏi nhóm"
                          >
                            Gỡ
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Chân thẻ nhóm: Xem chi tiết nhóm */}
                  <div className="p-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20 text-right">
                    <Link
                      href={`/teacher/projects/${resolvedId}/groups/${group.id}`}
                      className="text-[11px] text-blue-600 hover:underline font-semibold"
                    >
                      Xem chi tiết nhóm →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
