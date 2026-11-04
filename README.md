<!-- [DOC] Tài liệu hướng dẫn dự án · tài liệu mục 10 -->
# PBL Platform — Nền tảng quản lý tiến trình và đánh giá đóng góp trong dạy học dự án Tin học THPT

Mã dự án: `pbl-platform`. Trạng thái: **khung dự án (scaffold)** theo tài liệu thiết kế v1; chưa hiện thực nghiệp vụ.

## Giới thiệu

Ứng dụng web giúp giáo viên Tin học theo dõi tiến trình làm dự án của từng nhóm và ghi nhận chỉ báo tiến trình của từng học sinh, kết hợp đánh giá đồng đẳng để hỗ trợ quyết định điểm cá nhân. Có ba vai trò: **admin**, **giáo viên**, **học sinh**.

Ba phân hệ lõi:

1. **Bảng Kanban nhóm** (học sinh): nhận việc, đặt hạn, kéo thẻ; mỗi thao tác tự ghi nhật ký bốn tham số (mã công việc, người phụ trách, hạn chót, thời điểm hoàn thành thực tế).
2. **Bảng điều khiển tiến độ** (giáo viên): tỷ lệ hoàn thành, tỷ lệ trễ hạn của nhóm và cá nhân, cảnh báo.
3. **Đánh giá đồng đẳng định danh theo BARS**: học sinh chọn mô tả hành vi, hệ thống quy đổi sang điểm ở máy chủ; điểm ẩn đến khi giáo viên công bố.

Phân hệ nền: tài khoản, lớp, danh mục Yêu cầu cần đạt, dự án, nhóm, kho nhiệm vụ, đồng ý nghiên cứu, xuất dữ liệu.

## Công nghệ

TypeScript 5.7.3 · Next.js 16.4.5 (App Router) · React 19.3.0 · Tailwind CSS 4.0.9 · Supabase (PostgreSQL, Auth, Realtime) · Zod · dnd-kit · Recharts · Vitest · Playwright. Triển khai: Vercel (Hobby) và Supabase (gói miễn phí); mã trên GitHub.

## Cấu trúc thư mục

Dự án là một ứng dụng Next.js duy nhất; ranh giới giao diện và máy chủ thể hiện bằng thư mục.

| Lớp | Thư mục | Loại tệp |
|---|---|---|
| Giao diện (FE) | `src/app/**/page.tsx`, `layout.tsx`; `src/components/`; `src/hooks/`; `src/styles/` | `.tsx`, `.ts`, `.css` |
| Hình ảnh | `public/images/`, `public/favicon.ico` | `.svg`, `.png`, `.ico` |
| Tệp tĩnh khác | `public/templates/` | `.csv` |
| Máy chủ (BE) | `src/server/`, `src/app/api/**/route.ts`, `src/proxy.ts` | `.ts` |
| Dùng chung | `src/shared/` | `.ts`, `.json` |
| Cơ sở dữ liệu | `supabase/` | `.sql`, `.toml` |
| Kiểm thử | `tests/`, `supabase/tests/` | `.ts`, `.sql` |
| Vận hành | `.github/`, `scripts/` | `.yml`, `.sh`, `.ts` |
| Tài liệu | `docs/` | `.md` |

Quy tắc ranh giới (ESLint kiểm tra):

1. `src/server/` chỉ chạy trên máy chủ; `src/components/` và `src/hooks/` không import từ đó, trừ `src/server/actions/*`.
2. `src/server/supabase/admin.ts` (khóa `service_role`) chỉ được import ở ba nơi: `src/server/actions/users.ts`, `src/app/api/cron/keepalive/route.ts`, `src/app/api/export/[projectId]/route.ts`.
3. `src/shared/` là lớp thấp nhất, không import từ `src/server/`, `src/components/`, `src/hooks/`, `src/app/`.
4. Hình ảnh chỉ nằm trong `public/images/`.

## Yêu cầu

Node.js 20 trở lên, npm, Docker (để chạy Supabase local), Supabase CLI (có trong devDependencies).

## Cài đặt và chạy local

```bash
npm install
cp .env.example .env.local        # điền giá trị, không commit
npx supabase start                # cần Docker
npm run db:reset                  # áp dụng migrations và seed
npm run dev                       # http://localhost:3000
```

