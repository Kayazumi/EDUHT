// [FE] Quản lý nhóm dự án · tài liệu mục 3.3, 4.5 và A3.3
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface StudentInClass {
  id: string;
  username: string;
  fullName: string;
  groupId: string | null;
}

interface GroupCard {
  id: string;
  name: string;
  isLocked: boolean;
  memberIds: string[];
}

export default function TeacherProjectGroupsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const [resolvedId, setResolvedId] = useState("");
  const minSize = 4;
  const maxSize = 5;

  React.useEffect(() => {
    params.then((p) => setResolvedId(p.projectId));
  }, [params]);

  const [students, setStudents] = useState<StudentInClass[]>([
    { id: "s1", username: "hs.mau01", fullName: "Học Sinh Mẫu 1", groupId: "g1" },
    { id: "s2", username: "hs.mau02", fullName: "Học Sinh Mẫu 2", groupId: "g1" },
    { id: "s3", username: "hs.nguyenquanga", fullName: "Nguyễn Quang Anh", groupId: "g1" },
    { id: "s4", username: "hs.tranminhb", fullName: "Trần Minh Bình", groupId: "g1" },
    { id: "s5", username: "hs.phamthid", fullName: "Phạm Thị Dung", groupId: "g2" },
    { id: "s6", username: "hs.lethic", fullName: "Lê Thị Cúc", groupId: "g2" },
    { id: "s7", username: "hs.vuvanh", fullName: "Vũ Văn Hùng", groupId: "g2" },
    { id: "s8", username: "hs.vuthif", fullName: "Vũ Thị Phương", groupId: "g2" },
    { id: "s9", username: "hs.dangquangm", fullName: "Đặng Quang Minh", groupId: null }, // Chưa có nhóm
  ]);

  const [groups, setGroups] = useState<GroupCard[]>([
    { id: "g1", name: "Nhóm 01: Sáng tạo Web", isLocked: false, memberIds: ["s1", "s2", "s3", "s4"] },
    { id: "g2", name: "Nhóm 02: Python Tương tác", isLocked: false, memberIds: ["s5", "s6", "s7", "s8"] },
    { id: "g3", name: "Nhóm 03: Ứng dụng Di động", isLocked: false, memberIds: [] },
  ]);

  const [newGroupName, setNewGroupName] = useState("");
  const [isInstantiated, setIsInstantiated] = useState(false);

  const unassignedStudents = students.filter((s) => s.groupId === null);

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    const newG: GroupCard = {
      id: `g-${Date.now()}`,
      name: newGroupName.trim(),
      isLocked: false,
      memberIds: [],
    };
    setGroups([...groups, newG]);
    setNewGroupName("");
  };

  const handleAssignStudent = (studentId: string, targetGroupId: string | null) => {
    setStudents(
      students.map((s) => (s.id === studentId ? { ...s, groupId: targetGroupId } : s))
    );
    setGroups(
      groups.map((g) => {
        const withoutStudent = g.memberIds.filter((id) => id !== studentId);
        if (g.id === targetGroupId) {
          return { ...g, memberIds: [...withoutStudent, studentId] };
        }
        return { ...g, memberIds: withoutStudent };
      })
    );
  };

  const handleLockAllGroups = () => {
    // Kiểm tra điều kiện khóa nhóm:
    if (unassignedStudents.length > 0) {
      alert(`CHƯA THỂ KHÓA NHÓM: Còn ${unassignedStudents.length} học sinh chưa được xếp vào nhóm!`);
      return;
    }

    const invalidGroup = groups.find(
      (g) => g.memberIds.length < minSize || g.memberIds.length > maxSize
    );
    if (invalidGroup) {
      alert(
        `CHƯA THỂ KHÓA NHÓM: "${invalidGroup.name}" hiện có ${invalidGroup.memberIds.length} thành viên (Quy định: từ ${minSize} đến ${maxSize} học sinh/nhóm)!`
      );
      return;
    }

    if (
      confirm(
        "XÁC NHẬN KHÓA NHÓM (THAO TÁC MỘT CHIỀU):\nSau khi bấm Khóa, danh sách thành viên các nhóm sẽ được chốt vĩnh viễn và không thể thay đổi sau khi thẻ việc đã sinh. Bạn có chắc chắn muốn khóa toàn bộ nhóm?"
      )
    ) {
      setGroups(groups.map((g) => ({ ...g, isLocked: true })));
    }
  };

  const handleInstantiateTasks = () => {
    const allLocked = groups.every((g) => g.isLocked);
    if (!allLocked) {
      alert("HÃY KHÓA TOÀN BỘ NHÓM TRƯỚC KHI SINH THẺ VIỆC (Mục 7.1)!");
      return;
    }
    setIsInstantiated(true);
    alert("ĐÃ SINH THẺ VIỆC THÀNH CÔNG: Thủ tục instantiate_group_tasks đã tự động tạo các thẻ Kanban mẫu cho toàn bộ các nhóm đã khóa!");
  };

  const allLocked = groups.length > 0 && groups.every((g) => g.isLocked);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href={`/teacher/projects/${resolvedId || "proj-p01"}`} className="hover:underline">
              Tổng quan dự án
            </Link>
            <span>/</span>
            <span>Lập nhóm học sinh</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <span>Phân chia & Khóa nhóm học sinh</span>
            {allLocked ? (
              <Badge variant="success">Đã khóa toàn bộ nhóm</Badge>
            ) : (
              <Badge variant="warning">Chưa khóa danh sách</Badge>
            )}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Quy chuẩn quy mô: Từ <strong>{minSize}</strong> đến <strong>{maxSize}</strong> học sinh / nhóm
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!allLocked ? (
            <button
              onClick={handleLockAllGroups}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm"
            >
              🔒 Khóa danh sách nhóm
            </button>
          ) : (
            <button
              onClick={handleInstantiateTasks}
              className={`px-4 py-2 text-xs font-semibold rounded-lg shadow-sm ${
                isInstantiated
                  ? "bg-emerald-600 text-white"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
            >
              {isInstantiated ? "✓ Đã sinh thẻ Kanban" : "⚡ Sinh thẻ việc cho các nhóm"}
            </button>
          )}
        </div>
      </div>

      {/* HAI VÙNG: Học sinh chưa có nhóm & Các thẻ nhóm */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* VÙNG 1: Danh sách học sinh chưa có nhóm */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="font-bold text-xs text-slate-900 uppercase">
              Chưa vào nhóm ({unassignedStudents.length})
            </span>
            {unassignedStudents.length > 0 && (
              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                Cần xếp nhóm
              </span>
            )}
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {unassignedStudents.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">
                Tất cả học sinh đã được phân nhóm ✓
              </p>
            ) : (
              unassignedStudents.map((s) => (
                <div
                  key={s.id}
                  className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs space-y-1.5"
                >
                  <div className="font-bold text-slate-900">{s.fullName}</div>
                  <div className="font-mono text-[11px] text-slate-500">@{s.username}</div>
                  <div className="pt-1">
                    <select
                      onChange={(e) => handleAssignStudent(s.id, e.target.value)}
                      defaultValue=""
                      className="w-full text-xs p-1 border border-slate-300 rounded bg-white text-indigo-700 font-semibold"
                    >
                      <option value="" disabled>
                        + Xếp vào nhóm...
                      </option>
                      {groups.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Form thêm nhóm mới */}
          <form onSubmit={handleCreateGroup} className="pt-3 border-t border-slate-100 space-y-2">
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Tên nhóm mới..."
              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg"
            >
              + Tạo nhóm mới
            </button>
          </form>
        </div>

        {/* VÙNG 2: Các thẻ nhóm học sinh */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          {groups.map((group) => {
            const memberCount = group.memberIds.length;
            const isOutOfRange = memberCount < minSize || memberCount > maxSize;
            const groupMembers = students.filter((s) => group.memberIds.includes(s.id));

            return (
              <div
                key={group.id}
                className={`bg-white rounded-xl border shadow-sm p-5 space-y-3 ${
                  isOutOfRange ? "border-rose-300 bg-rose-50/20" : "border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900">{group.name}</h3>
                    {group.isLocked ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        Đã khóa
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        Chưa khóa
                      </span>
                    )}
                  </div>

                  <span
                    className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                      isOutOfRange
                        ? "bg-rose-100 text-rose-700"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {memberCount} / [{minSize}-{maxSize}] HS
                  </span>
                </div>

                {/* Danh sách thành viên trong nhóm */}
                <div className="space-y-1.5 min-h-24">
                  {groupMembers.length === 0 ? (
                    <p className="text-xs text-slate-400 italic text-center py-4">
                      Chưa có học sinh nào trong nhóm này
                    </p>
                  ) : (
                    groupMembers.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-xs border border-slate-100"
                      >
                        <div>
                          <span className="font-bold text-slate-800 mr-2">{m.fullName}</span>
                          <span className="font-mono text-slate-400 text-[11px]">@{m.username}</span>
                        </div>
                        {!group.isLocked && (
                          <button
                            onClick={() => handleAssignStudent(m.id, null)}
                            className="text-[11px] text-rose-600 hover:underline"
                            title="Đưa ra khỏi nhóm"
                          >
                            Gỡ ✕
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Chân thẻ nhóm: Xem bảng Kanban của nhóm */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <Link
                    href={`/teacher/projects/${resolvedId || "proj-p01"}/groups/${group.id}`}
                    className="font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                  >
                    Xem bảng Kanban nhóm →
                  </Link>
                  <span className="text-slate-400 text-[11px]">
                    {group.isLocked ? "Không thể đổi thành viên" : "Có thể kéo đổi"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
