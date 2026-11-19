// [FE] Trang không tìm thấy (404) · tài liệu mục 4.5
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-slate-100 font-title mb-2">404</h1>
      <h2 className="text-xl font-semibold text-gray-700 dark:text-slate-300 mb-2">Không tìm thấy trang</h2>
      <p className="text-sm text-gray-500 dark:text-slate-400 mb-6 max-w-md">
        Đường dẫn bạn yêu cầu không tồn tại hoặc đã được di chuyển.
      </p>
      <Link href="/">
        <Button variant="primary">Quay về trang chủ</Button>
      </Link>
    </div>
  );
}
