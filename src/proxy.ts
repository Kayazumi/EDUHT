// [BE] Cổng kiểm tra phiên và vai trò (proxy/middleware) · tài liệu mục 7.12
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(_request: NextRequest) {
  // TODO: làm mới phiên Supabase (updateSession)
  // TODO: nếu chưa đăng nhập -> chuyển hướng /login
  // TODO: nếu còn must_change_password -> chuyển hướng /change-password
  // TODO: nếu truy cập sai tiền tố vai trò -> chuyển hướng /forbidden (/admin, /teacher, /student)
  return NextResponse.next();
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
