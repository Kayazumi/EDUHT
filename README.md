# EDUHT

Ứng dụng hỗ trợ dạy học theo dự án (Project-Based Learning, PBL) trong môn Tin học THPT, do nhóm Hi (sinh viên ngành Sư phạm Tin học) phát triển.

## Vai trò

- **Admin:** quản lý tài khoản, lớp học, chương trình và cấu hình đánh giá.
- **Giáo viên:** tổ chức lớp và dự án, phân nhóm, giao việc, theo dõi tiến độ, đánh giá và công bố kết quả.
- **Học sinh:** xem dự án và nhiệm vụ, cập nhật bảng công việc, đánh giá đồng đẳng và xem kết quả đã công bố.

Ứng dụng dùng Supabase Auth và PostgreSQL. Schema được quản lý bằng các migration trong supabase/migrations/. Một số màn hình có dữ liệu xem trước/mẫu; hãy xác nhận trạng thái dữ liệu với nhóm trước khi dùng trong lớp học thật.

## Công nghệ và yêu cầu

- Node.js 20 trở lên, npm và Git.
- Next.js 16, React 19, TypeScript.
- Supabase hosted (Auth, PostgreSQL, RLS, RPC).
- Docker Desktop tùy chọn.

## Bắt đầu cho thành viên mới

### 1. Clone repository

