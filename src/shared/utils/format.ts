// [CHUNG] Hàm tiện ích định dạng · tài liệu mục 7.6

const TIMEZONE = "Asia/Ho_Chi_Minh";

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";

  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIMEZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  return formatter.format(d);
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";

  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIMEZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return formatter.format(d);
}

export function roundScore2(score: number): number {
  return Math.round((score + Number.EPSILON) * 100) / 100;
}

export function formatScore(score: number | null | undefined): string {
  if (score === null || score === undefined || isNaN(score)) {
    return "—";
  }
  const rounded = Math.round((score + Number.EPSILON) * 10) / 10;
  return rounded.toFixed(1).replace(".", ",");
}
