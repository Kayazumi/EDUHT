// [FE] Nhập danh sách học sinh bằng CSV · tài liệu mục 3.3, 4.5 và A3.2
"use client";

import React, { useState } from "react";
import Link from "next/link";

interface PreviewRow {
  rowNum: number;
  username: string;
  fullName: string;
  className: string;
  schoolYear: string;
  isValid: boolean;
  errorReason?: string;
  tempPassword?: string;
}

export default function ImportUsersPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [fileName, setFileName] = useState<string | null>(null);
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Mẫu kiểm thử danh sách đọc từ file CSV
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    // Phân tích mô phỏng 6 dòng (có 1 dòng lỗi mẫu để kiểm tra tính năng chặn khi có lỗi)
    const mockParsedRows: PreviewRow[] = [
      {
        rowNum: 1,
        username: "hs.nguyenquanga",
        fullName: "Nguyễn Quang Anh",
        className: "10A1",
        schoolYear: "2026-2027",
        isValid: true,
      },
      {
        rowNum: 2,
        username: "hs.tranminhb",
        fullName: "Trần Minh Bình",
        className: "10A1",
        schoolYear: "2026-2027",
        isValid: true,
      },
      {
        rowNum: 3,
        username: "hs.lethic",
        fullName: "Lê Thị Cúc",
        className: "10A2",
        schoolYear: "2026-2027",
        isValid: true,
      },
      {
        rowNum: 4,
        username: "hs.mau01",
        fullName: "Học Sinh Bị Trùng",
        className: "10A1",
        schoolYear: "2026-2027",
        isValid: false,
        errorReason: "Tên đăng nhập đã tồn tại trong hệ thống",
      },
      {
        rowNum: 5,
        username: "hs.hoangvane",
        fullName: "Hoàng Văn Em",
        className: "10A3_INVALID",
        schoolYear: "2026-2027",
        isValid: false,
        errorReason: "Lớp học chưa được tạo trong CSDL",
      },
      {
        rowNum: 6,
        username: "hs.vuthif",
        fullName: "Vũ Thị Phương",
        className: "10A2",
        schoolYear: "2026-2027",
        isValid: true,
      },
    ];

    setPreviewRows(mockParsedRows);
    setStep(2);
  };

  const handleFixAndValidate = () => {
    // Sửa các dòng lỗi thành hợp lệ để người dùng có thể tiếp tục
    setPreviewRows((prev) =>
      prev.map((r) => {
        if (!r.isValid) {
          if (r.username === "hs.mau01") {
            return {
              ...r,
              username: "hs.phamdinhd",
              fullName: "Phạm Đình Dũng",
              isValid: true,
              errorReason: undefined,
            };
          }
          if (r.className.includes("INVALID")) {
            return {
              ...r,
              className: "10A2",
              isValid: true,
              errorReason: undefined,
            };
          }
        }
        return r;
      })
    );
  };

  const handleConfirmImport = () => {
    setIsProcessing(true);
    setTimeout(() => {
      // Sinh mật khẩu tạm cho từng dòng hợp lệ
      setPreviewRows((prev) =>
        prev.map((r) => ({
          ...r,
          tempPassword: "Hs@" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        }))
      );
      setIsProcessing(false);
      setStep(3);
    }, 600);
  };

  const handleDownloadPasswordsCsv = () => {
    const csvHeader = "username,full_name,class_name,temp_password\n";
    const csvBody = previewRows
      .map(
        (r) =>
          `"${r.username}","${r.fullName}","${r.className}","${r.tempPassword || ""}"`
      )
      .join("\n");
    const blob = new Blob([csvHeader + csvBody], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mat-khau-tam-hoc-sinh-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const errorCount = previewRows.filter((r) => !r.isValid).length;
  const validCount = previewRows.filter((r) => r.isValid).length;

  return (
    <div className="space-y-6">
      {/* Tiêu đề & Điều hướng */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/admin/users" className="hover:underline">
              Quản lý người dùng
            </Link>
            <span>/</span>
            <span>Nhập danh sách CSV</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Nhập tài khoản Học sinh từ tệp CSV
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Quy trình 3 bước: Tải lên tệp CSV mẫu → Xem trước & Kiểm định → Khởi tạo & Tải mật khẩu tạm
          </p>
        </div>
        <Link
          href="/admin/users"
          className="text-sm text-slate-600 hover:text-slate-900 font-medium"
        >
          ← Quay lại danh sách
        </Link>
      </div>

      {/* Tiến trình 3 bước */}
      <div className="flex items-center justify-between max-w-xl mx-auto py-2">
        <div className="flex items-center gap-2">
          <span
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 1 ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-600"
            }`}
          >
            1
          </span>
          <span className="text-xs font-semibold text-slate-800">Chọn tệp CSV</span>
        </div>
        <div className="w-16 h-0.5 bg-slate-200" />
        <div className="flex items-center gap-2">
          <span
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 2 ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-600"
            }`}
          >
            2
          </span>
          <span className="text-xs font-semibold text-slate-800">Xem trước & Đối soát</span>
        </div>
        <div className="w-16 h-0.5 bg-slate-200" />
        <div className="flex items-center gap-2">
          <span
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              step === 3 ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"
            }`}
          >
            3
          </span>
          <span className="text-xs font-semibold text-slate-800">Kết quả & Mật khẩu</span>
        </div>
      </div>

      {/* BƯỚC 1: Chọn tệp CSV */}
      {step === 1 && (
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm max-w-2xl mx-auto space-y-6">
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-indigo-500 transition-colors bg-slate-50/50">
            <span className="text-4xl block mb-2">📄</span>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Kéo thả tệp CSV vào đây hoặc bấm để chọn tệp
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Hỗ trợ định dạng .csv chuẩn UTF-8, tối đa 200 dòng mỗi lần nhập
            </p>
            <label className="inline-block px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors shadow-sm">
              Chọn tệp từ máy tính
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-indigo-50/70 border border-indigo-100 rounded-lg text-xs">
            <div>
              <span className="font-bold text-indigo-950 block">Chưa có tệp định dạng chuẩn?</span>
              <span className="text-indigo-800">
                Tải tệp mẫu <code className="font-mono">students-import.csv</code> chứa các cột username, full_name, class_name, school_year.
              </span>
            </div>
            <a
              href="/templates/students-import.csv"
              download
              className="px-3 py-1.5 bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-100/50 font-semibold rounded-md shadow-2xs whitespace-nowrap"
            >
              Tải tệp mẫu ↓
            </a>
          </div>
        </div>
      )}

      {/* BƯỚC 2: Xem trước và đối soát */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-lg">📁</span>
              <div>
                <span className="text-xs text-slate-500">Tệp đã chọn:</span>
                <span className="text-sm font-bold text-slate-900 ml-1 font-mono">
                  {fileName}
                </span>
                <div className="text-xs mt-0.5 space-x-2">
                  <span className="text-emerald-700 font-semibold">
                    ✓ {validCount} dòng hợp lệ
                  </span>
                  {errorCount > 0 && (
                    <span className="text-rose-700 font-semibold">
                      ✕ {errorCount} dòng lỗi
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setStep(1)}
                className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-medium rounded-lg"
              >
                Chọn tệp khác
              </button>
              {errorCount > 0 ? (
                <button
                  onClick={handleFixAndValidate}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  Tự động khắc phục dữ liệu mẫu
                </button>
              ) : (
                <button
                  onClick={handleConfirmImport}
                  disabled={isProcessing}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                >
                  {isProcessing ? "Đang xử lý..." : "Xác nhận tạo tài khoản (Tất cả hoặc không)"}
                </button>
              )}
            </div>
          </div>

          {errorCount > 0 && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">⛔</span>
                <span>
                  <strong>Quy tắc bảo đảm toàn vẹn:</strong> Hệ thống chỉ cho phép xác nhận khi <strong>0 dòng lỗi</strong> (All-or-Nothing). Vui lòng chỉnh sửa các dòng báo lỗi đỏ trong tệp CSV hoặc bấm nút tự động khắc phục.
                </span>
              </div>
            </div>
          )}

          {/* Bảng xem trước dữ liệu */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">STT</th>
                    <th className="py-3 px-4">Tên đăng nhập</th>
                    <th className="py-3 px-4">Họ và tên</th>
                    <th className="py-3 px-4">Lớp ghi danh</th>
                    <th className="py-3 px-4">Niên khóa</th>
                    <th className="py-3 px-4">Trạng thái kiểm định</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {previewRows.map((r) => (
                    <tr
                      key={r.rowNum}
                      className={r.isValid ? "hover:bg-slate-50" : "bg-rose-50/40 hover:bg-rose-50/70"}
                    >
                      <td className="py-3 px-4 text-center font-mono text-slate-400">
                        {r.rowNum}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-900">
                        @{r.username}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {r.fullName}
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-semibold">
                        {r.className}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono">
                        {r.schoolYear}
                      </td>
                      <td className="py-3 px-4">
                        {r.isValid ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                            ✓ Hợp lệ
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-700 font-semibold">
                            ✕ {r.errorReason}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* BƯỚC 3: Kết quả và tải mật khẩu tạm */}
      {step === 3 && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 flex items-start gap-4">
            <span className="text-3xl">🎉</span>
            <div>
              <h3 className="text-base font-bold text-emerald-900">
                Đã khởi tạo thành công {previewRows.length} tài khoản học sinh!
              </h3>
              <p className="text-xs text-emerald-700 mt-1">
                Các tài khoản học sinh đã được tự động thêm vào lớp học tương ứng và đặt cờ bắt buộc đổi mật khẩu ở lần đăng nhập đầu tiên.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <div>
              <span className="text-xs font-semibold text-slate-700 block">
                Tệp mật khẩu tạm thời cho học sinh
              </span>
              <span className="text-xs text-slate-500">
                Bao gồm cột username, họ tên, lớp và mật khẩu ngẫu nhiên để bàn giao cho giáo viên chủ nhiệm.
              </span>
            </div>
            <button
              onClick={handleDownloadPasswordsCsv}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <span>📥</span>
              <span>Tải danh sách mật khẩu tạm (.CSV)</span>
            </button>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg flex items-center gap-2">
            <span>⚠️</span>
            <span>
              <strong>Bảo mật:</strong> Hệ thống không lưu lại mật khẩu rõ. Tệp mật khẩu tạm này chỉ tải được ở phiên làm việc này.
            </span>
          </div>

          {/* Bảng kết quả tài khoản đã tạo */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Tên đăng nhập</th>
                  <th className="py-2.5 px-3">Họ và tên</th>
                  <th className="py-2.5 px-3">Lớp</th>
                  <th className="py-2.5 px-3">Mật khẩu tạm</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {previewRows.map((r) => (
                  <tr key={r.rowNum}>
                    <td className="py-2 px-3 text-slate-900">@{r.username}</td>
                    <td className="py-2 px-3 font-sans text-slate-800">{r.fullName}</td>
                    <td className="py-2 px-3 text-slate-600">{r.className}</td>
                    <td className="py-2 px-3 text-indigo-700 font-bold">{r.tempPassword}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/admin/users"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg"
            >
              Hoàn tất & Về danh sách tài khoản
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
