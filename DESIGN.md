---
name: EDUHT Design System
description: Hệ thống thiết kế nền tảng dạy học dự án Tin học THPT & Đánh giá đồng đẳng BARS
colors:
  primary: "#2563eb"
  primary-hover: "#1d4ed8"
  primary-subtle: "#eff6ff"
  neutral-bg: "#f8fafc"
  neutral-surface: "#ffffff"
  neutral-border: "#e2e8f0"
  neutral-text: "#0f172a"
  neutral-muted: "#64748b"
  status-todo: "#64748b"
  status-todo-bg: "#f8fafc"
  status-doing: "#2563eb"
  status-doing-bg: "#eff6ff"
  status-done: "#16a34a"
  status-done-bg: "#f0fdf4"
  status-late: "#dc2626"
  status-late-bg: "#fef2f2"
typography:
  display:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.25
  heading:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.35
  body:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  caption:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral-surface}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "#f1f5f9"
    textColor: "{colors.neutral-text}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  card:
    backgroundColor: "{colors.neutral-surface}"
    rounded: "{rounded.lg}"
    padding: "16px 20px"
---

# EDUHT Design System

Tài liệu quy chuẩn giao diện và hệ thống thiết kế dành cho nền tảng EDUHT (Dạy học theo dự án - PBL môn Tin học THPT & Đánh giá năng lực hợp tác BARS).

## 1. Overview

EDUHT là ứng dụng hướng tới ba đối tượng: **Học sinh THPT**, **Giáo viên Tin học** và **Quản trị viên**. 
Chế độ bề mặt chủ đạo là **Operate** (Vận hành & thao tác nhanh): chú trọng tính rõ ràng, mạch lạc, khả năng quét nhanh số liệu và giảm thiểu sai sót khi nộp đánh giá hoặc phân công nhiệm vụ.

- **Phong cách thị giác:** Chuyên nghiệp, hiện đại, thân thiện với môi trường học đường.
- **Ngôn ngữ giao diện:** Tiếng Việt phổ thông, thuật ngữ sư phạm chuẩn xác, loại bỏ hoàn toàn các mã kỹ thuật (như tên bảng CSDL, mã SQL view).

## 2. Colors

Hệ màu tuân thủ định nghĩa token tại `src/styles/tokens.css` và bảng màu Tailwind CSS:

