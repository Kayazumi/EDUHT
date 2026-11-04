-- [DB] Thang BARS, đợt đánh giá, phiếu đánh giá đồng đẳng và điểm ĐĐ · tài liệu mục 4.4 và 5.5

-- 1. Bảng bars_criteria (tiêu chí hành vi: mẫu admin hoặc tiêu chí dự án)
create table if not exists public.bars_criteria (
  id uuid primary key default gen_random_uuid(),
  is_template boolean not null default false,
  project_id uuid null references public.projects(id) on delete cascade,
  template_name text null check (char_length(btrim(template_name)) between 3 and 100),
  position smallint not null check (position >= 1),
  title text not null check (char_length(btrim(title)) between 3 and 100),
  description text null check (description is null or char_length(description) <= 500),
  weight smallint not null default 1 check (weight between 1 and 5),
  created_at timestamptz not null default now(),
  constraint chk_bars_criteria_scope check (
    (is_template and project_id is null and template_name is not null)
    or (not is_template and project_id is not null and template_name is null)
  ),
  constraint uq_bars_criteria_project_pos unique (project_id, position),
  constraint uq_bars_criteria_template_pos unique (template_name, position)
);

-- 2. Bảng bars_levels (mô tả hành vi 4 mức cho từng tiêu chí - học sinh nhìn thấy)
create table if not exists public.bars_levels (
  criterion_id uuid not null references public.bars_criteria(id) on delete cascade,
  level smallint not null check (level between 1 and 4),
  behavior_text text not null check (char_length(btrim(behavior_text)) between 5 and 500),
  primary key (criterion_id, level)
);

-- 3. Bảng bars_level_points (điểm quy đổi từng mức - ẩn với học sinh)
create table if not exists public.bars_level_points (
  criterion_id uuid not null,
  level smallint not null,
  points numeric(4,2) not null check (points >= 0 and points <= 10),
  primary key (criterion_id, level),
  constraint fk_bars_level_points_level foreign key (criterion_id, level) references public.bars_levels(criterion_id, level) on delete cascade
);

-- 4. Bảng evaluation_rounds (đợt đánh giá đồng đẳng)
create table if not exists public.evaluation_rounds (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 3 and 100),
  opens_at timestamptz not null,
  closes_at timestamptz not null check (closes_at > opens_at),
  status round_status not null default 'draft',
  rater_visibility rater_visibility not null default 'ratee_after_publish',
  finalized_at timestamptz null,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  constraint chk_evaluation_rounds_finalized check ((status = 'closed') = (finalized_at is not null)),
  constraint uq_evaluation_rounds_id_project unique (id, project_id)
);

create index if not exists idx_evaluation_rounds_project on public.evaluation_rounds(project_id);

-- 5. Bảng peer_reviews (phiếu đánh giá định danh: rater_id -> ratee_id)
create table if not exists public.peer_reviews (
  id uuid primary key default gen_random_uuid(),
  round_id uuid not null,
  project_id uuid not null,
  group_id uuid not null,
  rater_id uuid not null,
  ratee_id uuid not null,
  comment text null check (comment is null or char_length(comment) <= 1000),
  submitted_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_peer_reviews_round_rater_ratee unique (round_id, rater_id, ratee_id),
  constraint chk_peer_reviews_not_self check (rater_id <> ratee_id),
  -- INV-04: Phiếu, nhóm và đợt đánh giá phải thuộc cùng một dự án
  constraint fk_peer_reviews_round foreign key (round_id, project_id) references public.evaluation_rounds(id, project_id) on delete cascade,
  constraint fk_peer_reviews_group foreign key (group_id, project_id) references public.groups(id, project_id),
  -- INV-03: Người chấm và người được chấm phải thuộc cùng nhóm
  constraint fk_peer_reviews_rater foreign key (group_id, rater_id) references public.group_members(group_id, student_id),
  constraint fk_peer_reviews_ratee foreign key (group_id, ratee_id) references public.group_members(group_id, student_id)
);

create index if not exists idx_peer_reviews_round_ratee on public.peer_reviews(round_id, ratee_id);

-- 6. Bảng peer_review_answers (câu trả lời theo tiêu chí: chỉ lưu mức hành vi)
create table if not exists public.peer_review_answers (
  review_id uuid not null references public.peer_reviews(id) on delete cascade,
  criterion_id uuid not null,
  level smallint not null,
  primary key (review_id, criterion_id),
  constraint fk_peer_review_answers_level foreign key (criterion_id, level) references public.bars_levels(criterion_id, level)
);

-- 7. Bảng peer_scores (ảnh chụp Điểm_ĐĐ khi chốt đợt finalize_round)
create table if not exists public.peer_scores (
  round_id uuid not null references public.evaluation_rounds(id) on delete cascade,
  student_id uuid not null references public.profiles(id),
  group_id uuid not null references public.groups(id),
  score numeric(4,2) null check (score is null or (score >= 0 and score <= 10)),
  reviews_received smallint not null check (reviews_received >= 0),
  reviews_expected smallint not null check (reviews_expected >= 1),
  computed_at timestamptz not null default now(),
  primary key (round_id, student_id),
  constraint chk_peer_scores_received check (reviews_received <= reviews_expected),
  constraint chk_peer_scores_null check ((score is null) = (reviews_received = 0))
);

create index if not exists idx_peer_scores_student on public.peer_scores(student_id);
