// [CHUNG] Kiểu kết quả hành động và lỗi nghiệp vụ · tài liệu mục 7.5

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string = "INTERNAL_ERROR",
    public readonly status: number = 400
  ) {
    super(message);
    this.name = "AppError";
  }
}
