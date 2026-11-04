<!-- [DOC] Tài liệu hướng dẫn dự án · tài liệu mục 10 -->
# PBL Platform — Nền tảng Quản lý Tiến trình và Đánh giá Đóng góp trong Dạy học Dự án Tin học THPT

> **Mã dự án**: `pbl-platform`  
> **Phiên bản hiện tại**: `1.0.0` (Đã hoàn thiện toàn bộ Giao diện 3 phân hệ, 14 Server Actions kết nối CSDL, Chế độ xem trước Demo và Hệ thống kiểm thử lõi)  
> **Chuẩn thiết kế**: Tuân thủ tài liệu thiết kế *Cấu trúc dự án và ràng buộc dữ liệu v1*

---

## 1. Tổng quan dự án

### 1.1 Giới thiệu mục đích
**PBL Platform** là ứng dụng web chuyên biệt phục vụ dạy học theo dự án (Project-Based Learning - PBL) trong môn **Tin học cấp Trung học Phổ thông** theo Chương trình Giáo dục Phổ thông 2018 (GDPT 2018).

Hệ thống giải quyết triệt để 3 thách thức lớn nhất của giáo viên khi tổ chức dạy học dự án:
1. **Minh bạch hóa tiến trình làm việc nhóm**: Khắc phục hiện tượng "ngồi chơi xơi nước" hoặc một học sinh gánh cả nhóm thông qua **Bảng Kanban kéo thả** với cơ chế ghi nhận nhật ký bất biến (người nhận, hạn chót, thời gian hoàn thành thực tế, cảnh báo trễ hạn).
2. **Đánh giá đồng đẳng công bằng & khách quan (BARS Rubric)**: Sử dụng thang đo neo theo hành vi (**Behaviorally Anchored Rating Scales**) với 5 mức độ hành vi quan sát được (D1 - D5). Học sinh chọn mô tả hành vi thay vì chấm điểm cảm tính; toàn bộ điểm số thô được ẩn hoàn toàn để tránh so đo, tị nạnh giữa các thành viên.
3. **Tự động hóa tổng hợp & hòa giải điểm số**: Hệ thống tự động tính toán điểm số trên máy chủ thông qua các hàm lưu trữ (PostgreSQL RPC), phân tích độ lệch điểm (cảnh báo khi điểm lệch $\ge 2.0$), cho phép giáo viên điều chỉnh điểm có lưu vết lý do ($\ge 10$ ký tự) và xuất báo cáo điểm chuẩn UTF-8 BOM cho Excel.

### 1.2 Ba phân hệ vai trò
* 🛡️ **Quản trị viên (Admin)**: Quản lý người dùng, phân quyền, nhập học sinh từ CSV, cấu hình danh mục Yêu cầu cần đạt (YCCĐ) Tin học GDPT 2018, thiết lập mẫu Rubric BARS chuẩn, quản lý đồng thuận đạo đức nghiên cứu và tra cứu nhật ký kiểm toán (Audit Logs).
* 👨‍🏫 **Giáo viên (Teacher)**: Quản lý lớp học, thiết lập dự án PBL (với checklist 5 điều kiện kích hoạt), phân nhóm (cơ chế khóa 1 chiều), quan sát Kanban của các nhóm, theo dõi biểu đồ tiến độ & đóng góp cá nhân, mở đợt đánh giá đồng đẳng, tổng hợp, hòa giải và công bố điểm số.
* 🎓 **Học sinh (Student)**: Quản lý thông tin & đồng thuận nghiên cứu, nhận và phân công công việc trên bảng Kanban 3 cột, tham gia đánh giá đồng đẳng thành viên nhóm theo thang BARS, xem kết quả điểm và biểu đồ Radar năng lực khi giáo viên công bố.

### 1.3 Ngôn ngữ lập trình & Công nghệ sử dụng

| Thành phần | Công nghệ / Thư viện | Phiên bản thực tế | Mục đích sử dụng |
| :--- | :--- | :--- | :--- |
| **Ngôn ngữ** | TypeScript | `^5.7.3` | Kiểu dữ liệu tĩnh, chế độ kiểm tra nghiêm ngặt (`strict: true`) |
| **Framework** | Next.js (App Router) | `16.4.5` | Kiến trúc Server Components kết hợp Client Components tối ưu SEO và bảo mật |
| **Thư viện UI** | React | `19.3.0` | Thư viện xây dựng giao diện người dùng tương tác cao |
| **Styling** | Tailwind CSS | `^4.0.9` | Framework CSS tiện ích, không phụ thuộc thư viện UI cồng kềnh |
| **Cơ sở dữ liệu** | Supabase (PostgreSQL) | PostgreSQL 15+ | Lưu trữ quan hệ, Trigger kiểm toán, Stored Procedures (RPC), Row-Level Security (RLS) |
| **SDK Supabase** | `@supabase/supabase-js`, `@supabase/ssr` | `^2.49.1`, `^0.5.2` | Quản lý phiên làm việc máy chủ qua cookies an toàn |
| **Kiểm tra dữ liệu** | Zod | `^3.24.2` | Xác thực schema dữ liệu 2 đầu (Client & Server Actions) |
| **Tương tác kéo thả** | `@dnd-kit/core`, `@dnd-kit/sortable` | `^6.3.1`, `^10.0.0` | Trải nghiệm kéo thả mượt mà trên bảng Kanban |
| **Biểu đồ dữ liệu** | Recharts | `^2.15.1` | Vẽ biểu đồ tiến độ nhóm, tỷ lệ đóng góp cá nhân và biểu đồ Radar năng lực |
| **Bảo vệ máy chủ** | `server-only` | `^0.0.1` | Ngăn chặn việc lộ mã nguồn hoặc khóa máy chủ ra phía Client |
| **Kiểm thử đơn vị** | Vitest | `^3.0.7` | Chạy kiểm thử hàm tính điểm, tính trễ hạn, kiểm tra tranh chấp dữ liệu |
| **Kiểm thử E2E** | Playwright | `^1.50.1` | Kiểm thử tự động hành vi người dùng trên trình duyệt thật |
| **Kiểm thử CSDL** | `pg`, `@types/pg` | `^8.13.3` | Kết nối kiểm thử tranh chấp đồng thời (concurrency testing) |
| **Môi trường chạy** | Node.js | `>= 20.0.0` | Nền tảng thực thi JavaScript phía máy chủ |

