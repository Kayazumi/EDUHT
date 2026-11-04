// [FE] Thêm học sinh, nhập CSV · tài liệu mục 3.3, 4.5 và A3.3
"use client";

import React, { useState } from "react";
import Link from "next/link";

interface PreviewRow {
  rowNum: number;
  username: string;
  fullName: string;
  isValid: boolean;
  errorReason?: string;
  tempPassword?: string;
}

export default function TeacherStudentsImportPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const [resolvedClassId, setResolvedClassId] = useState("");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<PreviewRow[]>([]);
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    params.then((p) => setResolvedClassId(p.classId));
  }, [params]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const mockRows: PreviewRow[] = [
      { rowNum: 1, username: "hs.nguyenquanga", fullName: "Nguyễn Quang Anh", isValid: true },
      { rowNum: 2, username: "hs.tranminhb", fullName: "Trần Minh Bình", isValid: true },
      { rowNum: 3, username: "hs.lethic", fullName: "Lê Thị Cúc", isValid: true },
      { rowNum: 4, username: "hs.mau01", fullName: "Học Sinh Mẫu Trùng", isValid: false, errorReason: "Trùng username đã có trong hệ thống" },
      { rowNum: 5, username: "hs.vuthif", fullName: "Vũ Thị Phương", isValid: true },
    ];
    setRows(mockRows);
    setStep(2);
  };

  const handleFixData = () => {
    setRows(
      rows.map((r) =>
        r.isValid
          ? r
          : { ...r, username: "hs.phamdinhd", fullName: "Phạm Đình Dũng", isValid: true, errorReason: undefined }
      )
    );
  };

  const handleConfirm = () => {
    setSubmitting(true);
    setTimeout(() => {
      setRows(
        rows.map((r) => ({
          ...r,
          tempPassword: "Hs@" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        }))
      );
      setSubmitting(false);
      setStep(3);
    }, 500);
  };

  const handleDownloadPasswords = () => {
    const header = "username,full_name,temp_password\n";
    const body = rows.map((r) => `"${r.username}","${r.fullName}","${r.tempPassword || ""}"`).join("\n");
    const blob = new Blob([header + body], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mat-khau-tam-lop-${resolvedClassId || "10a1"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const errorCount = rows.filter((r) => !r.isValid).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href={`/teacher/classes/${resolvedClassId || "c-10a1"}`} className="hover:underline">
              Lớp phụ trách
            </Link>
            <span>/</span>
            <span>Nhập danh sách học sinh</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Nhập tài khoản học sinh vào lớp {resolvedClassId ? resolvedClassId.toUpperCase() : "10A1"}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Giáo viên chỉ tạo tài khoản vai trò Học sinh và ghi danh tự động vào lớp của mình (tối đa 200 em)
          </p>
        </div>
        <Link
          href={`/teacher/classes/${resolvedClassId || "c-10a1"}`}
          className="text-xs text-slate-600 hover:text-slate-900 font-medium"
        >
          ← Quay lại lớp
        </Link>
      </div>

      {/* Bước 1 */}
      {step === 1 && (
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6 text-center">
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 bg-slate-50/50 hover:border-indigo-500 transition-colors">
            <span className="text-4xl block mb-2">📄</span>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Chọn tệp CSV danh sách học sinh
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Tệp gồm các cột: username, full_name (tối đa 200 dòng)
            </p>
            <label className="inline-block px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg cursor-pointer shadow-sm">
              Chọn tệp CSV
              <input type="file" accept=".csv" onChange={handleFileSelect} className="hidden" />
            </label>
          </div>
          <a
            href="/templates/students-import.csv"
            download
            className="inline-block text-xs font-semibold text-indigo-600 hover:underline"
          >
            Tải tệp mẫu students-import.csv ↓
          </a>
        </div>
      )}

      {/* Bước 2 */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500">Tệp: </span>
              <span className="font-mono font-bold text-slate-900 text-xs">{fileName}</span>
              <div className="text-xs mt-1">
                <span className="text-emerald-700 font-semibold">{rows.filter((r) => r.isValid).length} hợp lệ</span>
                {errorCount > 0 && <span className="text-rose-700 font-semibold ml-2">{errorCount} lỗi</span>}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {errorCount > 0 ? (
                <button
                  onClick={handleFixData}
                  className="px-3.5 py-1.5 bg-amber-600 text-white text-xs font-semibold rounded-lg"
                >
                  Tự sửa lỗi mẫu
                </button>
              ) : (
                <button
                  onClick={handleConfirm}
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  {submitting ? "Đang xử lý..." : "Xác nhận tạo tài khoản"}
                </button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 w-12 text-center">STT</th>
                  <th className="py-2.5 px-3">Tên đăng nhập</th>
                  <th className="py-2.5 px-3">Họ và tên</th>
                  <th className="py-2.5 px-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r) => (
                  <tr key={r.rowNum} className={r.isValid ? "" : "bg-rose-50"}>
                    <td className="py-2 px-3 text-center text-slate-400">{r.rowNum}</td>
                    <td className="py-2 px-3 font-mono font-bold text-slate-900">@{r.username}</td>
                    <td className="py-2 px-3">{r.fullName}</td>
                    <td className="py-2 px-3">
                      {r.isValid ? (
                        <span className="text-emerald-700 font-semibold">✓ Hợp lệ</span>
                      ) : (
                        <span className="text-rose-700 font-semibold">✕ {r.errorReason}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bước 3 */}
      {step === 3 && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-900 text-xs">
            <span className="font-bold text-sm block mb-1">🎉 Khởi tạo thành công {rows.length} tài khoản học sinh!</span>
            Tài khoản đã được tự động thêm vào lớp của bạn. Hãy tải tệp mật khẩu tạm để bàn giao cho học sinh.
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-xs font-semibold text-slate-700">Tệp mật khẩu tạm thời:</span>
            <button
              onClick={handleDownloadPasswords}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-2"
            >
              <span>📥</span>
              <span>Tải danh sách mật khẩu tạm (.CSV)</span>
            </button>
          </div>

          <div className="flex justify-end pt-2">
            <Link
              href={`/teacher/classes/${resolvedClassId || "c-10a1"}`}
              className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg"
            >
              Về chi tiết lớp học
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
