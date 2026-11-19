// [FE] Thêm học sinh, nhập Excel / CSV · tài liệu mục 3.3, 4.5 và A3.3
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { parseStudentFileAction, importStudents } from "@/server/actions/users";
import { DEFAULT_STUDENT_PASSWORD } from "@/shared/config/defaults";
import * as XLSX from "xlsx";

interface ValidStudent {
  username: string;
  full_name: string;
  class_name?: string;
}

interface ParseError {
  rowNumber: number;
  reason: string;
}

export default function TeacherStudentsImportPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const [resolvedClassId, setResolvedClassId] = useState("");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [fileName, setFileName] = useState<string | null>(null);
  const [validRows, setValidRows] = useState<ValidStudent[]>([]);
  const [parseErrors, setParseErrors] = useState<ParseError[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [importedCount, setImportedCount] = useState(0);

  React.useEffect(() => {
    params.then((p) => setResolvedClassId(p.classId));
  }, [params]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsParsing(true);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append("file", file);

    const result = await parseStudentFileAction(formData);
    setIsParsing(false);

    if (!result.ok) {
      setErrorMessage(result.error);
      return;
    }

    if (result.data.validRows.length === 0 && result.data.errors.length > 0) {
      setErrorMessage(result.data.errors[0]?.reason || "Tệp không chứa dữ liệu học sinh hợp lệ.");
      return;
    }

    setValidRows(result.data.validRows);
    setParseErrors(result.data.errors);
    setStep(2);
  };

  const handleConfirmImport = async () => {
    if (!resolvedClassId || validRows.length === 0) return;

    setSubmitting(true);
    setErrorMessage(null);

    const result = await importStudents({
      classId: resolvedClassId,
      students: validRows,
    });

    setSubmitting(false);

    if (!result.ok) {
      setErrorMessage(result.error);
      return;
    }

    setImportedCount(result.data.importedCount);
    setStep(3);
  };

  const handleDownloadSampleExcel = () => {
    const sampleData = [
      ["Mã học sinh", "Họ và tên", "Lớp"],
      ["hs.24001", "Nguyễn Văn An", "10A1"],
      ["hs.24002", "Trần Thị Bình", "10A1"],
      ["hs.24003", "Lê Hoàng Cường", "10A1"],
      ["hs.24004", "Phạm Minh Đức", "10A1"],
    ];

    const ws = XLSX.utils.aoa_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DanhSachHocSinh");
    XLSX.writeFile(wb, "mau-nhap-hoc-sinh-EDUHT.xlsx");
  };

  const handleDownloadCredentialsCsv = () => {
    const header = "ma_hoc_sinh,ho_va_ten,mat_khau_mac_dinh\n";
    const body = validRows
      .map((r) => `"${r.username}","${r.full_name}","${DEFAULT_STUDENT_PASSWORD}"`)
      .join("\n");
    const blob = new Blob([header + body], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `danh-sach-tai-khoan-${resolvedClassId || "lop"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href={`/teacher/classes/${resolvedClassId}`} className="hover:underline">
              Lớp phụ trách
            </Link>
            <span>/</span>
            <span>Nhập danh sách học sinh</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Tạo tài khoản học sinh đồng loạt từ Excel / CSV
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Nhập danh sách học sinh vào lớp. Mật khẩu mặc định khởi tạo là <strong className="text-blue-600">{DEFAULT_STUDENT_PASSWORD}</strong>.
          </p>
        </div>
        <Link
          href={`/teacher/classes/${resolvedClassId}`}
          className="text-xs text-slate-600 hover:text-slate-900 font-medium"
        >
          ← Quay lại lớp
        </Link>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl" role="alert">
          {errorMessage}
        </div>
      )}

      {/* BƯỚC 1: TẢI TỆP */}
      {step === 1 && (
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6 text-center">
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 bg-slate-50/50 hover:border-blue-500 transition-colors">
            <span className="text-4xl block mb-2">📊</span>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Chọn tệp Excel (.xlsx, .xls) hoặc CSV danh sách học sinh
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Cột yêu cầu: <strong>Mã học sinh</strong> (Tên đăng nhập), <strong>Họ và tên</strong>, <strong>Lớp</strong> (tối đa 200 dòng)
            </p>
            <label className="inline-block px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg cursor-pointer shadow-sm transition-colors">
              {isParsing ? "Đang phân tích tệp..." : "Chọn tệp Excel hoặc CSV"}
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                disabled={isParsing}
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>

          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <span>Bạn chưa có mẫu chuẩn?</span>
            <button
              type="button"
              onClick={handleDownloadSampleExcel}
              className="font-semibold text-blue-600 hover:underline flex items-center gap-1"
            >
              📥 Tải tệp mẫu Excel (.xlsx) chuẩn
            </button>
          </div>
        </div>
      )}

      {/* BƯỚC 2: RÀ SOÁT & XÁC NHẬN */}
      {step === 2 && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Rà soát danh sách học sinh: {fileName}
              </h3>
              <p className="text-xs text-slate-500">
                Tìm thấy <strong>{validRows.length}</strong> học sinh hợp lệ.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setValidRows([]);
                setParseErrors([]);
              }}
              className="text-xs text-slate-600 hover:underline self-start sm:self-auto"
            >
              Chọn tệp khác
            </button>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
            🔒 Mật khẩu mặc định khởi tạo cho toàn bộ học sinh này là:{" "}
            <span className="font-mono font-bold text-blue-700 text-sm bg-white px-2 py-0.5 rounded border border-blue-200">
              {DEFAULT_STUDENT_PASSWORD}
            </span>
            . Học sinh sẽ được yêu cầu đổi mật khẩu ở lần đăng nhập đầu tiên.
          </div>

          {parseErrors.length > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
              <span className="font-bold">⚠️ Có {parseErrors.length} dòng bị bỏ qua do không đúng định dạng:</span>
              <ul className="list-disc pl-5 max-h-28 overflow-y-auto space-y-0.5">
                {parseErrors.map((err, i) => (
                  <li key={i}>
                    Dòng {err.rowNumber}: {err.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Bảng xem trước */}
          <div className="border border-slate-200 rounded-lg overflow-hidden max-h-80 overflow-y-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 font-semibold text-slate-700 sticky top-0 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 w-12 text-center">STT</th>
                  <th className="py-2.5 px-3">Mã học sinh</th>
                  <th className="py-2.5 px-3">Họ và tên</th>
                  <th className="py-2.5 px-3">Mật khẩu ban đầu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {validRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-2 px-3 font-mono font-bold text-slate-800">@{row.username}</td>
                    <td className="py-2 px-3 text-slate-900">{row.full_name}</td>
                    <td className="py-2 px-3 font-mono text-slate-500">{DEFAULT_STUDENT_PASSWORD}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              disabled={submitting}
              onClick={() => setStep(1)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              disabled={submitting || validRows.length === 0}
              onClick={handleConfirmImport}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              {submitting ? "Đang khởi tạo tài khoản..." : `Xác nhận tạo ${validRows.length} tài khoản`}
            </button>
          </div>
        </div>
      )}

      {/* BƯỚC 3: HOÀN TẤT */}
      {step === 3 && (
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6 text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto">
            ✓
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Khởi tạo tài khoản thành công!</h2>
            <p className="text-sm text-slate-600 mt-1">
              Đã tạo thành công <strong>{importedCount}</strong> tài khoản học sinh và ghi danh vào lớp.
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Mật khẩu mặc định là: <span className="font-mono font-bold text-blue-600">{DEFAULT_STUDENT_PASSWORD}</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleDownloadCredentialsCsv}
              className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              📥 Xuất file danh sách tài khoản & mật khẩu
            </button>
            <Link
              href={`/teacher/classes/${resolvedClassId}`}
              className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
            >
              Quay lại danh sách lớp học
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