## Biến môi trường

| Biến | Công khai? | Ghi chú |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Có | URL dự án Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Có | Khóa công khai (có thể mang tên `..._PUBLISHABLE_KEY`) |
| `NEXT_PUBLIC_SITE_URL` | Có | Địa chỉ trang |
| `SUPABASE_SERVICE_ROLE_KEY` | **Bí mật** | Bỏ qua RLS; chỉ dùng phía máy chủ; không đặt tiền tố `NEXT_PUBLIC_` |
| `STUDENT_EMAIL_DOMAIN` | Không | Tên miền giả để ghép email nội bộ cho tài khoản |
| `CRON_SECRET` | **Bí mật** | Xác thực lời gọi Vercel Cron |
| `EXPORT_PSEUDONYM_SECRET` | **Bí mật** | Khóa HMAC tạo mã giả khi xuất dữ liệu; không xoay khóa trong suốt nghiên cứu |
| `EXPORT_PSEUDONYM_KEY_VERSION` | Không | Phiên bản khóa HMAC |

## Lệnh npm

| Lệnh | Việc làm |
|---|---|
| `npm run dev` / `build` / `start` | Chạy phát triển, build, chạy bản build |
| `npm run lint` / `typecheck` | Kiểm tra mã, kiểm tra kiểu |
| `npm test` / `npm run e2e` | Test đơn vị (Vitest) / test trình duyệt (Playwright) |
| `npm run db:reset` / `db:push` / `db:types` / `db:test` | Dựng lại DB local / đẩy migrations / sinh kiểu TypeScript / chạy pgTAP |
| `npm run import:students` / `export:research` | Script nhập học sinh / xuất dữ liệu giả danh |

## Triển khai

1. Đẩy mã lên **repo GitHub cá nhân** (gói Hobby của Vercel không kết nối repo thuộc GitHub Organization). Nhánh `main` là production; mỗi pull request có bản Preview.
2. Tạo hai dự án Supabase miễn phí `pbl-prod` và `pbl-dev`, vùng Singapore. Production trỏ `pbl-prod`, Preview trỏ `pbl-dev`.
3. Trên Vercel: import repo, đặt biến môi trường theo từng môi trường. `vercel.json` đã cấu hình cron `keepalive` mỗi ngày một lần và vùng `sin1`.
4. Đẩy cấu trúc CSDL bằng `npm run db:push`; không sửa tay trên production.
5. Sao lưu: chạy `scripts/backup-db.sh` hằng tuần và trước hoặc sau mỗi mốc; lưu ngoài GitHub.

## Kiểm thử

Test đơn vị ở `tests/unit/`; test trình duyệt ở `tests/e2e/`; test tranh chấp (hai kết nối) ở `tests/concurrency/`; test CSDL (pgTAP) ở `supabase/tests/`. Danh sách kịch bản “tấn công” phải đạt nằm ở mục 8.4 của tài liệu thiết kế.

## Bảo mật

- Không commit `.env*` (trừ `.env.example`); không để khóa `service_role` lộ ra phía trình duyệt.
- Mọi quy tắc nghiệp vụ quan trọng (ẩn điểm, nhật ký không sửa được, tính điểm) phải được thực thi ở PostgreSQL, không chỉ ở giao diện.
- Dữ liệu học sinh là dữ liệu của người chưa thành niên: dùng mã hoặc biệt danh nếu nhà trường đồng ý; có phiếu đồng ý nghiên cứu.

## Tài liệu thiết kế

Tệp `Cau-truc-du-an-va-rang-buoc-du-lieu.docx` (bản v1) là nguồn sự thật: cấu trúc thư mục (mục 3), cơ sở dữ liệu (mục 5), phân quyền (mục 6), quy tắc nghiệp vụ (mục 7), kiểm thử và bảo mật (mục 8), lộ trình (mục 9).

## Lộ trình

Mốc 1: đăng nhập, phân quyền, layout ba vai trò. Mốc 2: lớp, tài khoản, dự án, kho nhiệm vụ, nhóm. Mốc 3: Kanban và nhật ký. Mốc 4: bảng điều khiển. Mốc 5: BARS, đánh giá, chấm điểm, công bố. Mốc 6: xuất dữ liệu, kiểm thử người dùng, đóng băng bản thực nghiệm.