---

## 2. Cấu trúc thư mục & Giải thích chi tiết các tệp

Dự án gồm **đúng 184 tệp chuẩn** được phân bổ theo mô hình đa tầng rõ ràng. Dưới đây là bảng phân loại và chi tiết từng thư mục, từng tệp:

```
SPNC/
├── .github/                      # Cấu hình GitHub Actions CI/CD
├── docs/                         # Tài liệu kiến trúc, ERD, RLS và đạo đức nghiên cứu
├── public/                       # Tệp tĩnh, hình ảnh SVG, mẫu CSV
├── scripts/                      # Kịch bản dòng lệnh quản trị, sao lưu, nạp dữ liệu
├── src/                          # Toàn bộ mã nguồn ứng dụng
│   ├── app/                      # Next.js App Router (Giao diện & Tuyến API)
│   ├── components/               # Các khối giao diện React (UI, Forms, Kanban, BARS...)
│   ├── hooks/                    # Custom React Hooks
│   ├── server/                   # Tầng máy chủ: Actions, Auth, DB, Audit, Supabase
│   ├── shared/                   # Tầng dùng chung: Config, Types, Validation, Utils
│   ├── styles/                   # Cấu hình kiểu dáng toàn cục (Tailwind CSS)
│   └── proxy.ts                  # Cổng kiểm soát phiên & phân quyền (Middleware)
├── supabase/                     # Cơ sở dữ liệu: Migrations, Seeds, Kiểm thử pgTAP
└── tests/                        # Bộ kiểm thử tự động: Unit, Concurrency, E2E
```

### 2.1 Thư mục gốc (Root Configuration)
* [`package.json`](package.json): Khai báo phụ thuộc, cấu hình dự án, thông tin tác giả và các scripts thực thi.
* [`tsconfig.json`](tsconfig.json): Cấu hình TypeScript với `strict: true` và alias đường dẫn `@/*` trỏ về `src/*`.
* [`next.config.ts`](next.config.ts): Cấu hình Next.js App Router, bật serverActions và webpack compiler.
* [`postcss.config.mjs`](postcss.config.mjs): Cấu hình PostCSS nạp Tailwind CSS v4.
* [`eslint.config.mjs`](eslint.config.mjs): Cấu hình ESLint với các quy tắc ranh giới kiến trúc (ngăn client import server, kiểm soát service_role).
* [`vitest.config.ts`](vitest.config.ts): Cấu hình môi trường kiểm thử Vitest với alias đường dẫn `@/*`.
* [`playwright.config.ts`](playwright.config.ts): Cấu hình kiểm thử tự động trình duyệt E2E với webServer tích hợp.
* [`vercel.json`](vercel.json): Cấu hình triển khai Vercel, cron keepalive định kỳ và thiết lập vùng máy chủ Singapore (`sin1`).
* [`.env.example`](.env.example): Mẫu biến môi trường an toàn (URL Supabase, khóa anon, cron secret, khóa HMAC).
* [`AGENTS.md`](AGENTS.md): Bản ghi nhớ nguyên tắc kiến trúc và chỉ dẫn dành cho AI Agents.
* [`README.md`](README.md): Bản tài liệu hướng dẫn tổng quan và vận hành dự án (tệp này).

---

### 2.2 Thư mục `src/app/` (Next.js App Router)
Thực thi toàn bộ các trang giao diện (Server Components) và API Routes theo cấu trúc phân hệ:

* **Tệp cốt lõi tầng ứng dụng**:
  * [`src/app/layout.tsx`](src/app/layout.tsx): Bố cục gốc ứng dụng, thiết lập font chữ tiếng Việt, tiêu đề và metadata.
  * [`src/app/page.tsx`](src/app/page.tsx): Trang chủ chuyển hướng thông minh dựa vào vai trò người dùng.
  * [`src/app/loading.tsx`](src/app/loading.tsx): Giao diện hiển thị trạng thái chờ tải dữ liệu toàn cục.
  * [`src/app/error.tsx`](src/app/error.tsx): Xử lý ngoại lệ và hiển thị giao diện báo lỗi thân thiện.
  * [`src/app/not-found.tsx`](src/app/not-found.tsx): Giao diện hiển thị lỗi 404 (Không tìm thấy trang).
  * [`src/app/forbidden/page.tsx`](src/app/forbidden/page.tsx): Giao diện thông báo từ chối truy cập (403 Forbidden).
  * [`src/app/change-password/page.tsx`](src/app/change-password/page.tsx): Trang bắt buộc đổi mật khẩu lần đầu.

* **Phân hệ Xác thực `(auth)/`**:
  * [`src/app/(auth)/login/page.tsx`](src/app/(auth)/login/page.tsx): Trang đăng nhập, hỗ trợ tài khoản demo và 3 nút chọn vai trò 1 chạm.
  * [`src/app/(auth)/forgot-password/page.tsx`](src/app/(auth)/forgot-password/page.tsx): Giao diện yêu cầu khôi phục mật khẩu.
  * [`src/app/auth/callback/route.ts`](src/app/auth/callback/route.ts): Tuyến API trao đổi mã Auth Code từ Supabase sang phiên Session.

