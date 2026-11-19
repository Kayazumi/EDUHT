// [FE] Khung HTML gốc ứng dụng · tài liệu mục 7.14
import type { Metadata } from "next";
import { Lexend, Be_Vietnam_Pro, JetBrains_Mono } from "next/font/google";
import "@/styles/globals.css";
import { ToastProvider } from "@/components/ui/toast";
import { ThemeProvider } from "@/components/theme/theme-provider";

const fontTitle = Lexend({
  subsets: ["latin", "vietnamese"],
  variable: "--font-title",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const fontSans = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin", "vietnamese"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EDUHT - Nền tảng quản lý dự án học tập Tin học",
  description: "Quản lý tiến trình và đánh giá đồng đẳng BARS trong dạy học dự án Tin học THPT",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={`${fontTitle.variable} ${fontSans.variable} ${fontMono.variable}`}
    >
      <body className="antialiased min-h-screen font-sans bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
        <ThemeProvider>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