Repository: [Kayazumi/EDUHT](https://github.com/Kayazumi/EDUHT). Nếu repo Private, trưởng nhóm cần thêm GitHub username của bạn vào repo.

```bash
git clone https://github.com/Kayazumi/EDUHT.git
cd EDUHT
```

> Nếu repository đang để Private, trưởng nhóm cần thêm GitHub username của bạn vào repository trước khi bạn clone.

### 2. Tạo file môi trường cục bộ

PowerShell:

```powershell
Copy-Item .env.example .env.local
```

macOS/Linux:

```bash
cp .env.example .env.local
```

Mỗi thành viên tự tạo .env.local; không commit file này. Lấy URL và publishable key tại Supabase Dashboard → Project Settings → API Keys. Secret/service-role key chỉ cấp riêng cho thành viên được phép chạy chức năng quản trị; không gửi vào chat công khai, issue hoặc source code.

Điền các biến trong .env.local:

| Biến | Giá trị cần cấu hình |
| --- | --- |
| NEXT_PUBLIC_SUPABASE_URL | URL Supabase project dùng chung. |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Publishable key (hoặc anon key cũ) của project. RLS vẫn phải bật đúng. |
| NEXT_PUBLIC_SITE_URL | http://localhost:3000 cho phát triển local. |
| SUPABASE_SERVICE_ROLE_KEY | Secret/service-role key; chỉ phía máy chủ và script quản trị. Giữ bí mật. |
| STUDENT_EMAIL_DOMAIN | Domain nội bộ phải khớp với tài khoản đã tạo, ví dụ hs.pbl.example. |
| CRON_SECRET | Bí mật tối thiểu 32 ký tự cho API cron. |
| EXPORT_PSEUDONYM_SECRET | Bí mật tối thiểu 32 ký tự để tạo mã giả khi xuất dữ liệu nghiên cứu. |
| EXPORT_PSEUDONYM_KEY_VERSION | Phiên bản khóa, thường là 1. |
| ADMIN_INITIAL_PASSWORD, TEACHER_INITIAL_PASSWORD, STUDENT_INITIAL_PASSWORD | Chỉ cần khi chạy script tạo tài khoản mẫu; không cần nếu tài khoản đã có. |
| ADMIN_SHARED_INITIAL_PASSWORD | Chỉ dùng một lần khi provisioning admin1–admin3; phải bằng mật khẩu admin hiện có. Không chia sẻ/commit giá trị này. |

Không tự ý đổi domain/mật khẩu hoặc chạy seed trên database dùng chung. Script seed có thể tạo hoặc cập nhật các tài khoản mẫu. Không chạy npm run db:reset trên database dùng chung vì lệnh này có thể xóa dữ liệu.

### 3. Cài dependencies và chạy

```bash
npm ci
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000). Dừng bằng Ctrl+C. Nếu cổng 3000 đang bận, dùng địa chỉ (chẳng hạn 3001) được in ra terminal. Trên Windows, nếu Turbopack lỗi, thử npm run dev -- --webpack.

### 4. Đăng nhập và Danh sách tài khoản

Hệ thống hỗ trợ đăng nhập bằng **Tên đăng nhập (Username)** hoặc **Email**. Tên đăng nhập không phân biệt chữ hoa/thường.

#### Bảng tài khoản dùng thử / kiểm thử:

| Vai trò | Tên đăng nhập (Username) | Mật khẩu mặc định | Ghi chú |
| :--- | :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin`, `admin1`, `admin2`, `admin3` | `Abc_1111` | Toàn quyền cấu hình hệ thống, quản lý người dùng và dự án |
| **Giáo viên (Teacher)** | `gv01` | `Abc_1111` | Quản lý lớp học, tạo tài khoản học sinh (thủ công / Excel), chấm điểm BARS, theo dõi Kanban |
| **Học sinh (Student)** | `spt01` đến `spt60` | `Abc_1111` | • **Lớp 10C4:** `spt01` – `spt30`<br>• **Lớp 10C5:** `spt31` – `spt60`<br>Thực hiện nhiệm vụ Kanban, đánh giá đồng đẳng (Peer review) |

> [!NOTE]
> - **Tài khoản học sinh mới:** Khi giáo viên tạo học sinh mới (tạo từng bạn hoặc nhập danh sách hàng loạt từ file Excel/CSV), mật khẩu khởi tạo mặc định cho học sinh luôn là `Abc_1111`.
> - **Khôi phục mật khẩu học sinh:** Nếu học sinh quên mật khẩu, giáo viên có thể vào mục **Lớp học & Học sinh** (`/teacher/classes/[classId]`) để **Đặt lại mật khẩu** cho từng học sinh hoặc **Đặt lại mật khẩu toàn bộ lớp** về mặc định `Abc_1111`.
> - Tài khoản có email placeholder kết thúc bằng `@example.invalid` không nhận email thật; admin hoặc giáo viên có thể hỗ trợ reset mật khẩu trực tiếp trong hệ thống mà không cần OTP email.

Tài khoản có email placeholder không nhận thư sẽ không thể dùng quên mật khẩu cho tới khi admin cập nhật email thật. Giáo viên tự đăng ký phải được admin kích hoạt sau khi xác minh email. Admin không có form tự đăng ký; admin khác phải nâng vai trò tài khoản hiện có.

## Email đăng ký và khôi phục mật khẩu

Ứng dụng gửi OTP qua Supabase Auth. Với Supabase hosted, cần cấu hình custom SMTP trong Authentication settings để gửi thư tới Gmail bên ngoài. Trong Email Templates, mẫu Confirm signup và Reset password phải hiển thị biến {{ .Token }} để người dùng nhập mã trong ứng dụng. Mẫu local nằm trong supabase/templates/; dashboard hosted cần được cấu hình riêng.

Các email placeholder kết thúc bằng example.invalid là địa chỉ không nhận thư, không phải Gmail thật. Hãy thay chúng bằng địa chỉ của chủ tài khoản trước khi cần xác minh hoặc khôi phục mật khẩu.

## Chạy bằng Docker

Docker Compose dùng Supabase đã cấu hình trong .env.local, không tự tạo database. Cài và khởi động Docker Desktop, rồi tại thư mục dự án:

```powershell
docker compose --env-file .env.local up --build
```

Mở [http://localhost:3000](http://localhost:3000). Mã nguồn được mount vào container để cập nhật khi sửa file. Dừng bằng Ctrl+C, sau đó chạy:

```powershell
docker compose down
```

Chạy production image cục bộ:

```powershell
docker compose --env-file .env.local -f compose.production.yaml up --build -d
docker compose --env-file .env.local -f compose.production.yaml logs -f
docker compose --env-file .env.local -f compose.production.yaml down
```

Các secret được truyền lúc chạy container. .dockerignore loại .env.local khỏi build context. Compose production không cài reverse proxy, backup database hoặc bộ lập lịch Vercel Cron.

## Database và migration

- Project Supabase dùng chung lưu tài khoản và dữ liệu của nhóm; mỗi thành viên cần cấu hình đúng URL và key.
- Migration được lưu trong supabase/migrations/.
- Chỉ chạy npm run db:push sau khi nhóm rà soát migration và xác nhận project đã link đúng.
- Không chạy npm run db:reset trên database dùng chung.
- Có thể chạy Supabase local riêng bằng Supabase CLI và Docker: npx supabase start. Database local này tách biệt với project dùng chung.

## Lệnh thường dùng

```bash
npm run dev          # Phát triển
npm run lint         # ESLint
npm run typecheck    # Kiểm tra TypeScript
npm test             # Unit tests
npm run build        # Build production
npm start            # Chạy production build
```

Chạy npm run build trước npm start.

## Làm việc nhóm bằng Git

Mỗi thành viên làm trên branch riêng và mở Pull Request để review. Tránh commit trực tiếp lên main, sửa chung một migration mà chưa trao đổi, hoặc đưa file môi trường/dữ liệu thật lên Git.

```bash
git switch main
git pull
git switch -c feature/ten-cong-viec
# sửa code
git add <cac-file-da-sua>
git commit -m "feat: mo ta thay doi"
git push -u origin feature/ten-cong-viec
```

Sau khi PR được merge, cập nhật nhánh chính bằng git switch main rồi git pull.

## Triển khai

Ứng dụng web đang được triển khai trên Vercel và dùng Supabase hosted. Cấu hình biến môi trường production trong Vercel Project Settings. Cron trong vercel.json gọi /api/cron/keepalive; nếu tự host bằng Docker, cron không tự chạy và cần scheduler bên ngoài nếu muốn duy trì tác vụ này.

## Cây thư mục và nhiệm vụ của từng file

Cây dưới đây được đối chiếu chính xác 100% với mã nguồn hiện có. Ghi chú sau mỗi file cho biết file giữ trách nhiệm gì; khi làm tính năng, hãy tìm đúng tầng trước khi sửa (trang giao diện → component/hook → server action → Supabase).

```text
EDUHT/
├── .github/workflows/              # GitHub Actions (CI)
├── docs/                            # Tài liệu kiến trúc, database và nghiên cứu
├── public/                          # Ảnh, icon, file tải xuống; phục vụ tĩnh
├── scripts/                         # Script chạy ngoài ứng dụng (seed, import, export)
├── src/                             # Mã nguồn Next.js
├── supabase/                        # Migration, seed và kiểm thử PostgreSQL
├── tests/                           # Kiểm thử ứng dụng (unit, concurrency, e2e)
├── .dockerignore                    # Loại file bí mật/cache khỏi Docker build context
├── .env.example                     # Mẫu tên biến môi trường, không có secret
├── AGENTS.md                        # Hướng dẫn cho Codex/AI khi sửa repo
├── DESIGN.md                        # Hệ thống thiết kế giao diện (Design System tokens)
├── PRODUCT.md                       # Bản mô tả sản phẩm và mục tiêu dự án
├── compose.yaml                     # Chạy môi trường development bằng Docker
├── compose.production.yaml           # Chạy image production bằng Docker
├── Dockerfile                       # Build image development/production theo nhiều stage
├── eslint.config.mjs                # Quy tắc ESLint
├── next.config.ts                   # Cấu hình Next.js, standalone output và headers
├── package.json                     # Scripts và dependencies của dự án
├── package-lock.json                # Khóa chính xác phiên bản npm dependencies
├── playwright.config.ts             # Cấu hình E2E Playwright
├── postcss.config.mjs               # Nạp Tailwind/PostCSS
├── README.md                        # Hướng dẫn và bản đồ mã nguồn này
├── tsconfig.json                    # Cấu hình TypeScript và alias
├── vercel.json                      # Cấu hình triển khai và lịch Vercel Cron
└── vitest.config.ts                 # Cấu hình Vitest
```

### Ứng dụng Next.js — src/app/

Tên thư mục đặt trong ngoặc như (admin) là route group của Next.js: dùng để tổ chức code/layout, không xuất hiện trong URL.

```text
src/app/
├── layout.tsx                       # HTML/layout gốc, CSS toàn cục, 3 font chữ (Lexend, Be Vietnam Pro, JetBrains Mono) và ThemeProvider
├── page.tsx                         # Trang gốc, điều hướng người dùng theo phiên/vai trò
├── loading.tsx                      # UI chờ ở cấp ứng dụng
├── error.tsx                        # Ranh giới lỗi chung của ứng dụng
├── not-found.tsx                    # Trang 404
├── forbidden/page.tsx               # Trang báo không đủ quyền (403)
├── (auth)/
│   ├── login/page.tsx               # Form đăng nhập (bằng Username hoặc Email) và xem trước dev
│   ├── register/page.tsx            # Đăng ký tài khoản mới và gửi mã xác thực
│   ├── forgot-password/page.tsx     # Khôi phục mật khẩu qua email OTP
│   └── change-password/page.tsx     # Đổi mật khẩu bắt buộc lần đầu / đổi mật khẩu cá nhân
├── (admin)/admin/
│   ├── layout.tsx                   # Khung và kiểm tra quyền admin
│   ├── page.tsx                     # Dashboard tổng quan admin (dữ liệu thật Supabase + biểu đồ Recharts)
│   ├── profile/page.tsx             # Hồ sơ Quản trị viên & Đổi mật khẩu (cập nhật họ tên, phân cấp quyền)
│   ├── users/page.tsx               # Quản lý tài khoản, đổi vai trò, khóa/mở và chuyển trang tạo giáo viên
│   ├── users/new/page.tsx           # Tạo tài khoản giáo viên mới (kết nối createTeacher Server Action)
│   ├── users/import/page.tsx        # Import danh sách học sinh từ file CSV
│   ├── users/[userId]/page.tsx      # Chi tiết/kích hoạt/đặt lại tài khoản người dùng
│   ├── classes/page.tsx             # Quản lý danh sách lớp học (2 lớp thật 10C4, 10C5 kết nối Supabase)
│   ├── classes/[classId]/page.tsx   # Chi tiết lớp và danh sách thành viên
│   ├── curriculum/page.tsx          # Quản lý yêu cầu cần đạt Tin học
│   ├── bars-templates/page.tsx      # Quản lý tiêu chí và mẫu rubric BARS
│   ├── research/page.tsx            # Theo dõi đồng thuận nghiên cứu
│   └── audit-log/page.tsx           # Nhật ký hoạt động cần kiểm toán
├── (teacher)/teacher/
│   ├── layout.tsx                   # Khung và kiểm tra quyền giáo viên
│   ├── page.tsx                     # Dashboard giáo viên (việc cần làm ưu tiên và dự án đang chạy)
│   ├── profile/page.tsx             # Hồ sơ Giáo viên & Đổi mật khẩu (cập nhật họ tên, tổ bộ môn, chuyên môn)
│   ├── classes/page.tsx             # Quản lý danh sách lớp phụ trách (10C4, 10C5)
│   ├── classes/[classId]/page.tsx   # Quản lý học sinh lớp phụ trách (+ Thêm 1 HS, đặt lại mật khẩu)
│   ├── classes/[classId]/students/import/page.tsx # Nhập học sinh đồng loạt từ file Excel (.xlsx, .xls) hoặc CSV
│   └── projects/
│       ├── page.tsx                 # Danh sách dự án PBL
│       ├── new/page.tsx             # Khởi tạo dự án mới
│       └── [projectId]/
│           ├── page.tsx             # Tổng quan và trạng thái dự án
│           ├── tasks/page.tsx       # Mẫu nhiệm vụ và yêu cầu cần đạt
│           ├── groups/page.tsx      # Tạo/quản lý nhóm học sinh
│           ├── groups/[groupId]/page.tsx # Chi tiết nhóm
│           ├── dashboard/page.tsx   # Biểu đồ tiến độ/đóng góp
│           ├── evaluation/page.tsx  # Danh sách đợt đánh giá BARS
│           ├── evaluation/[roundId]/page.tsx # Tiến độ một đợt đánh giá
│           ├── grading/page.tsx     # Tổng hợp, điều chỉnh và công bố điểm
│           └── export/page.tsx      # Xuất dữ liệu/bảng điểm
├── (student)/student/
│   ├── layout.tsx                   # Khung và kiểm tra quyền học sinh
│   ├── page.tsx                     # Dashboard học sinh (dự án tham gia và nhiệm vụ cá nhân)
│   ├── profile/page.tsx             # Hồ sơ Học sinh & Đổi mật khẩu (cập nhật họ tên, xem lớp học, đồng thuận nghiên cứu)
│   └── projects/[projectId]/
│       ├── page.tsx                 # Tổng quan dự án/nhóm của học sinh
│       ├── board/page.tsx           # Bảng công việc Kanban nhóm
│       ├── review/page.tsx          # Các đợt đánh giá đồng đẳng (minh bạch quyền riêng tư)
│       ├── review/[rateeId]/page.tsx # Đánh giá một thành viên (bước xem lại trước khi nộp)
│       └── results/page.tsx         # Kết quả điểm đã công bố
└── api/
    ├── cron/keepalive/route.ts      # Endpoint bảo vệ bằng CRON_SECRET duy trì Supabase
    └── export/[projectId]/route.ts  # API xuất dữ liệu nghiên cứu ẩn danh HMAC
```

Ngoài App Router, `src/proxy.ts` xử lý request/phiên ở ranh giới trước khi trang được render.

### Giao diện và hành vi dùng lại — src/components/, src/hooks/

- **components/layout/**: `app-shell.tsx` dựng khung trang responsive; `sidebar.tsx` thanh bên hỗ trợ thu phóng co giãn (w-16 / w-64); `role-nav.tsx` hiển thị menu theo vai trò (đã bỏ Hồ sơ & Mật khẩu khỏi thanh bên theo chuẩn giao diện mới); `topbar.tsx` thanh trên cùng tích hợp nút chuyển chế độ Sáng/Tối và click Avatar/Tên tài khoản để vào xem Hồ sơ/Đổi mật khẩu cho cả 3 vai trò (Admin, Giáo viên, Học sinh).
- **components/theme/**: `theme-provider.tsx` cung cấp context chuyển đổi chế độ Sáng / Tối (Dark / Light Mode) với nền trắng sáng (`#ffffff` / văn bản tối `#0f172a`) và chế độ tối (`#090d16` / văn bản sáng `#f8fafc`), lưu trạng thái vào `localStorage`; `theme-toggle.tsx` nút bật/tắt chuyển đổi giao diện dùng chung trên Topbar và các trang đăng nhập/xác thực.
- **components/ui/**: `button.tsx` nút; `input.tsx` ô nhập; `select.tsx` danh sách chọn; `badge.tsx` nhãn trạng thái; `dialog.tsx` hộp thoại; `table.tsx` bảng; `tabs.tsx` tab; `toast.tsx` thông báo nổi; `skeleton.tsx` placeholder tải dữ liệu; `portal-data-state.tsx` hiển thị trạng thái tải/lỗi/rỗng đồng nhất của portal.
- **components/forms/**: `user-form.tsx` và `project-form.tsx` thu thập dữ liệu tài khoản/dự án; `csv-upload.tsx` chọn và xem trước CSV; `due-date-picker.tsx` chọn hạn chót.
- **components/kanban/**: `board.tsx` là vùng bảng; `column.tsx` là cột trạng thái; `task-card.tsx` là thẻ nhiệm vụ; `task-dialog.tsx` hiển thị/chỉnh sửa chi tiết; `assignee-picker.tsx` chọn người nhận.
- **components/peer-review/**: `review-form.tsx` nhập phiếu đánh giá; `bars-criterion-field.tsx` chọn mức BARS; `review-progress.tsx` tiến độ nộp; `round-status-badge.tsx` trạng thái đợt; `results-panel.tsx` trình bày kết quả.
- **components/dashboard/**: `progress-chart.tsx` biểu đồ; `group-progress-card.tsx` tiến độ nhóm; `student-progress-table.tsx` tiến độ từng học sinh; `late-alert-list.tsx` cảnh báo trễ; `metric-compare.tsx` so sánh chỉ số.
- **hooks/**: `use-current-user.ts` lấy người dùng hiện tại; `use-portal-data.ts` tải dữ liệu portal; `use-countdown.ts` đếm ngược hạn; `use-board-realtime.ts` quản lý state bảng việc thời gian thực.

### Xử lý phía máy chủ — src/server/

- **actions/auth.ts**: đăng nhập (hỗ trợ Username/Email), đăng xuất, đổi mật khẩu `changePassword`.
- **actions/portal-data.ts**: tải dữ liệu cho các màn hình theo vai trò (kết nối Supabase thật, tự động liên kết học sinh vào dự án của lớp).
- **actions/users.ts**: tạo giáo viên `createTeacher`, tạo học sinh `createStudent`, nhập danh sách học sinh `importStudents`, đổi vai trò `setRole`, kích hoạt/khóa `setActive`, đặt lại mật khẩu từng học sinh `resetStudentPassword` và đặt lại mật khẩu cả lớp `resetClassStudentsPassword`.
- **actions/classes.ts**: tạo lớp `createClass`, phân công giáo viên `assignTeacher`, ghi danh `enrollStudents`, xóa học sinh `removeStudent` và lưu trữ lớp `archiveClass`.
- **actions/projects.ts**: tạo/sửa/kích hoạt/đóng/xóa dự án.
- **actions/groups.ts**: tạo nhóm, thêm/xóa thành viên và khóa phân nhóm.
- **actions/task-templates.ts**: quản lý mẫu nhiệm vụ và liên kết yêu cầu cần đạt.
- **actions/tasks.ts**: tạo/sửa/giao việc, di chuyển trạng thái, đặt hạn và lưu trữ nhiệm vụ.
- **actions/bars.ts**: tạo/sửa/xóa/sắp xếp tiêu chí BARS.
- **actions/rounds.ts**: tạo/mở/đóng/gia hạn đợt đánh giá.
- **actions/reviews.ts**: lưu nháp và nộp đánh giá đồng đẳng.
- **actions/grading.ts**: nhập điểm nhóm, tính điểm cuối, điều chỉnh và công bố/thu hồi kết quả.
- **actions/consents.ts**: ghi nhận/thu hồi đồng thuận.
- **actions/curriculum.ts**: tạo/sửa/xóa yêu cầu cần đạt.
- **actions/export.ts**: xử lý xuất dữ liệu từ phía máy chủ.
- **auth/**: `session.ts` đọc phiên và hồ sơ; `guards.ts` bảo vệ vai trò; `username.ts` chuẩn hóa username và email nội bộ.
- **supabase/**: `server.ts` tạo client Supabase theo request/cookie; `proxy-session.ts` đồng bộ phiên trong Proxy; `admin.ts` tạo client quyền cao chỉ dùng ở server.
- **env.ts**: kiểm tra biến môi trường bí mật phía server.
- **csv/**: `parse-students.ts` phân tích file Excel (.xlsx, .xls) và CSV với thư viện `xlsx`; `to-csv.ts` tạo file CSV tương thích Excel.

### Kiểu dữ liệu, quy tắc và tiện ích — src/shared/, src/styles/

- **config/**: `roles.ts` định nghĩa vai trò và trang mặc định; `routes.ts` tập trung toàn bộ URL; `constants.ts` chứa giới hạn/ngưỡng nghiệp vụ; `defaults.ts` chứa hằng số mặc định hệ thống (`DEFAULT_STUDENT_PASSWORD = "Abc_1111"`); `public-env.ts` đọc biến public.
- **types/**: `domain.ts` chứa kiểu nghiệp vụ; `database.types.ts` chứa kiểu schema Supabase sinh tự động.
- **validation/**: `auth.ts`, `user.ts`, `project.ts`, `task.ts`, `bars.ts`, `review.ts`, `grading.ts`, `consent.ts` định nghĩa schema Zod kiểm tra đầu vào.
- **scoring/calc.ts**: tính điểm BARS/điểm tổng hợp; `scoring/test-vectors.json` chứa bộ dữ liệu mẫu cho thuật toán.
- **metrics/**: `lateness.ts` xác định nhiệm vụ trễ; `progress.ts` tính chỉ số tiến độ.
- **supabase/browser.ts**: tạo client Supabase dùng trong trình duyệt với publishable/anon key và RLS.
- **utils/**: `errors.ts` chuẩn hóa lỗi/ActionResult; `format.ts` định dạng ngày giờ và điểm.
- **styles/**: `globals.css` cấu hình 3 font chữ chuyên biệt, quy tắc chống rớt chữ đơn dòng (`text-wrap: balance` & `text-wrap: pretty`), token màu và lớp phủ giao diện Tối (Dark Mode); `tokens.css` chứa biến CSS; `print.css` định dạng bản in.

### Database — supabase/

- **config.toml**: cấu hình Supabase local (API, PostgreSQL, Auth).
- **migrations/**:
  - `0001_extensions_enums.sql` bật extension và kiểu enum nền.
  - `0002_profiles_classes.sql` tạo hồ sơ, lớp, quan hệ học sinh-lớp và trigger đồng bộ user Auth.
  - `0003_curriculum_projects.sql` tạo yêu cầu cần đạt, dự án và mẫu nhiệm vụ.
  - `0004_groups_tasks_logs.sql` tạo nhóm, thành viên, nhiệm vụ, sự kiện và tin nhắn nhóm.
  - `0005_bars_peer_review.sql` tạo tiêu chí/mức BARS, đợt đánh giá và dữ liệu đánh giá chéo.
  - `0006_scores_consents_audit.sql` tạo điểm, đồng thuận, audit và sự kiện liên quan.
  - `0007_functions_triggers.sql` tạo hàm nghiệp vụ, trigger thời gian cập nhật, nhật ký và ràng buộc bất biến.
  - `0008_rls_policies.sql` bật RLS và định nghĩa quyền theo vai trò.
  - `0009_views_rpc.sql` tạo view/RPC cho các luồng dự án, đánh giá, chấm điểm và xuất dữ liệu.
  - `0010_profile_codes.sql` bổ sung mã học sinh và nhân sự.
  - `0011_service_role_profile_admin.sql` điều chỉnh cập nhật hồ sơ cho thao tác quản trị.
  - `0012_auth_registration_role_management.sql` quản lý phân quyền và quy trình phê duyệt tài khoản tự đăng ký.
- **tests/**: `rls_students.test.sql` và `rls_teachers.test.sql` kiểm tra chính sách truy cập; `scoring.test.sql` kiểm tra điểm; `immutability.test.sql` kiểm tra dữ liệu bất biến.

### Script, tài liệu, tài nguyên và kiểm thử

- **scripts/**:
  - `scripts/seed-2-classes-60-students.ts`: đồng bộ 2 lớp học (10C4, 10C5) và khởi tạo toàn bộ 60 học sinh (`spt01`–`spt60`) cùng các dự án, nhóm và nhiệm vụ tương ứng trong cơ sở dữ liệu. Chạy qua lệnh `npm run db:seed-2-classes`.
  - `scripts/seed-ppt-project.ts`: tạo tài khoản và lớp/dự án PPT mẫu; chạy qua `npm run db:seed-ppt-demo`.
  - `scripts/provision-auth-accounts.ts`: cấp quyền tài khoản ban đầu; chạy qua `npm run db:provision-auth`.
  - `scripts/import-students.ts`: nhập tài khoản học sinh từ file CSV; chạy qua `npm run import:students`.
  - `scripts/export-research-data.ts`: xuất dữ liệu phục vụ nghiên cứu; chạy qua `npm run export:research`.
  - `scripts/backup-db.sh`: sao lưu PostgreSQL qua Bash và công cụ pg_dump.
- **docs/**: `architecture.md` mô tả kiến trúc; `erd.md` sơ đồ dữ liệu; `rls-matrix.md` ma trận quyền; `research-ethics.md` nguyên tắc dữ liệu nghiên cứu.
- **public/**: `favicon.ico` là favicon; `images/branding/logo.svg` và `logo-dark.svg` là logo sáng/tối; `images/icons/status-*.svg` là icon trạng thái Kanban; `templates/students-import.csv` là mẫu CSV nhập học sinh.
- **tests/**: `unit/calc.test.ts` kiểm thử tính điểm; `unit/csv.test.ts` kiểm thử đọc CSV; `unit/lateness.test.ts` kiểm thử hạn/trễ; `unit/validation.test.ts` kiểm thử schema đầu vào; `concurrency/finalize-round.test.ts` kiểm tra tranh chấp đợt đánh giá; `e2e/` kịch bản kiểm thử luồng người dùng Playwright.