* **Phân hệ Quản trị viên `(admin)/`** (11 trang):
  * [`src/app/(admin)/admin/layout.tsx`](src/app/(admin)/admin/layout.tsx): Bố cục khung phân hệ Admin (`requireRole('admin')`).
  * [`src/app/(admin)/admin/page.tsx`](src/app/(admin)/admin/page.tsx): Bảng điều khiển tổng quan quản trị (thống kê tài khoản, lớp, dự án).
  * [`src/app/(admin)/admin/users/page.tsx`](src/app/(admin)/admin/users/page.tsx): Danh sách người dùng, lọc theo vai trò và trạng thái.
  * [`src/app/(admin)/admin/users/new/page.tsx`](src/app/(admin)/admin/users/new/page.tsx): Biểu mẫu thêm mới tài khoản đơn lẻ.
  * [`src/app/(admin)/admin/users/import/page.tsx`](src/app/(admin)/admin/users/import/page.tsx): Nhập danh sách học sinh từ file CSV theo lớp.
  * [`src/app/(admin)/admin/users/[userId]/page.tsx`](src/app/(admin)/admin/users/[userId]/page.tsx): Chi tiết tài khoản, đặt lại mật khẩu, kích hoạt/khóa.
  * [`src/app/(admin)/admin/classes/page.tsx`](src/app/(admin)/admin/classes/page.tsx): Danh sách lớp học và giáo viên chủ nhiệm.
  * [`src/app/(admin)/admin/classes/[classId]/page.tsx`](src/app/(admin)/admin/classes/[classId]/page.tsx): Chi tiết lớp học, danh sách học sinh theo lớp.
  * [`src/app/(admin)/admin/curriculum/page.tsx`](src/app/(admin)/admin/curriculum/page.tsx): Danh mục Yêu cầu cần đạt (YCCĐ) Tin học THPT GDPT 2018.
  * [`src/app/(admin)/admin/bars-templates/page.tsx`](src/app/(admin)/admin/bars-templates/page.tsx): Thiết lập mẫu Rubric BARS chuẩn 5 mức độ hành vi.
  * [`src/app/(admin)/admin/research/page.tsx`](src/app/(admin)/admin/research/page.tsx): Quản lý phiếu đồng thuận đạo đức nghiên cứu học sinh.
  * [`src/app/(admin)/admin/audit-log/page.tsx`](src/app/(admin)/admin/audit-log/page.tsx): Xem nhật ký kiểm toán hệ thống bất biến (Audit Trail).

* **Phân hệ Giáo viên `(teacher)/`** (14 trang):
  * [`src/app/(teacher)/teacher/layout.tsx`](src/app/(teacher)/teacher/layout.tsx): Bố cục khung phân hệ Giáo viên (`requireRole('teacher')`).
  * [`src/app/(teacher)/teacher/page.tsx`](src/app/(teacher)/teacher/page.tsx): Bảng điều khiển giáo viên (dự án đang dạy, việc cần làm).
  * [`src/app/(teacher)/teacher/classes/[classId]/page.tsx`](src/app/(teacher)/teacher/classes/[classId]/page.tsx): Quản lý học sinh và sĩ số trong lớp phụ trách.
  * [`src/app/(teacher)/teacher/classes/[classId]/students/import/page.tsx`](src/app/(teacher)/teacher/classes/[classId]/students/import/page.tsx): Nhập học sinh vào lớp từ file CSV.
  * [`src/app/(teacher)/teacher/projects/page.tsx`](src/app/(teacher)/teacher/projects/page.tsx): Danh sách các dự án học tập PBL.
  * [`src/app/(teacher)/teacher/projects/new/page.tsx`](src/app/(teacher)/teacher/projects/new/page.tsx): Biểu mẫu tạo mới dự án học tập.
  * [`src/app/(teacher)/teacher/projects/[projectId]/page.tsx`](src/app/(teacher)/teacher/projects/[projectId]/page.tsx): Chi tiết dự án và Checklist 5 điều kiện kích hoạt.
  * [`src/app/(teacher)/teacher/projects/[projectId]/tasks/page.tsx`](src/app/(teacher)/teacher/projects/[projectId]/tasks/page.tsx): Kho nhiệm vụ mẫu và ma trận bao phủ YCCĐ.
  * [`src/app/(teacher)/teacher/projects/[projectId]/groups/page.tsx`](src/app/(teacher)/teacher/projects/[projectId]/groups/page.tsx): Quản lý nhóm học sinh và tính năng Khóa nhóm 1 chiều.
  * [`src/app/(teacher)/teacher/projects/[projectId]/groups/[groupId]/page.tsx`](src/app/(teacher)/teacher/projects/[projectId]/groups/[groupId]/page.tsx): Chi tiết nhóm học sinh và các thành viên.
  * [`src/app/(teacher)/teacher/projects/[projectId]/groups/[groupId]/kanban/page.tsx`](src/app/(teacher)/teacher/projects/[projectId]/groups/[groupId]/kanban/page.tsx): Giáo viên quan sát bảng Kanban nhóm và nhật ký sự kiện.
  * [`src/app/(teacher)/teacher/projects/[projectId]/dashboard/page.tsx`](src/app/(teacher)/teacher/projects/[projectId]/dashboard/page.tsx): Biểu đồ tiến độ nhóm và chỉ số đóng góp cá nhân.
  * [`src/app/(teacher)/teacher/projects/[projectId]/evaluation/page.tsx`](src/app/(teacher)/teacher/projects/[projectId]/evaluation/page.tsx): Quản lý các đợt đánh giá BARS và ma trận nộp bài $n \times (n - 1)$.
  * [`src/app/(teacher)/teacher/projects/[projectId]/evaluation/[roundId]/page.tsx`](src/app/(teacher)/teacher/projects/[projectId]/evaluation/[roundId]/page.tsx): Chi tiết tiến độ nộp bài của một đợt đánh giá.
  * [`src/app/(teacher)/teacher/projects/[projectId]/grading/page.tsx`](src/app/(teacher)/teacher/projects/[projectId]/grading/page.tsx): Bảng tổng hợp điểm, cảnh báo lệch điểm, hòa giải và điều chỉnh điểm.
  * [`src/app/(teacher)/teacher/projects/[projectId]/export/page.tsx`](src/app/(teacher)/teacher/projects/[projectId]/export/page.tsx): Xuất bảng điểm tổng kết ra file CSV chuẩn UTF-8 BOM.

