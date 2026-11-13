// [BE] Cổng kiểm tra phiên và vai trò (proxy/middleware) · tài liệu mục 7.12
import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/server/supabase/proxy-session";
import type { Role } from "@/shared/config/roles";

const PUBLIC_PATHS = [
  "/login",
  "/forgot-password",
  "/auth/callback",
  "/forbidden",
  // The route handler validates the Vercel Cron bearer token itself.
  "/api/cron/keepalive",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicPath = PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(path + "/"));

  // 1. Cập nhật phiên từ Supabase cookie
  const { response, user, profile } = await updateSession(request);
  const demoRole = process.env.NODE_ENV !== "production"
    ? (request.cookies.get("pbl_demo_role")?.value as Role | undefined)
    : undefined;
  const isDemoValid = demoRole && ["admin", "teacher", "student"].includes(demoRole);

  if (!user && !isDemoValid) {
    if (!isPublicPath) {
      const loginUrl = new URL("/login", request.url);
      if (pathname !== "/") {
        loginUrl.searchParams.set("next", pathname);
      }
      return NextResponse.redirect(loginUrl);
    }
    return response;
  }

  // 2. Người dùng đã đăng nhập hoặc dùng demo preview role
  const role = user ? ((profile?.role as Role) || (user.app_metadata?.role as Role) || "student") : (demoRole as Role);
  const mustChangePassword = user ? (profile?.must_change_password ?? !!user.app_metadata?.must_change_password) : false;

  // 2.1 Bắt buộc đổi mật khẩu nếu must_change_password = true
  if (mustChangePassword && pathname !== "/change-password" && !isPublicPath) {
    return NextResponse.redirect(new URL("/change-password", request.url));
  }

  if (!mustChangePassword && pathname === "/change-password") {
    return NextResponse.redirect(new URL(`/${role}`, request.url));
  }

  // 2.2 Đã có phiên truy cập /login hoặc trang chủ /
  if (pathname === "/") {
    return NextResponse.redirect(new URL(`/${role}`, request.url));
  }
  if (pathname === "/login" && user) {
    return NextResponse.redirect(new URL(`/${role}`, request.url));
  }

  // 2.3 Phân quyền tiền tố URL (Scenario 12: gõ tay /teacher khi là student -> /forbidden)
  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/forbidden", request.url));
  }

  if (pathname.startsWith("/teacher") && role !== "teacher") {
    return NextResponse.redirect(new URL("/forbidden", request.url));
  }

  if (pathname.startsWith("/student") && role !== "student") {
    return NextResponse.redirect(new URL("/forbidden", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Khớp tất cả các đường dẫn trừ:
     * - _next/static (tệp tĩnh)
     * - _next/image (tối ưu hóa hình ảnh)
     * - favicon.ico, sitemap.xml, robots.txt
     * - public folder (/images, /templates)
     */
    "/((?!_next/static|_next/image|favicon.ico|images/|templates/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

export default proxy;
