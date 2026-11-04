// [BE] Xuất dữ liệu sang định dạng CSV kèm BOM UTF-8 · tài liệu mục 4.8

export function toCsvWithBom<T extends Record<string, unknown>>(
  rows: T[],
  headers?: { key: keyof T; label: string }[]
): string {
  if (rows.length === 0) {
    return "\uFEFF";
  }

  const columns: { key: keyof T; label: string }[] =
    headers ||
    Object.keys(rows[0] as object).map((k) => ({
      key: k as keyof T,
      label: k,
    }));

  const headerLine = columns.map((c) => `"${c.label.replace(/"/g, '""')}"`).join(",");

  const dataLines = rows.map((row) =>
    columns
      .map((col) => {
        const val = row[col.key];
        if (val === null || val === undefined) return '""';
        return `"${String(val).replace(/"/g, '""')}"`;
      })
      .join(",")
  );

  return "\uFEFF" + [headerLine, ...dataLines].join("\r\n");
}