* **Phân hệ Học sinh `(student)/`** (7 trang):
  * [`src/app/(student)/student/layout.tsx`](src/app/(student)/student/layout.tsx): Bố cục khung phân hệ Học sinh (`requireRole('student')`).
  * [`src/app/(student)/student/page.tsx`](src/app/(student)/student/page.tsx): Bảng điều khiển học sinh (nhiệm vụ được giao, cảnh báo sắp hết hạn).
  * [`src/app/(student)/student/profile/page.tsx`](src/app/(student)/student/profile/page.tsx): Hồ sơ học sinh, ký phiếu đồng thuận nghiên cứu và đổi mật khẩu.
  * [`src/app/(student)/student/projects/[projectId]/page.tsx`](src/app/(student)/student/projects/[projectId]/page.tsx): Trang tổng quan dự án của nhóm, danh sách bạn cùng nhóm.
  * [`src/app/(student)/student/projects/[projectId]/board/page.tsx`](src/app/(student)/student/projects/[projectId]/board/page.tsx): Bảng việc Kanban kéo thả 3 cột (Todo, Doing, Done).
  * [`src/app/(student)/student/projects/[projectId]/review/page.tsx`](src/app/(student)/student/projects/[projectId]/review/page.tsx): Danh sách các đợt đánh giá đồng đẳng đang mở kèm đồng hồ đếm ngược.
  * [`src/app/(student)/student/projects/[projectId]/review/[rateeId]/page.tsx`](src/app/(student)/student/projects/[projectId]/review/[rateeId]/page.tsx): Phiếu đánh giá đồng đẳng chi tiết cho từng thành viên theo thang BARS.
  * [`src/app/(student)/student/projects/[projectId]/results/page.tsx`](src/app/(student)/student/projects/[projectId]/results/page.tsx): Xem điểm cá nhân và biểu đồ Radar khi giáo viên công bố.

* **Tuyến API phía máy chủ (`src/app/api/`)**:
  * [`src/app/api/cron/keepalive/route.ts`](src/app/api/cron/keepalive/route.ts): API chạy ngầm theo lịch Vercel Cron nhằm giữ cho dự án Supabase không bị tạm dừng.
  * [`src/app/api/export/[projectId]/route.ts`](src/app/api/export/[projectId]/route.ts): Tuyến API xuất dữ liệu nghiên cứu mã hóa giả danh (HMAC SHA-256).

---

### 2.3 Thư mục `src/components/` (Khối giao diện tái sử dụng)
* **`ui/` (Giao diện nguyên tử)**:
  * [`button.tsx`](src/components/ui/button.tsx), [`input.tsx`](src/components/ui/input.tsx), [`badge.tsx`](src/components/ui/badge.tsx), [`dialog.tsx`](src/components/ui/dialog.tsx), [`toast.tsx`](src/components/ui/toast.tsx), [`tabs.tsx`](src/components/ui/tabs.tsx), [`table.tsx`](src/components/ui/table.tsx), [`alert.tsx`](src/components/ui/alert.tsx), [`progress-bar.tsx`](src/components/ui/progress-bar.tsx).
* **`forms/` (Biểu mẫu thao tác dữ liệu)**:
  * [`login-form.tsx`](src/components/forms/login-form.tsx), [`create-user-form.tsx`](src/components/forms/create-user-form.tsx), [`create-class-form.tsx`](src/components/forms/create-class-form.tsx), [`import-students-form.tsx`](src/components/forms/import-students-form.tsx), [`create-project-form.tsx`](src/components/forms/create-project-form.tsx), [`create-group-form.tsx`](src/components/forms/create-group-form.tsx), [`create-task-template-form.tsx`](src/components/forms/create-task-template-form.tsx).
* **`kanban/` (Bảng Kanban kéo thả chuyên sâu)**:
  * [`board.tsx`](src/components/kanban/board.tsx): Vùng chứa bảng kéo thả dnd-kit.
  * [`column.tsx`](src/components/kanban/column.tsx): Cột trạng thái (Todo, Doing, Done).
  * [`card.tsx`](src/components/kanban/card.tsx): Thẻ công việc hiển thị người phụ trách, hạn chót và nhãn trễ hạn.
  * [`task-dialog.tsx`](src/components/kanban/task-dialog.tsx): Hộp thoại tạo mới hoặc chỉnh sửa chi tiết công việc.
  * [`filter-bar.tsx`](src/components/kanban/filter-bar.tsx): Thanh lọc công việc theo người nhận hoặc trạng thái.
  * [`event-log-drawer.tsx`](src/components/kanban/event-log-drawer.tsx): Ngăn kéo xem nhật ký thao tác thẻ công việc thời gian thực.
* **`peer-review/` (Đánh giá đồng đẳng theo BARS)**:
  * [`review-form.tsx`](src/components/peer-review/review-form.tsx): Biểu mẫu đánh giá thành viên.
  * [`bars-criterion-field.tsx`](src/components/peer-review/bars-criterion-field.tsx): Trường chọn mức độ hành vi cho tiêu chí D1 - D5 (D5 bắt buộc nhận xét định tính $\ge 10$ ký tự).
  * [`score-preview-modal.tsx`](src/components/peer-review/score-preview-modal.tsx): Hộp thoại xem lại phiếu trước khi nộp chính thức.
  * [`matrix-view.tsx`](src/components/peer-review/matrix-view.tsx): Bảng ma trận nộp bài đánh giá chéo giữa các thành viên.
* **`dashboard/` (Trực quan hóa chỉ báo)**:
  * [`progress-chart.tsx`](src/components/dashboard/progress-chart.tsx): Biểu đồ thanh tiến độ hoàn thành của các nhóm.
  * [`contribution-chart.tsx`](src/components/dashboard/contribution-chart.tsx): Biểu đồ phân tích tỷ lệ đóng góp cá nhân.
  * [`radar-chart.tsx`](src/components/dashboard/radar-chart.tsx): Biểu đồ mạng nhện đánh giá năng lực 5 tiêu chí.
  * [`lateness-indicator.tsx`](src/components/dashboard/lateness-indicator.tsx): Huy hiệu cảnh báo trễ hạn công việc.
  * [`stat-card.tsx`](src/components/dashboard/stat-card.tsx): Thẻ hiển thị số liệu thống kê nhanh.
* **`layout/` (Khung sườn điều hướng)**:
  * [`topbar.tsx`](src/components/layout/topbar.tsx): Thanh tiêu đề trên cùng, hiển thị người dùng, nút đổi vai trò và đăng xuất.
  * [`sidebar.tsx`](src/components/layout/sidebar.tsx): Thanh điều hướng cạnh bên theo từng phân hệ.
  * [`role-nav.tsx`](src/components/layout/role-nav.tsx): Menu liên kết nhanh cho từng vai trò và các lối tắt xem thử.
  * [`footer.tsx`](src/components/layout/footer.tsx): Chân trang hiển thị thông tin bản quyền và phiên bản hệ thống.

