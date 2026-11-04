-- [DB] Điểm số, đồng ý nghiên cứu và nhật ký kiểm toán · tài liệu mục 4.4 và 5.6

-- 1. Bảng group_scores (Điểm_nhóm do giáo viên chấm theo Rubric)
create table if not exists public.group_scores (
  group_id uuid primary key references public.groups(id) on delete cascade,
  score numeric(4,2) not null check (score >= 0 and score <= 10),
  comment text null check (char_length(comment) <= 2000),
  graded_by uuid not null references public.profiles(id),
  graded_at timestamptz not null default now()
);

create index if not exists idx_group_scores_graded_by on public.group_scores(graded_by);

-- 2. Bảng final_scores (Điểm_CN: chụp điểm nhóm, điểm ĐĐ, trọng số a, b, snapshot tiến trình, điểm chỉnh)
create table if not exists public.final_scores (
  project_id uuid not null,
  student_id uuid not null,
  group_id uuid not null,
  round_id uuid not null,
  group_score numeric(4,2) not null check (group_score >= 0 and group_score <= 10),
  peer_score numeric(4,2) null check (peer_score >= 0 and peer_score <= 10),
  peer_missing boolean not null default false check ((peer_score is null) = peer_missing),
  weight_group numeric(3,2) not null,
  weight_peer numeric(3,2) not null check (weight_group + weight_peer = 1.0),
  progress_snapshot jsonb not null default '{}'::jsonb,
  computed_score numeric(4,2) not null check (computed_score >= 0 and computed_score <= 10),
  adjusted_score numeric(4,2) null check (adjusted_score >= 0 and adjusted_score <= 10),
  adjust_reason text null,
  adjusted_by uuid null references public.profiles(id),
  adjusted_at timestamptz null,
  final_score numeric(4,2) generated always as (coalesce(adjusted_score, computed_score)) stored,
  result_version integer not null default 0 check (result_version >= 0),
  computed_at timestamptz not null default now(),
  published_at timestamptz null,
  primary key (project_id, student_id),
  constraint fk_final_scores_member_project foreign key (project_id, student_id) references public.group_members(project_id, student_id),
  constraint fk_final_scores_member_group foreign key (group_id, student_id) references public.group_members(group_id, student_id),
  constraint fk_final_scores_group foreign key (group_id, project_id) references public.groups(id, project_id),
  constraint fk_final_scores_round foreign key (round_id, project_id) references public.evaluation_rounds(id, project_id),
  constraint chk_final_scores_adjustment check (
    (adjusted_score is null and adjust_reason is null and adjusted_by is null and adjusted_at is null)
    or
    (adjusted_score is not null and adjust_reason is not null and adjusted_by is not null and adjusted_at is not null and char_length(btrim(adjust_reason)) >= 10)
  )
);

create index if not exists idx_final_scores_project_id on public.final_scores(project_id);
create index if not exists idx_final_scores_student_id on public.final_scores(student_id);
create index if not exists idx_final_scores_group_id on public.final_scores(group_id);
create index if not exists idx_final_scores_published on public.final_scores(project_id, published_at);

-- 3. Bảng research_consents (trạng thái đồng ý tham gia nghiên cứu hiện hành)
create table if not exists public.research_consents (
  student_id uuid primary key references public.profiles(id) on delete cascade,
  status public.consent_status not null default 'pending',
  consented_by public.consent_party null check ((status = 'pending') = (consented_by is null)),
  form_version text not null check (char_length(form_version) between 1 and 30),
  recorded_by uuid not null references public.profiles(id),
  recorded_at timestamptz not null default now(),
  note text null check (char_length(note) <= 500)
);

create index if not exists idx_research_consents_status on public.research_consents(status);

-- 4. Bảng audit_logs (nhật ký thao tác quản trị hệ thống - chỉ ghi thêm)
create table if not exists public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid null references public.profiles(id) on delete set null,
  action text not null check (action ~ '^[a-z_]+[.][a-z_.]+$'),
  target_table text null,
  target_id text null,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_audit_logs_actor_id on public.audit_logs(actor_id);
create index if not exists idx_audit_logs_action on public.audit_logs(action);
create index if not exists idx_audit_logs_created_at on public.audit_logs(created_at);

-- 5. Bảng score_events (lịch sử biến động điểm: computed, adjusted, published, unpublished - chỉ ghi thêm)
create table if not exists public.score_events (
  id bigint generated always as identity primary key,
  project_id uuid not null references public.projects(id) on delete restrict,
  student_id uuid null references public.profiles(id),
  event_type public.score_event_type not null,
  actor_id uuid not null references public.profiles(id),
  reason text null check (event_type not in ('adjusted', 'unpublished') or char_length(btrim(reason)) >= 10),
  before_value numeric(4,2) null,
  after_value numeric(4,2) null,
  result_version integer not null check (result_version >= 0),
  occurred_at timestamptz not null default now()
);

create index if not exists idx_score_events_project_id on public.score_events(project_id);
create index if not exists idx_score_events_student_id on public.score_events(student_id);
create index if not exists idx_score_events_occurred_at on public.score_events(occurred_at);

-- 6. Bảng research_consent_events (lịch sử đồng ý nghiên cứu - chỉ ghi thêm)
create table if not exists public.research_consent_events (
  id bigint generated always as identity primary key,
  student_id uuid not null references public.profiles(id),
  status public.consent_status not null,
  consented_by public.consent_party null,
  form_version text not null check (char_length(form_version) between 1 and 30),
  recorded_by uuid not null references public.profiles(id),
  recorded_at timestamptz not null default now(),
  note text null check (char_length(note) <= 500)
);

create index if not exists idx_research_consent_events_student_id on public.research_consent_events(student_id);
create index if not exists idx_research_consent_events_recorded_at on public.research_consent_events(recorded_at);

-- 7. Bảng research_exports (nhật ký các lần xuất dữ liệu giả danh cho nghiên cứu - chỉ ghi thêm)
create table if not exists public.research_exports (
  id bigint generated always as identity primary key,
  project_id uuid not null references public.projects(id) on delete restrict,
  exported_by uuid not null references public.profiles(id),
  exported_at timestamptz not null default now(),
  key_version smallint not null check (key_version >= 1),
  included_student_ids uuid[] not null,
  row_count integer not null check (row_count >= 0),
  note text null
);

create index if not exists idx_research_exports_project_id on public.research_exports(project_id);
create index if not exists idx_research_exports_exported_at on public.research_exports(exported_at);
