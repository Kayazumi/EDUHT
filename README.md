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

Không tự ý đổi domain/mật khẩu hoặc chạy seed trên database dùng chung. Script seed có thể tạo hoặc cập nhật các tài khoản mẫu. Không chạy npm run db:reset trên database dùng chung vì lệnh này có thể xóa dữ liệu.

### 3. Cài dependencies và chạy

```bash
npm ci
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000). Dừng bằng Ctrl+C. Nếu cổng 3000 đang bận, dùng địa chỉ (chẳng hạn 3001) được in ra terminal. Trên Windows, nếu Turbopack lỗi, thử npm run dev -- --webpack.

### 4. Đăng nhập

Database mẫu của nhóm có Admin, giáo viên mã GV01 và học sinh SPT01–SPT30. Username đăng nhập tương ứng là admin, gv01, spt01–spt30. Nhận mật khẩu hiện hành từ trưởng nhóm; tài khoản có thể bắt buộc đổi mật khẩu lần đầu.

Các nút xem trước vai trò chỉ dùng trong môi trường development, không phải tài khoản Supabase và không dùng để xác minh quyền truy cập production.

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

+## Cây thư mục và nhiệm vụ của từng file

Cây dưới đây được đối chiếu với mã nguồn hiện có. Ghi chú sau mỗi file cho biết file giữ trách nhiệm gì; khi làm tính năng, hãy tìm đúng tầng trước khi sửa (trang giao diện → component/hook → server action → Supabase).

```text
EDUHT/
├── .github/workflows/              # GitHub Actions (CI)
├── docs/                            # Tài liệu kiến trúc, database và nghiên cứu
├── public/                          # Ảnh, icon, file tải xuống; phục vụ tĩnh
├── scripts/                         # Script chạy ngoài ứng dụng
├── src/                             # Mã nguồn Next.js
├── supabase/                        # Migration, seed và kiểm thử PostgreSQL
├── tests/                           # Kiểm thử ứng dụng
├── .dockerignore                    # Loại file bí mật/cache khỏi Docker build context
├── .env.example                     # Mẫu tên biến môi trường, không có secret
├── AGENTS.md                        # Hướng dẫn cho Codex/AI khi sửa repo
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
├── layout.tsx                       # HTML/layout gốc, CSS toàn cục và metadata
├── page.tsx                         # Trang gốc, điều hướng người dùng theo phiên/vai trò
├── loading.tsx                      # UI chờ ở cấp ứng dụng
├── error.tsx                        # Ranh giới lỗi chung của ứng dụng
├── not-found.tsx                    # Trang 404
├── forbidden/page.tsx               # Trang báo không đủ quyền (403)
├── (auth)/
│   ├── login/page.tsx               # Form đăng nhập và nút xem trước dev
│   └── change-password/page.tsx     # Đổi mật khẩu bắt buộc lần đầu
├── (admin)/admin/
│   ├── layout.tsx                   # Khung và kiểm tra quyền admin
│   ├── page.tsx                     # Dashboard admin
│   ├── users/page.tsx               # Danh sách tài khoản
│   ├── users/new/page.tsx           # Tạo tài khoản
│   ├── users/import/page.tsx        # Import tài khoản từ CSV
│   ├── users/[userId]/page.tsx      # Chi tiết/kích hoạt/đặt lại tài khoản
│   ├── classes/page.tsx             # Danh sách lớp
│   ├── classes/[classId]/page.tsx   # Chi tiết lớp và thành viên
│   ├── curriculum/page.tsx          # Quản lý yêu cầu cần đạt Tin học
│   ├── bars-templates/page.tsx      # Quản lý tiêu chí và mẫu rubric BARS
│   ├── research/page.tsx            # Theo dõi đồng thuận nghiên cứu
│   └── audit-log/page.tsx           # Nhật ký hoạt động cần kiểm toán
├── (teacher)/teacher/
│   ├── layout.tsx                   # Khung và kiểm tra quyền giáo viên
│   ├── page.tsx                     # Dashboard giáo viên
│   ├── classes/[classId]/page.tsx   # Học sinh trong lớp phụ trách
│   ├── classes/[classId]/students/import/page.tsx # Import học sinh vào lớp
│   └── projects/
│       ├── page.tsx                 # Danh sách dự án
│       ├── new/page.tsx             # Tạo dự án
│       └── [projectId]/
│           ├── page.tsx             # Tổng quan và trạng thái dự án
│           ├── tasks/page.tsx       # Mẫu nhiệm vụ và yêu cầu cần đạt
│           ├── groups/page.tsx      # Tạo/quản lý nhóm
│           ├── groups/[groupId]/page.tsx # Chi tiết nhóm
│           ├── dashboard/page.tsx   # Biểu đồ tiến độ/đóng góp
│           ├── evaluation/page.tsx  # Danh sách đợt đánh giá
│           ├── evaluation/[roundId]/page.tsx # Tiến độ một đợt đánh giá
│           ├── grading/page.tsx     # Tổng hợp, điều chỉnh và công bố điểm
│           └── export/page.tsx      # Xuất dữ liệu/bảng điểm
├── (student)/student/
│   ├── layout.tsx                   # Khung và kiểm tra quyền học sinh
│   ├── page.tsx                     # Dashboard học sinh
│   ├── profile/page.tsx             # Hồ sơ và đồng thuận nghiên cứu
│   └── projects/[projectId]/
│       ├── page.tsx                 # Tổng quan dự án/nhóm
│       ├── board/page.tsx           # Bảng công việc Kanban
│       ├── review/page.tsx          # Các đợt và phiếu cần đánh giá
│       ├── review/[rateeId]/page.tsx # Đánh giá một thành viên
│       └── results/page.tsx         # Kết quả đã công bố
└── api/
    ├── cron/keepalive/route.ts      # Endpoint bảo vệ bằng CRON_SECRET
    └── export/[projectId]/route.ts  # API xuất dữ liệu nghiên cứu