---

### 2.4 Thư mục `src/server/` (Tầng xử lý máy chủ & bảo mật)
Chỉ thực thi ở môi trường Node.js phía máy chủ (bảo vệ bởi `server-only`):
* **`actions/` (14 Server Actions)**:
  * [`auth.ts`](src/server/actions/auth.ts): Đăng nhập, đăng xuất, đổi mật khẩu, cấp cookie demo.
  * [`users.ts`](src/server/actions/users.ts): Quản lý tài khoản, tạo user qua `service_role`.
  * [`classes.ts`](src/server/actions/classes.ts): Tạo lớp, cập nhật thông tin lớp, tra cứu sĩ số.
  * [`curriculum.ts`](src/server/actions/curriculum.ts): Quản lý danh mục YCCĐ môn Tin học.
  * [`bars.ts`](src/server/actions/bars.ts): Cấu hình các tiêu chí và mô tả mức độ hành vi Rubric BARS.
  * [`projects.ts`](src/server/actions/projects.ts): Tạo dự án, kích hoạt dự án (`set_project_status`).
  * [`task-templates.ts`](src/server/actions/task-templates.ts): Tạo nhiệm vụ mẫu, ánh xạ YCCĐ.
  * [`groups.ts`](src/server/actions/groups.ts): Phân nhóm, gán học sinh, khóa nhóm 1 chiều, khởi tạo thẻ công việc tự động (`instantiate_group_tasks`).
  * [`tasks.ts`](src/server/actions/tasks.ts): Cập nhật trạng thái thẻ Kanban, kiểm tra quyền assignee, ghi nhận `completed_at`.
  * [`rounds.ts`](src/server/actions/rounds.ts): Mở đợt đánh giá (`open_round`), đóng đợt đánh giá (`finalize_round`).
  * [`reviews.ts`](src/server/actions/reviews.ts): Gửi phiếu đánh giá đồng đẳng (`submit_review`).
  * [`grading.ts`](src/server/actions/grading.ts): Tính điểm tự động (`compute_final_scores`), điều chỉnh điểm (`adjust_final_score`), công bố điểm (`publish_results`).
  * [`consents.ts`](src/server/actions/consents.ts): Ghi nhận phiếu đồng thuận nghiên cứu của học sinh.
  * [`export.ts`](src/server/actions/export.ts): Xuất bảng điểm CSV định dạng UTF-8 BOM.
* **`supabase/`**:
  * [`server.ts`](src/server/supabase/server.ts): Khởi tạo Supabase Client an toàn đọc/ghi Cookie từ Request.
  * [`admin.ts`](src/server/supabase/admin.ts): Khởi tạo Supabase Admin Client bằng `SUPABASE_SERVICE_ROLE_KEY` (chỉ dùng nội bộ).
  * [`proxy-session.ts`](src/server/supabase/proxy-session.ts): Hàm cập nhật phiên phiên làm việc trong `proxy.ts`.
* **`auth/`**:
  * [`session.ts`](src/server/auth/session.ts): Lấy thông tin người dùng hiện tại, hỗ trợ phiên mô phỏng demo.
  * [`roles.ts`](src/server/auth/roles.ts): Danh sách vai trò và nhãn hiển thị tiếng Việt.
  * [`rbac.ts`](src/server/auth/rbac.ts): Hàm chặn phân quyền bắt buộc `requireRole()`, `requireAnyRole()`.
* **`db/`**:
  * [`queries.ts`](src/server/db/queries.ts): Các truy vấn SQL tối ưu hóa.
  * [`transactions.ts`](src/server/db/transactions.ts): Xử lý giao dịch nhiều bước bảo đảm toàn vẹn dữ liệu.
* **`audit/`**:
  * [`logger.ts`](src/server/audit/logger.ts): Ghi sự kiện kiểm toán bất biến vào bảng `audit_logs`.
* **`crypto/`**:
  * [`pseudonym.ts`](src/server/crypto/pseudonym.ts): Tạo mã giả danh HMAC SHA-256 bảo vệ dữ liệu học sinh khi xuất báo cáo nghiên cứu.

---

### 2.5 Thư mục `src/shared/` (Tầng chia sẻ Client / Server)
* **`config/`**:
  * [`roles.ts`](src/shared/config/roles.ts): Định nghĩa kiểu `Role` (`admin`, `teacher`, `student`).
  * [`routes.ts`](src/shared/config/routes.ts): Bản đồ tuyến đường định tuyến trong hệ thống.
  * [`constants.ts`](src/shared/config/constants.ts): Hằng số cấu hình hệ thống.
  * [`limits.ts`](src/shared/config/limits.ts): Giới hạn kích thước tệp upload, số lượng nhóm, độ dài lý do.
* **`types/`**:
  * [`database.types.ts`](src/shared/types/database.types.ts): Kiểu dữ liệu TypeScript khớp với schema PostgreSQL của Supabase.
  * [`user.ts`](src/shared/types/user.ts), [`project.ts`](src/shared/types/project.ts), [`task.ts`](src/shared/types/task.ts), [`review.ts`](src/shared/types/review.ts), [`grading.ts`](src/shared/types/grading.ts), [`audit.ts`](src/shared/types/audit.ts).
* **`validation/` (Schema Zod xác thực đầu vào)**:
  * [`auth.ts`](src/shared/validation/auth.ts), [`user.ts`](src/shared/validation/user.ts), [`class.ts`](src/shared/validation/class.ts), [`curriculum.ts`](src/shared/validation/curriculum.ts), [`bars.ts`](src/shared/validation/bars.ts), [`project.ts`](src/shared/validation/project.ts), [`task.ts`](src/shared/validation/task.ts), [`review.ts`](src/shared/validation/review.ts), [`grading.ts`](src/shared/validation/grading.ts), [`consent.ts`](src/shared/validation/consent.ts).
