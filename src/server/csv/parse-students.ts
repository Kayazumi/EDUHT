// [BE] Phân tích và kiểm tra tệp Excel/CSV học sinh · tài liệu mục 4.8
import { studentCsvRowSchema } from "@/shared/validation/user";
import { z } from "zod";
import * as XLSX from "xlsx";

export type StudentCsvRow = z.infer<typeof studentCsvRowSchema>;

export interface CsvParseResult {
  validRows: StudentCsvRow[];
  errors: { rowNumber: number; reason: string }[];
}

function normalizeHeader(val: unknown): string {
  if (typeof val !== "string") return "";
  return val
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * Phân tích tệp CSV truyền thống (tương thích ngược)
 */
export function parseStudentsCsv(csvText: string): CsvParseResult {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return { validRows: [], errors: [{ rowNumber: 0, reason: "Tệp CSV rỗng" }] };
  }

  // Bỏ qua dòng header nếu có
  const firstLine = lines[0]?.toLowerCase() ?? "";
  const hasHeader =
    (firstLine.includes("username") || firstLine.includes("ma") || firstLine.includes("mshs")) &&
    (firstLine.includes("full_name") || firstLine.includes("ten") || firstLine.includes("ho"));
  const dataLines = hasHeader ? lines.slice(1) : lines;

  const validRows: StudentCsvRow[] = [];
  const errors: { rowNumber: number; reason: string }[] = [];

  dataLines.forEach((line, index) => {
    const rowNumber = hasHeader ? index + 2 : index + 1;
    const parts = line.split(",").map((p) => p.trim().replace(/^["']|["']$/g, ""));

    if (parts.length < 2) {
      errors.push({
        rowNumber,
        reason: `Dòng thiếu thông tin (yêu cầu tối thiểu 2 cột: Mã học sinh và Họ và tên)`,
      });
      return;
    }

    const rawData = {
      username: parts[0] ?? "",
      full_name: parts[1] ?? "",
      class_name: parts[2] || undefined,
      school_year: parts[3] || undefined,
    };

    const parsed = studentCsvRowSchema.safeParse(rawData);
    if (!parsed.success) {
      const issues = parsed.error.issues.map((i) => i.message).join("; ");
      errors.push({ rowNumber, reason: issues });
    } else {
      validRows.push(parsed.data);
    }
  });

  return { validRows, errors };
}

/**
 * Phân tích tệp Excel (.xlsx, .xls) hoặc CSV dưới dạng Buffer/ArrayBuffer
 */
export function parseStudentsExcel(buffer: ArrayBuffer | Buffer): CsvParseResult {
  try {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return { validRows: [], errors: [{ rowNumber: 0, reason: "Tệp Excel không chứa trang tính (sheet) nào" }] };
    }

    const sheet = workbook.Sheets[sheetName];
    if (!sheet) {
      return { validRows: [], errors: [{ rowNumber: 0, reason: "Không thể đọc dữ liệu trang tính Excel" }] };
    }
    const data: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    if (data.length === 0) {
      return { validRows: [], errors: [{ rowNumber: 0, reason: "Trang tính Excel rỗng" }] };
    }

    // Tìm dòng header
    let headerIndex = -1;
    let colUsername = 0;
    let colFullName = 1;
    let colClass = 2;

    for (let r = 0; r < Math.min(10, data.length); r++) {
      const row = data[r] ?? [];
      const normalizedRow = row.map(normalizeHeader);

      const uIdx = normalizedRow.findIndex(
        (cell) =>
          cell.includes("ma hoc sinh") ||
          cell.includes("ma hs") ||
          cell.includes("mshs") ||
          cell.includes("username") ||
          cell.includes("ten dang nhap")
      );
      const nIdx = normalizedRow.findIndex(
        (cell) =>
          cell.includes("ho va ten") ||
          cell.includes("ho ten") ||
          cell.includes("ten hoc sinh") ||
          cell.includes("full_name") ||
          cell.includes("fullname") ||
          cell === "ten"
      );

      if (uIdx !== -1 && nIdx !== -1) {
        headerIndex = r;
        colUsername = uIdx;
        colFullName = nIdx;
        const cIdx = normalizedRow.findIndex(
          (cell) => cell.includes("lop") || cell.includes("class")
        );
        if (cIdx !== -1) colClass = cIdx;
        break;
      }
    }

    const validRows: StudentCsvRow[] = [];
    const errors: { rowNumber: number; reason: string }[] = [];
    const startIndex = headerIndex === -1 ? 0 : headerIndex + 1;

    for (let i = startIndex; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;

      const rawUsername = String(row[colUsername] ?? "").trim();
      const rawFullName = String(row[colFullName] ?? "").trim();
      const rawClass = row[colClass] ? String(row[colClass]).trim() : undefined;

      // Bỏ qua nếu dòng hoàn toàn trống
      if (!rawUsername && !rawFullName) continue;

      const rowNumber = i + 1;
      if (!rawUsername || !rawFullName) {
        errors.push({
          rowNumber,
          reason: "Thiếu mã học sinh hoặc họ tên",
        });
        continue;
      }

      const rawData = {
        username: rawUsername,
        full_name: rawFullName,
        class_name: rawClass,
      };

      const parsed = studentCsvRowSchema.safeParse(rawData);
      if (!parsed.success) {
        const issues = parsed.error.issues.map((err) => err.message).join("; ");
        errors.push({ rowNumber, reason: issues });
      } else {
        validRows.push(parsed.data);
      }
    }

    return { validRows, errors };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Không thể đọc tệp Excel/CSV";
    return { validRows: [], errors: [{ rowNumber: 0, reason: msg }] };
  }
}
