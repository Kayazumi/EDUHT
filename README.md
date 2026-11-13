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

## Cấu trúc thư mục

```text
src/                  # Next.js pages, components, server actions và API
  app/                # Trang theo vai trò và API routes
  components/         # UI dùng lại
  server/             # Xác thực, server actions, tích hợp Supabase
  shared/              # Types, config, validation, utils
supabase/migrations/  # Migration schema PostgreSQL
scripts/              # Script seed/import/export
tests/                # Unit, concurrency và E2E tests
docs/                 # Tài liệu kỹ thuật
```