* **`utils/` (Hàm tiện ích nghiệp vụ lõi)**:
  * [`calc.ts`](src/shared/utils/calc.ts): Tính điểm trung bình BARS, độ lệch chuẩn và phát hiện bất thường.
  * [`lateness.ts`](src/shared/utils/lateness.ts): Tính toán số giờ/ngày trễ hạn của thẻ công việc.
  * [`csv.ts`](src/shared/utils/csv.ts): Đọc và phân tích file CSV học sinh, tạo file CSV UTF-8 BOM.
  * [`format.ts`](src/shared/utils/format.ts): Định dạng ngày giờ, định dạng điểm số Việt Nam.
  * [`errors.ts`](src/shared/utils/errors.ts): Kiểu `ActionResult` trả về chuẩn từ Server Actions.

---

### 2.6 Thư mục `supabase/` (Cơ sở dữ liệu PostgreSQL)
* **`migrations/` (12 migration theo trình tự)**:
  * `0001_extensions_enums.sql`: Cài đặt pgcrypto, citext và các kiểu ENUM (`user_role`, `project_status`, `task_status`...).
  * `0002_core_tables.sql`: Bảng người dùng, lớp học, học sinh, danh mục YCCĐ, mẫu BARS.
  * `0003_project_tables.sql`: Bảng dự án, nhiệm vụ mẫu, nhóm học sinh, thành viên nhóm.
  * `0004_task_kanban.sql`: Bảng thẻ công việc Kanban và bảng nhật ký sự kiện thẻ.
  * `0005_kanban_triggers.sql`: Trigger kiểm soát người phụ trách, tự ghi nhận `completed_at` và chống sửa lùi thời gian.
  * `0006_peer_review_tables.sql`: Bảng đợt đánh giá BARS, bảng phân công đánh giá và bảng phiếu đánh giá.
  * `0007_review_rpcs.sql`: Các hàm lưu trữ: `open_round`, `submit_review`, `finalize_round`.
  * `0008_grading_tables.sql`: Bảng điểm tổng hợp và bảng lịch sử điều chỉnh điểm có lý do.
  * `0009_grading_rpcs.sql`: Các hàm lưu trữ: `compute_final_scores`, `adjust_final_score`, `publish_results`.
  * `0010_audit_and_ethics.sql`: Bảng nhật ký kiểm toán bất biến và bảng đồng thuận đạo đức nghiên cứu.
  * `0011_rls_policies.sql`: Thiết lập Row Level Security cho toàn bộ 15 bảng theo ma trận phân quyền.
  * `0012_seed_bars_rubric.sql`: Nạp sẵn dữ liệu mẫu Rubric BARS chuẩn 5 tiêu chí D1 - D5.
* **`tests/` (Kiểm thử CSDL bằng pgTAP)**:
  * `rls.test.sql`: Kiểm thử bảo vệ dữ liệu giữa các vai trò.
  * `kanban-triggers.test.sql`: Kiểm thử trigger bất biến của thẻ Kanban.
  * `bars-calc.test.sql`: Kiểm thử tính điểm và ẩn điểm thô trên máy chủ.
* `seed.sql`: Dữ liệu khởi tạo môi trường phát triển cục bộ.
* `config.toml`: Cấu hình Supabase CLI cục bộ.

---

### 2.7 Thư mục `tests/` (Bộ kiểm thử tự động)
* **`unit/` (Kiểm thử đơn vị Vitest)**:
  * [`calc.test.ts`](tests/unit/calc.test.ts): Kiểm thử tính điểm BARS, phát hiện độ lệch điểm.
  * [`lateness.test.ts`](tests/unit/lateness.test.ts): Kiểm thử tính toán trễ hạn chính xác từng phút/giờ.
  * [`validation.test.ts`](tests/unit/validation.test.ts): Kiểm thử schema Zod cho dữ liệu đầu vào.
  * [`csv.test.ts`](tests/unit/csv.test.ts): Kiểm thử đọc và xuất CSV tiếng Việt.
* **`concurrency/` (Kiểm thử tranh chấp giao dịch)**:
  * [`finalize-round.test.ts`](tests/concurrency/finalize-round.test.ts): Kiểm thử 2 tiến trình đồng thời chốt đợt đánh giá.
  * [`kanban-move.test.ts`](tests/concurrency/kanban-move.test.ts): Kiểm thử 2 học sinh cùng di chuyển một thẻ công việc.
* **`e2e/` (Kiểm thử người dùng đầu cuối Playwright)**:
  * [`admin-flow.spec.ts`](tests/e2e/admin-flow.spec.ts): Quy trình tạo lớp, tạo người dùng của Admin.
  * [`teacher-grading.spec.ts`](tests/e2e/teacher-grading.spec.ts): Quy trình chấm điểm và điều chỉnh điểm của Giáo viên.
  * [`student-kanban.spec.ts`](tests/e2e/student-kanban.spec.ts): Quy trình kéo thẻ Kanban của Học sinh.
  * [`peer-review.spec.ts`](tests/e2e/peer-review.spec.ts): Quy trình điền phiếu đánh giá đồng đẳng BARS.

---

### 2.8 Thư mục `docs/`, `scripts/`, `public/`
* **`docs/`**:
  * [`architecture.md`](docs/architecture.md): Tài liệu kiến trúc phân lớp, sơ đồ tuần tự và luồng dữ liệu.
  * [`erd.md`](docs/erd.md): Sơ đồ quan hệ thực thể cơ sở dữ liệu (Entity-Relationship Diagram).
  * [`rls-matrix.md`](docs/rls-matrix.md): Ma trận phân quyền chi tiết cho 15 bảng dữ liệu.
  * [`research-ethics.md`](docs/research-ethics.md): Tiêu chuẩn đạo đức nghiên cứu với học sinh chưa thành niên.
* **`scripts/`**:
  * [`import-students.ts`](scripts/import-students.ts): Script nhập danh sách học sinh tự động.
  * [`export-research-data.ts`](scripts/export-research-data.ts): Script trích xuất dữ liệu phục vụ nghiên cứu khoa học sư phạm.
  * [`backup-db.sh`](scripts/backup-db.sh): Script Bash sao lưu CSDL PostgreSQL định kỳ.
  * [`seed-yccd.ts`](scripts/seed-yccd.ts): Script nạp dữ liệu danh mục YCCĐ Tin học GDPT 2018.
