// [FE] Màn hình chờ tải dữ liệu · tài liệu mục 4.5
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-64" />
      <p className="text-sm text-gray-500 font-medium">Đang tải dữ liệu, vui lòng đợi...</p>
    </div>
  );
}