```

Ngoài App Router, src/proxy.ts xử lý request/phiên ở ranh giới trước khi trang được render.

### Giao diện và hành vi dùng lại — src/components/, src/hooks/

- components/layout/: app-shell.tsx dựng khung trang; sidebar.tsx và role-nav.tsx hiển thị điều hướng theo vai trò; topbar.tsx hiển thị thanh trên cùng và thao tác tài khoản.
- components/ui/: button.tsx nút; input.tsx ô nhập; select.tsx danh sách chọn; badge.tsx nhãn trạng thái; dialog.tsx hộp thoại; table.tsx bảng; tabs.tsx tab; toast.tsx thông báo nổi; skeleton.tsx placeholder tải dữ liệu. Đây là thành phần dùng lại, nên sửa có thể ảnh hưởng nhiều trang.
- components/forms/: user-form.tsx và project-form.tsx thu thập dữ liệu tài khoản/dự án; csv-upload.tsx chọn và xem trước CSV; due-date-picker.tsx chọn hạn chót.
- components/kanban/: board.tsx là vùng bảng; column.tsx là cột trạng thái; task-card.tsx là thẻ nhiệm vụ; task-dialog.tsx hiển thị/chỉnh sửa chi tiết; assignee-picker.tsx chọn người nhận.
- components/peer-review/: review-form.tsx nhập phiếu; bars-criterion-field.tsx chọn mức BARS; review-progress.tsx tiến độ nộp; round-status-badge.tsx trạng thái đợt; results-panel.tsx trình bày kết quả.
- components/dashboard/: progress-chart.tsx biểu đồ; group-progress-card.tsx tiến độ nhóm; student-progress-table.tsx tiến độ từng học sinh; late-alert-list.tsx cảnh báo trễ; metric-compare.tsx so sánh chỉ số.
- hooks/use-current-user.ts lấy người dùng hiện tại; use-portal-data.ts tải dữ liệu portal; use-countdown.ts đếm ngược hạn; use-board-realtime.ts hiện chỉ giữ state cục bộ, chưa đăng ký Supabase Realtime.

### Xử lý phía máy chủ — src/server/

- actions/auth.ts: đăng nhập, đăng xuất, đổi mật khẩu.
- actions/portal-data.ts: tải dữ liệu cho các màn hình theo vai trò.
- actions/users.ts: tạo/import/kích hoạt người dùng, đổi vai trò và đặt lại mật khẩu.
- actions/classes.ts: tạo lớp, phân công giáo viên, ghi danh/xóa học sinh và lưu trữ lớp.
- actions/projects.ts: tạo/sửa/kích hoạt/đóng/xóa dự án.
- actions/groups.ts: tạo nhóm, thêm/xóa thành viên và khóa phân nhóm.
- actions/task-templates.ts: quản lý mẫu nhiệm vụ và liên kết yêu cầu cần đạt.
- actions/tasks.ts: tạo/sửa/giao việc, di chuyển trạng thái, đặt hạn và lưu trữ nhiệm vụ.
- actions/bars.ts: tạo/sửa/xóa/sắp xếp tiêu chí BARS.
- actions/rounds.ts: tạo/mở/đóng/gia hạn đợt đánh giá.
- actions/reviews.ts: lưu nháp và nộp đánh giá đồng đẳng.
- actions/grading.ts: nhập điểm nhóm, tính điểm cuối, điều chỉnh và công bố/thu hồi kết quả.
- actions/consents.ts: ghi nhận/thu hồi đồng thuận.
- actions/curriculum.ts: tạo/sửa/xóa yêu cầu cần đạt.
- actions/export.ts: xử lý xuất dữ liệu từ phía máy chủ.
- auth/session.ts đọc phiên và hồ sơ hiện tại; auth/guards.ts bảo vệ vai trò; auth/username.ts chuẩn hóa username và email nội bộ.
- supabase/server.ts tạo client Supabase theo request/cookie; supabase/proxy-session.ts đồng bộ phiên trong Proxy; supabase/admin.ts tạo client quyền cao chỉ dùng ở server.
- env.ts kiểm tra biến môi trường bí mật phía server.
- csv/parse-students.ts đọc/kiểm tra CSV học sinh; csv/to-csv.ts tạo CSV tương thích Excel.

Server Actions là điểm nối giữa UI và database. Khi thêm thao tác ghi dữ liệu, kiểm tra quyền ở server, validate đầu vào bằng schema Zod và dựa vào RLS/RPC; không gọi service-role key từ client.

### Kiểu dữ liệu, quy tắc và tiện ích — src/shared/, src/styles/

- config/roles.ts định nghĩa vai trò và trang mặc định; routes.ts tập trung URL; constants.ts chứa giới hạn/ngưỡng nghiệp vụ; public-env.ts đọc biến public.
- types/domain.ts chứa kiểu nghiệp vụ; types/database.types.ts chứa kiểu schema Supabase.
- validation/: auth.ts, user.ts, project.ts, task.ts, bars.ts, review.ts, grading.ts, consent.ts định nghĩa schema kiểm tra đầu vào tương ứng.
- scoring/calc.ts tính điểm BARS/điểm tổng hợp; scoring/test-vectors.json chứa bộ dữ liệu mẫu cho thuật toán.
- metrics/lateness.ts xác định nhiệm vụ trễ; metrics/progress.ts tính chỉ số tiến độ.
- supabase/browser.ts tạo client Supabase dùng trong trình duyệt với publishable/anon key và RLS.
- utils/errors.ts chuẩn hóa lỗi/ActionResult; utils/format.ts định dạng ngày giờ và điểm.
- styles/globals.css nạp CSS ứng dụng; tokens.css chứa biến thiết kế; print.css định dạng bản in.

### Database — supabase/

- config.toml cấu hình Supabase local (API, PostgreSQL, Auth).
- seed.sql hiện là placeholder/TODO, chưa có dữ liệu seed dùng được; lớp 10C4 và dự án PPT mẫu được tạo bởi scripts/seed-ppt-project.ts.
- migrations/0001_extensions_enums.sql bật extension và kiểu enum nền.
- migrations/0002_profiles_classes.sql tạo hồ sơ, lớp, quan hệ học sinh-lớp và đồng bộ user Auth.
- migrations/0003_curriculum_projects.sql tạo yêu cầu cần đạt, dự án và mẫu nhiệm vụ.
- migrations/0004_groups_tasks_logs.sql tạo nhóm, thành viên, nhiệm vụ, sự kiện và tin nhắn nhóm.
- migrations/0005_bars_peer_review.sql tạo tiêu chí/mức BARS, đợt đánh giá và dữ liệu đánh giá chéo.
- migrations/0006_scores_consents_audit.sql tạo điểm, đồng thuận, audit và sự kiện liên quan.
- migrations/0007_functions_triggers.sql tạo hàm nghiệp vụ, trigger thời gian cập nhật, nhật ký và ràng buộc bất biến.
- migrations/0008_rls_policies.sql bật RLS và định nghĩa quyền theo vai trò.
- migrations/0009_views_rpc.sql tạo view/RPC cho các luồng dự án, đánh giá, chấm điểm và xuất dữ liệu.
- migrations/0010_profile_codes.sql bổ sung/kiểm tra mã học sinh và nhân sự.
- migrations/0011_service_role_profile_admin.sql điều chỉnh kiểm tra cập nhật hồ sơ cho thao tác quản trị bằng service role.
- tests/rls_students.test.sql và rls_teachers.test.sql kiểm tra chính sách truy cập; scoring.test.sql kiểm tra điểm; immutability.test.sql kiểm tra dữ liệu bất biến.

### Script, tài liệu, tài nguyên và kiểm thử

- scripts/seed-ppt-project.ts tạo tài khoản và lớp/dự án PPT mẫu; cần Supabase URL, service-role key và mật khẩu ban đầu trong môi trường. Không chạy trên project dùng chung nếu chưa được trưởng nhóm duyệt.
- scripts/import-students.ts nhập tài khoản học sinh từ dữ liệu CSV.
- scripts/export-research-data.ts xuất dữ liệu phục vụ nghiên cứu.
- scripts/backup-db.sh hỗ trợ sao lưu PostgreSQL qua môi trường có Bash và công cụ PostgreSQL.
- docs/architecture.md mô tả kiến trúc; erd.md sơ đồ dữ liệu; rls-matrix.md ma trận quyền; research-ethics.md nguyên tắc dữ liệu nghiên cứu.
- public/favicon.ico là favicon; images/branding/logo.svg và logo-dark.svg là logo sáng/tối, og-cover.png là ảnh chia sẻ; images/icons/status-*.svg là icon trạng thái Kanban; images/illustrations/empty-board.svg, empty-list.svg, error-404.svg, login-hero.svg minh họa bảng/danh sách trống, lỗi 404 và trang đăng nhập.
- public/templates/students-import.csv là mẫu CSV nhập học sinh.
- tests/unit/calc.test.ts kiểm thử tính điểm; csv.test.ts kiểm thử đọc CSV; lateness.test.ts kiểm thử hạn/trễ; validation.test.ts kiểm thử schema đầu vào.
- tests/concurrency/finalize-round.test.ts kiểm tra tranh chấp khi đóng đợt đánh giá.
- tests/e2e/access-control.spec.ts kiểm soát truy cập; kanban.spec.ts bảng việc; peer-review.spec.ts đánh giá đồng đẳng; publish-results.spec.ts công bố kết quả.
- eslint.config.mjs quy tắc lint; playwright.config.ts cấu hình trình duyệt/E2E; vitest.config.ts cấu hình unit test; tsconfig.json cấu hình TypeScript; postcss.config.mjs cấu hình CSS.
- .github/workflows/ci.yml chạy các bước kiểm tra tự động khi có thay đổi trên GitHub.
