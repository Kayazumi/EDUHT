-- [DB] Mã hồ sơ học sinh và giáo viên cho lớp mẫu 10C4
alter table public.profiles
  add column if not exists student_code text null,
  add column if not exists staff_code text null,
  add column if not exists department text null,
  add column if not exists subject_area text null;

create unique index if not exists uq_profiles_student_code
  on public.profiles(student_code) where student_code is not null;
create unique index if not exists uq_profiles_staff_code
  on public.profiles(staff_code) where staff_code is not null;

alter table public.profiles
  drop constraint if exists chk_profiles_student_code_role,
  add constraint chk_profiles_student_code_role
    check (student_code is null or (role = 'student' and student_code ~ '^SPT[0-9]{2}$')),
  drop constraint if exists chk_profiles_staff_code_role,
  add constraint chk_profiles_staff_code_role
    check (staff_code is null or (role = 'teacher' and staff_code ~ '^GV[0-9]{2}$'));