* **`public/`**:
  * `images/`: Biểu tượng trạng thái thẻ todo, doing, done, late, logo PBL.
  * `templates/students-import.csv`: File CSV mẫu chuẩn để giáo viên tải về và nhập danh sách học sinh.

---

## 3. Yêu cầu hệ thống

* **Node.js**: Phiên bản `20.x` trở lên (Khuyên dùng bản LTS: Node.js 20 hoặc 22).
* **Trình quản lý gói**: `npm` (đi kèm Node.js).
* **Hệ điều hành**: Windows 10/11, macOS, hoặc Linux.
* **Tùy chọn (dành cho phát triển CSDL cục bộ)**:
  * Docker Desktop (khi cần chạy cụm Supabase local qua lệnh `supabase start`).

---

## 4. Cách cài đặt và sử dụng

### 4.1 Cài đặt phụ thuộc
Mở terminal tại thư mục dự án và chạy:
```bash
npm install
```

### 4.2 Cấu hình biến môi trường (khi kết nối Supabase thật)
Tạo tệp `.env.local` từ mẫu:
```bash
cp .env.example .env.local
```
Điền các giá trị từ Supabase Project Dashboard của bạn:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
STUDENT_EMAIL_DOMAIN=pbl.internal
CRON_SECRET=your-cron-secret
EXPORT_PSEUDONYM_SECRET=your-hmac-secret-min-32-chars
EXPORT_PSEUDONYM_KEY_VERSION=1
```

### 4.3 Khởi chạy ứng dụng

#### Lựa chọn A: Chạy bản sản phẩm đã tối ưu (Khuyên dùng - Rất nhanh & ổn định)
```bash
npm start
```

#### Lựa chọn B: Chạy chế độ phát triển (Development Mode)
```bash
npm run dev -- --webpack
```

Mở trình duyệt web và truy cập địa chỉ: **`http://localhost:3000`**

---

### 4.4 Hướng dẫn đăng nhập trải nghiệm 3 vai trò

Hệ thống cung cấp **2 cách đăng nhập cực kỳ tiện lợi**:

#### Cách 1: Bấm trực tiếp 1-chạm (Chế độ Demo Preview - Không cần gõ mật khẩu)
Tại trang `http://localhost:3000/login`, cuộn xuống mục **"⚡ Xem trước giao diện theo vai trò"**:
* 🛡️ Bấm nút **Quản trị viên (Admin)**: Chuyển hướng trực tiếp vào `/admin`.
* 👨‍🏫 Bấm nút **Giáo viên (Teacher)**: Chuyển hướng trực tiếp vào `/teacher`.
* 🎓 Bấm nút **Học sinh (Student)**: Chuyển hướng trực tiếp vào `/student`.

#### Cách 2: Nhập tài khoản và mật khẩu trực tiếp vào Form
Bạn có thể sử dụng các tài khoản mẫu sau (hoặc click vào gợi ý ngay trên form để tự điền):

| Vai trò | Tên đăng nhập | Mật khẩu mặc định | Phân hệ truy cập |
| :--- | :--- | :--- | :--- |
| **🛡️ Quản trị viên** | `admin` | `admin123` | Quản trị hệ thống, dữ liệu GDPT 2018 |
| **👨‍🏫 Giáo viên** | `gv.lan` | `123456` | Quản lý dự án PBL, nhóm, Kanban, chấm điểm |
| **🎓 Học sinh** | `hs.an01` | `123456` | Bảng Kanban kéo thả, phiếu đánh giá BARS |

> **Chuyển đổi vai trò linh hoạt**: Khi đang ở bất kỳ trang nào, ở góc trên bên phải thanh **Topbar** luôn có nút **"🔄 Đổi vai trò"** giúp bạn quay lại trang đăng nhập để chuyển sang vai trò khác bất cứ lúc nào.

---

### 4.5 Các lệnh kiểm tra chất lượng mã nguồn (Quality Assurance)

```bash
# 1. Kiểm tra lỗi cú pháp và quy tắc ranh giới kiến trúc
npm run lint

# 2. Kiểm tra toàn bộ kiểu dữ liệu TypeScript
npm run typecheck

# 3. Chạy toàn bộ kiểm thử đơn vị & tranh chấp giao dịch
npm test

# 4. Biên dịch gói sản xuất (Production Build)
npm run build
```

---

## 5. Tiến độ thực hiện dự án

### 5.1 Các công việc ĐÃ HOÀN THÀNH (100% Khung, Giao diện & Kết nối)

- [x] **Scaffold chuẩn 184 tệp**: Tạo đúng, đủ 100% cấu trúc thư mục và tệp theo tài liệu thiết kế mục 3.3 và mục 9. Không thừa, không thiếu tệp.
- [x] **Giao diện 3 phân hệ hoàn chỉnh (32 trang)**:
  - [x] **11 trang Admin**: Bảng điều khiển, người dùng, thêm người dùng, nhập CSV, chi tiết người dùng, lớp học, chi tiết lớp, danh mục YCCĐ Tin học GDPT 2018, mẫu Rubric BARS 5 mức độ, quản lý đồng thuận nghiên cứu, nhật ký kiểm toán.
  - [x] **14 trang Giáo viên**: Bảng điều khiển, lớp học, chi tiết lớp, nhập học sinh, danh sách dự án, tạo dự án mới, chi tiết dự án & checklist 5 điều kiện kích hoạt, kho nhiệm vụ & ma trận bao phủ YCCĐ, quản lý nhóm & khóa 1 chiều, quan sát Kanban & nhật ký sự kiện, biểu đồ tiến độ & đóng góp cá nhân, quản lý đợt đánh giá & ma trận $n \times (n - 1)$, bảng tổng hợp điểm, cảnh báo lệch điểm & hòa giải có lý do $\ge 10$ ký tự, xuất bảng điểm UTF-8 BOM.
  - [x] **7 trang Học sinh**: Bảng điều khiển (cảnh báo nhiệm vụ sắp hết hạn), hồ sơ & phiếu đồng thuận nghiên cứu, trang chủ dự án nhóm, bảng Kanban kéo thả 3 cột (chặn người ngoài nhóm, chỉ người nhận mới được kéo sang Doing/Done, tự lưu `completed_at`), danh sách đợt đánh giá kèm đếm ngược, phiếu đánh giá BARS ẩn điểm thô (D5 bắt buộc nhận xét), trang xem điểm tổng kết & biểu đồ Radar năng lực.
