// [BE] Phân tích và kiểm tra tệp CSV học sinh · tài liệu mục 4.8
import { studentCsvRowSchema } from "@/shared/validation/user";
import { z } from "zod";

export type StudentCsvRow = z.infer<typeof studentCsvRowSchema>;

export interface CsvParseResult {
  validRows: StudentCsvRow[];
  errors: { rowNumber: number; reason: string }[];
}

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
  const hasHeader = firstLine.includes("username") && firstLine.includes("full_name");
  const dataLines = hasHeader ? lines.slice(1) : lines;

  const validRows: StudentCsvRow[] = [];
  const errors: { rowNumber: number; reason: string }[] = [];

  dataLines.forEach((line, index) => {
    const rowNumber = hasHeader ? index + 2 : index + 1;
    const parts = line.split(",").map((p) => p.trim());

    if (parts.length < 4) {
      errors.push({
        rowNumber,
        reason: `Dòng thiếu cột (yêu cầu 4 cột: username, full_name, class_name, school_year)`,
      });
      return;
    }

    const rawData = {
      username: parts[0] ?? "",
      full_name: parts[1] ?? "",
      class_name: parts[2] ?? "",
      school_year: parts[3] ?? "",
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