- **Màu chủ đạo (Primary):** Xanh dương (#2563eb / Blue-600) tượng trưng cho học tập, công nghệ và độ tin cậy. Dùng cho nút kêu gọi hành động chính, tab đang kích hoạt, và liên kết nổi bật.
- **Màu nền (Background):** Xám trung tính sáng (#f8fafc / Slate-50) giúp dịu mắt khi làm việc lâu trong lớp học.
- **Màu bề mặt (Surface):** Trắng (#ffffff) với viền nhẹ (#e2e8f0 / Slate-200) cho các thẻ Kanban, khối tiến độ và bảng dữ liệu.
- **Hệ màu trạng thái Kanban:**
  - *Chưa làm (To do):* Xám Slate (#64748b) trên nền #f8fafc.
  - *Đang làm (Doing):* Xanh Blue (#2563eb) trên nền #eff6ff.
  - *Hoàn thành (Done):* Xanh lục Green (#16a34a) trên nền #f0fdf4.
  - *Trễ hạn (Late):* Đỏ Rose (#dc2626) trên nền #fef2f2.

## 3. Typography

- **Phông chữ:** Sans-serif hệ thống (`Inter, system-ui, -apple-system, sans-serif`) tối ưu hóa khả năng đọc trên màn hình điện thoại và máy tính phòng lab.
- **Hệ thống cấp bậc:**
  - *Tiêu đề trang (H1):* 24px–28px, font-bold, màu Slate-900.
  - *Tiêu đề khối / mục (H2):* 16px–18px, font-semibold / font-bold, màu Slate-800.
  - *Văn bản nội dung (Body):* 14px (0.875rem), text-slate-700, leading-relaxed.
  - *Nhãn phụ / Chú thích (Caption):* 11px–12px (0.75rem), text-slate-500.

## 4. Layout

- **Thanh điều hướng trên (Topbar):** Chiều cao cố định 64px (`h-16`), ghim dính trên cùng (`sticky top-0 z-30`). Chứa logo EDUHT, vai trò người dùng, menu hamburger trên mobile và nút Đăng xuất an toàn.
- **Thanh bên (Sidebar / RoleNav):**
  - *Desktop (>= 768px):* Rộng 256px (`w-64`), cố định bên trái, tự động cuộn độc lập.
  - *Mobile (< 768px):* Ẩn thanh bên cố định, kích hoạt qua Drawer ngăn kéo trượt (`animate-in slide-in-from-left`) có backdrop mờ và tự động đóng khi nhấp chuyển trang.
- **Khu vực nội dung (Main):** Tối đa `max-w-7xl`, canh giữa (`mx-auto`), khoảng cách đệm `p-4 sm:p-6`.

## 5. Elevation & Depth

- Tránh lạm dụng bóng đổ quá đậm (heavy dropshadow).
- Sử dụng chủ yếu viền mảnh (`border border-slate-200`) kết hợp bóng rất nhẹ (`shadow-2xs` hoặc `shadow-sm`) để phân tách các lớp khối giao diện.
- Lớp Modal / Drawer sử dụng backdrop `bg-black/40` với hiệu ứng làm mờ nhẹ (`backdrop-blur-2xs`) và bóng lớn `shadow-2xl`.

## 6. Shapes

- Bo góc thẻ và panel: `rounded-xl` (12px) hoặc `rounded-2xl` (16px) cho container lớn và modal.
- Bo góc nút bấm & ô nhập liệu: `rounded-lg` (8px).
- Huy hiệu (Badge): Bo tròn hoàn toàn `rounded-full`.

## 7. Components

- **Nút bấm (Button):**
  - *Primary:* Nền xanh Blue-600, chữ trắng, hiệu ứng hover Blue-700.
  - *Secondary:* Nền trắng hoặc xám nhạt Slate-100, viền Slate-300, chữ Slate-700.
  - *Danger:* Nền đỏ Rose-600, chữ trắng.
- **Huy hiệu (Badge):** Sử dụng các biến thể: `success`, `warning`, `danger`, `info` với nền nhạt và chữ tương phản cao.
- **Thẻ tiêu chí BARS:** Khung thẻ riêng biệt cho mỗi tiêu chí, các mức mô tả hành vi trực quan kèm radio selector; khi đã chọn sẽ kích hoạt viền xanh (`border-blue-500 ring-1 ring-blue-100`).
- **Modal xác nhận:** Bắt buộc có phần tóm tắt rà soát các mức đã chọn, cảnh báo thao tác không thể đảo ngược bằng tông vàng cảnh báo (Amber), và 2 nút phân cấp rõ ràng (Kiểm tra lại / Đồng ý nộp).

## 8. Do's and Don'ts

### Do's:
- Luôn hiển thị trạng thái dữ liệu rõ ràng (Đang tải, Rỗng, Lỗi, Đã nộp) bằng component dùng chung `PortalDataState`.
- Mọi thao tác nộp phiếu đánh giá không thể sửa bắt buộc phải có bước xác nhận rà soát.
- Minh bạch quyền riêng tư (Privacy Disclosure) khi học sinh thực hiện chấm điểm bạn học.
- Đảm bảo thanh điều hướng hoạt động đầy đủ trên màn hình điện thoại di động.

### Don'ts:
- Không để lộ tên view CSDL (như `v_group_progress`, `v_student_contribution`) trên giao diện người dùng.
- Không gắn cứng ID mẫu (như `p01`, `cls-12a1`) vào thanh điều hướng cố định.
- Không dùng cùng lúc 2 nút "Đổi tài khoản" và "Đăng xuất" thực hiện cùng một hành vi.
- Không đặt màu sắc gây nhầm lẫn trạng thái (ví dụ dùng màu xanh lá cho việc trễ hạn).

