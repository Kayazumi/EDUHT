// [FE] Trang báo lỗi không đủ quyền truy cập · tài liệu mục 4.5
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ForbiddenPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Không có quyền truy cập</h1>
      <p className="text-sm text-gray-600 mb-6 max-w-md">
        Bạn không có quyền xem khu vực hoặc tài nguyên này. Vui lòng quay về trang tương ứng với vai trò của mình.
      </p>
      <Link href="/">
        <Button variant="primary">Quay về trang chính</Button>
      </Link>
    </main>
  );
}
