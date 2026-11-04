// [FE] Khung HTML gốc ứng dụng · tài liệu mục 7.14
import type { Metadata } from "next";
import "@/styles/globals.css";
import { ToastProvider } from "@/components/ui/toast";

export const metadata: Metadata = {
  title: "PBL Platform - Nền tảng quản lý dự án học tập",
  description: "Quản lý tiến trình và đánh giá đồng đẳng trong dạy học dự án Tin học THPT",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="antialiased min-h-screen font-sans">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
