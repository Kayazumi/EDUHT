-- [DB] Yêu cầu cần đạt, dự án và kho nhiệm vụ · tài liệu mục 4.4 và 5.3

-- 1. Bảng learning_requirements (danh mục YCCĐ theo chương trình Tin học THPT)
create table if not exists public.learning_requirements (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[A-Za-z0-9._-]{2,30}$'),
  content text not null check (char_length(btrim(content)) between 5 and 1000),
  grade smallint not null check (grade in (10, 11, 12)),
  strand curriculum_strand not null,
  topic text null check (topic is null or char_length(topic) <= 100),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 2. Bảng projects (dự án học tập)
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete restrict,
  title text not null check (char_length(btrim(title)) between 3 and 150),
  description text null check (description is null or char_length(description) <= 5000),
  status project_status not null default 'draft',
  starts_on date not null,
  due_on date not null check (due_on >= starts_on),
  group_size_min smallint not null default 3 check (group_size_min >= 2),
  group_size_max smallint not null default 5 check (group_size_max >= group_size_min and group_size_max <= 8),
  weight_group numeric(3,2) not null check (weight_group >= 0 and weight_group <= 1),
  weight_peer numeric(3,2) generated always as (1 - weight_group) stored,
  allow_custom_tasks boolean not null default true,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_projects_id_class_id unique (id, class_id)
);

create index if not exists idx_projects_class_id on public.projects(class_id);

-- 3. Bảng task_templates (kho nhiệm vụ mẫu của dự án)
create table if not exists public.task_templates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 3 and 150),
  description text null check (description is null or char_length(description) <= 2000),
  position integer not null default 0 check (position >= 0),
  default_due_on date null,
  created_at timestamptz not null default now()
);

create index if not exists idx_task_templates_project_id on public.task_templates(project_id);

-- 4. Bảng task_template_requirements (ánh xạ N-N giữa nhiệm vụ và YCCĐ)
create table if not exists public.task_template_requirements (
  template_id uuid not null references public.task_templates(id) on delete cascade,
  requirement_id uuid not null references public.learning_requirements(id) on delete restrict,
  primary key (template_id, requirement_id)
);

create index if not exists idx_ttr_requirement_id on public.task_template_requirements(requirement_id);
