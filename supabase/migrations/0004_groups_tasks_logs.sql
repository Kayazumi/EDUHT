-- [DB] Nhóm, thẻ Kanban, nhật ký bốn tham số và trao đổi nhóm · tài liệu mục 4.4 và 5.4

-- 1. Bảng groups (nhóm dự án)
create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 50),
  locked_at timestamptz null,
  created_at timestamptz not null default now(),
  constraint uq_groups_project_name unique (project_id, name),
  constraint uq_groups_id_project unique (id, project_id)
);

create index if not exists idx_groups_project_id on public.groups(project_id);

-- 2. Bảng group_members (thành viên nhóm - đảm bảo mỗi học sinh 1 nhóm trong 1 dự án)
create table if not exists public.group_members (
  group_id uuid not null,
  project_id uuid not null,
  class_id uuid not null,
  student_id uuid not null references public.profiles(id) on delete restrict,
  joined_at timestamptz not null default now(),
  primary key (group_id, student_id),
  constraint uq_group_members_project_student unique (project_id, student_id),
  constraint fk_group_members_group foreign key (group_id, project_id) references public.groups(id, project_id) on delete cascade,
  constraint fk_group_members_project foreign key (project_id, class_id) references public.projects(id, class_id),
  constraint fk_group_members_class_student foreign key (class_id, student_id) references public.class_students(class_id, student_id) on delete restrict
);

create index if not exists idx_group_members_student_id on public.group_members(student_id);

-- Trigger tự động điền project_id và class_id cho group_members từ groups
create or replace function public.fill_group_member_refs()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  select g.project_id, p.class_id
  into new.project_id, new.class_id
  from public.groups g
  join public.projects p on p.id = g.project_id
  where g.id = new.group_id;

  if new.project_id is null or new.class_id is null then
    raise exception 'Không tìm thấy nhóm hoặc dự án tương ứng';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_fill_group_member_refs on public.group_members;
create trigger trg_fill_group_member_refs
  before insert on public.group_members
  for each row execute function public.fill_group_member_refs();

-- 3. Bảng tasks (thẻ công việc trên bảng Kanban)
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  template_id uuid null references public.task_templates(id) on delete set null,
  title text not null check (char_length(btrim(title)) between 3 and 150),
  description text null check (description is null or char_length(description) <= 2000),
  status task_status not null default 'todo',
  assignee_id uuid null,
  due_at timestamptz null,
  completed_at timestamptz null,
  position double precision not null default 0,
  archived_at timestamptz null,
  created_by uuid not null references public.profiles(id),
  updated_by uuid null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- INV-01: Người phụ trách phải là thành viên của chính nhóm này
  constraint fk_tasks_assignee foreign key (group_id, assignee_id) references public.group_members(group_id, student_id),
  -- Ràng buộc CHECK nghiệp vụ
  constraint chk_tasks_assignee check (status = 'todo' or assignee_id is not null),
  constraint chk_tasks_due check (status = 'todo' or due_at is not null),
  constraint chk_tasks_completed check ((status = 'done') = (completed_at is not null))
);

create index if not exists idx_tasks_group_status on public.tasks(group_id, status) where archived_at is null;
create index if not exists idx_tasks_assignee on public.tasks(assignee_id) where archived_at is null;
create index if not exists idx_tasks_due_at on public.tasks(due_at) where status <> 'done' and archived_at is null;

-- 4. Bảng task_events (nhật ký bốn tham số tự động - chỉ ghi thêm)
create table if not exists public.task_events (
  id bigint generated always as identity primary key,
  task_id uuid not null references public.tasks(id) on delete restrict,
  group_id uuid not null,
  actor_id uuid null references public.profiles(id) on delete set null,
  event_type task_event_type not null,
  from_status task_status null,
  to_status task_status null,
  from_assignee_id uuid null,
  to_assignee_id uuid null,
  from_due_at timestamptz null,
  to_due_at timestamptz null,
  assignee_id uuid null,
  due_at timestamptz null,
  detail jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  constraint chk_task_events_status check (
    event_type <> 'status_changed'
    or (from_status is not null and to_status is not null and from_status <> to_status)
  )
);

create index if not exists idx_task_events_group_occurred on public.task_events(group_id, occurred_at desc);
create index if not exists idx_task_events_task_occurred on public.task_events(task_id, occurred_at);

-- 5. Bảng group_messages (trao đổi giữa giáo viên và nhóm)
create table if not exists public.group_messages (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete restrict,
  body text not null check (char_length(btrim(body)) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists idx_group_messages_group_id on public.group_messages(group_id, created_at desc);
