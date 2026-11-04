// [FE] Trang chủ chuyển hướng đăng nhập · tài liệu mục 7.14
import { redirect } from "next/navigation";
import { routes } from "@/shared/config/routes";

export default function HomePage() {
  redirect(routes.auth.login);
}
