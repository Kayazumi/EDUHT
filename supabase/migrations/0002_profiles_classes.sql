-- [DB] Tài khoản, lớp học và ghi danh · tài liệu mục 4.4 và 5.3

-- 1. Bảng profiles (hồ sơ người dùng liên kết auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'student',
  username text not null unique check (username ~ '^[a-z0-9._-]{3,30}$'),
  full_name text not null check (char_length(btrim(full_name)) between 2 and 100),
  is_active boolean not null default true,
  must_change_password boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Bảng classes (lớp học)
create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 30),
  grade smallint not null check (grade in (10, 11, 12)),
  school_year text not null check (
    school_year ~ '^[0-9]{4}-[0-9]{4}$'
    and substring(school_year from 6 for 4)::int = substring(school_year from 1 for 4)::int + 1
  ),
  teacher_id uuid not null references public.profiles(id) on delete restrict,
  archived_at timestamptz null,
  created_at timestamptz not null default now(),
  constraint uq_classes_name_school_year unique (name, school_year)
);

create index if not exists idx_classes_teacher_id on public.classes(teacher_id);

-- 3. Bảng class_students (học sinh ghi danh vào lớp)
create table if not exists public.class_students (
  class_id uuid not null references public.classes(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete restrict,
  joined_at timestamptz not null default now(),
  primary key (class_id, student_id)
);

create index if not exists idx_class_students_student_id on public.class_students(student_id);

-- 4. Trigger tạo profiles tự động khi tạo auth.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_role public.user_role;
  v_username text;
  v_full_name text;
begin
  -- Lấy role từ app_metadata, mặc định 'student'
  v_role := coalesce(
    nullif(new.raw_app_meta_data->>'role', '')::public.user_role,
    'student'::public.user_role
  );
  
  -- Lấy username và full_name từ metadata hoặc email
  v_username := coalesce(
    nullif(new.raw_user_meta_data->>'username', ''),
    split_part(new.email, '@', 1)
  );
  v_full_name := coalesce(
    nullif(new.raw_user_meta_data->>'full_name', ''),
    v_username
  );

  insert into public.profiles (id, role, username, full_name, must_change_password)
  values (new.id, v_role, v_username, v_full_name, true)
  on conflict (id) do update
  set updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