- [x] **Toàn bộ 14 Server Actions (`src/server/actions/*.ts`)**: Kết nối hoàn chỉnh giữa giao diện người dùng và cơ sở dữ liệu Supabase, xác thực schema bằng Zod, gọi các hàm lưu trữ RPC và xử lý lỗi chuẩn `ActionResult`.
- [x] **Cơ chế Demo Preview & Session Bridge**: Cho phép duyệt và trải nghiệm toàn bộ tính năng ở cả 3 vai trò mà không bị chặn chuyển hướng đăng nhập.
- [x] **Kiểm thử tự động lõi**:
  - [x] Thuật toán tính điểm trung bình BARS, độ lệch chuẩn và cảnh báo bất thường ([`calc.test.ts`](tests/unit/calc.test.ts) — 6/6 tests passed).
  - [x] Thuật toán tính toán trễ hạn chính xác theo thời gian thực ([`lateness.test.ts`](tests/unit/lateness.test.ts) — 7/7 tests passed).
  - [x] Kiểm thử tranh chấp chốt đợt đánh giá ([`finalize-round.test.ts`](tests/concurrency/finalize-round.test.ts) — 1/1 test passed).
- [x] **Chất lượng mã nguồn**:
  - `npm run lint`: **0 errors, 0 warnings**.
  - `npm run typecheck`: **0 errors** (`tsc --noEmit` hoàn hảo).
  - `npm test`: **14 passed**, 7 todo, **0 failed**.
  - `npm run build`: **Biên dịch thành công toàn bộ 32 dynamic & static routes**.
- [x] **Đồng bộ mã nguồn**: Đã khởi tạo Git và commit đầy đủ trên nhánh `main`.

---

### 5.2 Những công việc CẦN LÀM TIẾP để hoàn thiện toàn bộ dự án

Dưới đây là lộ trình các hạng mục kỹ thuật để đưa hệ thống vào thử nghiệm thực tế tại trường THPT:

1. **Hiện thực trọn vẹn các migration CSDL PostgreSQL (`supabase/migrations/*.sql`)**:
   * Viết chi tiết DDL SQL từ `0002` đến `0012` theo thiết kế mục 5 của tài liệu.
   * Hiện thực các hàm lưu trữ (RPC):
     * `open_round(p_project_id, p_title, p_deadline)`: Mở đợt đánh giá, tự động tạo ma trận phân công đánh giá chéo giữa các học sinh cùng nhóm.
     * `submit_review(p_assignment_id, p_scores, p_comments)`: Lưu phiếu đánh giá, kiểm tra ràng buộc nhận xét D5 $\ge 10$ ký tự, ngăn chặn sửa phiếu sau khi nộp.
     * `finalize_round(p_round_id)`: Đóng đợt đánh giá, khóa toàn bộ việc nộp bài bổ sung.
     * `compute_final_scores(p_project_id)`: Tính điểm trung bình BARS tự động cho từng học sinh.
     * `adjust_final_score(p_student_id, p_new_score, p_reason)`: Điều chỉnh điểm, ghi vết vào bảng lịch sử và tăng `result_version`.
     * `publish_results(p_project_id)` / `unpublish_results(p_project_id)`: Mở/khóa quyền xem điểm của học sinh.
   * Thiết lập đầy đủ Row-Level Security (RLS) theo ma trận phân quyền mục 6 của tài liệu.
   * Cài đặt các Trigger kiểm toán cho bảng Kanban và bảng đánh giá.

2. **Nạp dữ liệu mồi (Seed Data) chuẩn GDPT 2018**:
   * Hoàn thiện script [`scripts/seed-yccd.ts`](scripts/seed-yccd.ts) để nạp toàn bộ danh mục Yêu cầu cần đạt môn Tin học THPT cho 3 khối lớp 10, 11 và 12 (Chủ đề A đến Chủ đề G).
   * Tạo sẵn 1 dự án mẫu chuẩn (ví dụ: *Dự án thiết kế Website Giới thiệu Văn hóa Địa phương*), 2 lớp mẫu (11A1, 11A2), phân công nhiệm vụ và dữ liệu mẫu đầy đủ để phục vụ thử nghiệm giảng dạy.

3. **Tích hợp Supabase Realtime (Kênh thời gian thực)**:
   * Kích hoạt Realtime Replication trên bảng `task_events` và `tasks` để bảng Kanban của học sinh và màn hình quan sát của giáo viên tự động nhảy thẻ ngay lập tức khi có thành viên thao tác mà không cần tải lại trang.

4. **Hoàn thiện các bộ kiểm thử còn lại**:
   * Điền nội dung kiểm thử chi tiết cho [`tests/unit/validation.test.ts`](tests/unit/validation.test.ts) và [`tests/unit/csv.test.ts`](tests/unit/csv.test.ts).
   * Hoàn thiện kịch bản kiểm thử tranh chấp kéo thẻ đồng thời ([`tests/concurrency/kanban-move.test.ts`](tests/concurrency/kanban-move.test.ts)).
   * Chạy kịch bản kiểm thử E2E tự động bằng Playwright trên cả 3 trình duyệt Chromium, Firefox, WebKit.

5. **Triển khai Production & Đóng băng phiên bản nghiên cứu**:
   * Tạo 2 dự án Supabase trên đám mây: `pbl-dev` và `pbl-prod` (vùng Singapore).
   * Kết nối kho mã nguồn GitHub với Vercel Hobby.
   * Thiết lập sao lưu định kỳ bằng [`scripts/backup-db.sh`](scripts/backup-db.sh).
   * Thực hiện trích xuất dữ liệu nghiên cứu thử nghiệm qua [`scripts/export-research-data.ts`](scripts/export-research-data.ts) kiểm tra tính ẩn danh và toàn vẹn dữ liệu.
