-- [DB] Chính sách bảo mật cấp dòng (RLS) và cấp cột (Column-level Grant) · tài liệu mục 4.4 và mục 6

-- ============================================================================
-- 1. BẬT ROW LEVEL SECURITY (RLS) TRÊN TẤT CẢ 26 BẢNG
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.classes enable row level security;
alter table public.class_students enable row level security;
alter table public.learning_requirements enable row level security;
alter table public.projects enable row level security;
alter table public.task_templates enable row level security;
alter table public.task_template_requirements enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.tasks enable row level security;
alter table public.task_events enable row level security;
alter table public.group_messages enable row level security;
alter table public.bars_criteria enable row level security;
alter table public.bars_levels enable row level security;
alter table public.bars_level_points enable row level security;
alter table public.evaluation_rounds enable row level security;
alter table public.peer_reviews enable row level security;
alter table public.peer_review_answers enable row level security;
alter table public.peer_scores enable row level security;
alter table public.group_scores enable row level security;
alter table public.final_scores enable row level security;
alter table public.research_consents enable row level security;
alter table public.audit_logs enable row level security;
alter table public.score_events enable row level security;
alter table public.research_consent_events enable row level security;
alter table public.research_exports enable row level security;

-- ============================================================================
-- 2. THU HỒI QUYỀN MẶC ĐỊNH TỪ ANON VÀ PUBLIC
-- ============================================================================

revoke all on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;

-- ============================================================================
-- 3. CẤP QUYỀN CHỌN LỌC THEO BẢNG CHO AUTHENTICATED
-- ============================================================================

grant select, update on public.profiles to authenticated;
grant select, insert, update on public.classes to authenticated;
grant select, insert, delete on public.class_students to authenticated;
grant select, insert, update on public.learning_requirements to authenticated;
grant select, insert, update, delete on public.projects to authenticated;
grant select, insert, update, delete on public.task_templates to authenticated;
grant select, insert, update, delete on public.task_template_requirements to authenticated;
grant select, insert, update, delete on public.groups to authenticated;
grant select, insert, update, delete on public.group_members to authenticated;
grant select, insert, update on public.tasks to authenticated;
grant select on public.task_events to authenticated;
grant select, insert on public.group_messages to authenticated;
grant select, insert, update, delete on public.bars_criteria to authenticated;
grant select, insert, update, delete on public.bars_levels to authenticated;
grant select, insert, update, delete on public.bars_level_points to authenticated;
grant select, insert, update on public.evaluation_rounds to authenticated;
grant select, insert, update on public.peer_reviews to authenticated;
grant select, insert, update on public.peer_review_answers to authenticated;
grant select on public.peer_scores to authenticated;
grant select, insert, update on public.group_scores to authenticated;
grant select on public.final_scores to authenticated;
grant select on public.research_consents to authenticated;
grant select on public.audit_logs to authenticated;
grant select on public.score_events to authenticated;
grant select on public.research_consent_events to authenticated;
grant select on public.research_exports to authenticated;

-- ============================================================================
-- 4. PHÂN QUYỀN CẤP CỘT (COLUMN-LEVEL UPDATE)
-- ============================================================================

-- tasks: chỉ cho phép cập nhật title, description, status, assignee_id, due_at, position, archived_at
revoke update on public.tasks from authenticated;
grant update (title, description, status, assignee_id, due_at, position, archived_at) on public.tasks to authenticated;

-- peer_reviews: chỉ cho phép học sinh cập nhật comment (submitted_at đổi qua RPC submit_review)
revoke update on public.peer_reviews from authenticated;
grant update (comment) on public.peer_reviews to authenticated;

-- projects: không cho phép đổi status trực tiếp (đổi qua RPC set_project_status)
revoke update on public.projects from authenticated;
grant update (title, description, class_id, weight_group, group_size_min, group_size_max, allow_custom_tasks, due_on) on public.projects to authenticated;

-- evaluation_rounds: không cho phép đổi status và finalized_at trực tiếp
revoke update on public.evaluation_rounds from authenticated;
grant update (title, opens_at, closes_at, rater_visibility) on public.evaluation_rounds to authenticated;

-- ============================================================================
-- 5. CHÍNH SÁCH RLS (POLICIES)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 5.1 profiles
-- ----------------------------------------------------------------------------
drop policy if exists "profiles_select_policy" on public.profiles;
create policy "profiles_select_policy" on public.profiles
  for select to authenticated
  using (
    id = auth.uid() or
    public.is_admin() or
    exists (
      select 1 from public.classes c
      join public.class_students cs on c.id = cs.class_id
      where cs.student_id = profiles.id and c.teacher_id = auth.uid()
    )
  );

drop policy if exists "profiles_update_policy" on public.profiles;
create policy "profiles_update_policy" on public.profiles
  for update to authenticated
  using (public.is_admin() or id = auth.uid())
  with check (public.is_admin() or id = auth.uid());

-- ----------------------------------------------------------------------------
-- 5.2 classes & class_students
-- ----------------------------------------------------------------------------
drop policy if exists "classes_select_policy" on public.classes;
create policy "classes_select_policy" on public.classes
  for select to authenticated
  using (
    public.is_admin() or
    teacher_id = auth.uid() or
    public.is_student_in_class(id)
  );

drop policy if exists "classes_insert_policy" on public.classes;
create policy "classes_insert_policy" on public.classes
  for insert to authenticated
  with check (public.is_admin());

drop policy if exists "classes_update_policy" on public.classes;
create policy "classes_update_policy" on public.classes
  for update to authenticated
  using (public.is_admin() or teacher_id = auth.uid())
  with check (public.is_admin() or teacher_id = auth.uid());

drop policy if exists "class_students_select_policy" on public.class_students;
create policy "class_students_select_policy" on public.class_students
  for select to authenticated
  using (
    public.is_admin() or
    public.is_teacher_of_class(class_id) or
    student_id = auth.uid()
  );

drop policy if exists "class_students_admin_mutation_policy" on public.class_students;
create policy "class_students_admin_mutation_policy" on public.class_students
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ----------------------------------------------------------------------------
-- 5.3 learning_requirements
-- ----------------------------------------------------------------------------
drop policy if exists "learning_requirements_select_policy" on public.learning_requirements;
create policy "learning_requirements_select_policy" on public.learning_requirements
  for select to authenticated
  using (auth.uid() is not null);

drop policy if exists "learning_requirements_admin_policy" on public.learning_requirements;
create policy "learning_requirements_admin_policy" on public.learning_requirements
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ----------------------------------------------------------------------------
-- 5.4 projects, task_templates, task_template_requirements
-- ----------------------------------------------------------------------------
drop policy if exists "projects_select_policy" on public.projects;
create policy "projects_select_policy" on public.projects
  for select to authenticated
  using (
    public.is_admin() or
    public.is_teacher_of_class(class_id) or
    (public.is_student_in_class(class_id) and status <> 'draft')
  );

drop policy if exists "projects_teacher_insert" on public.projects;
create policy "projects_teacher_insert" on public.projects
  for insert to authenticated
  with check (public.is_teacher_of_class(class_id));

drop policy if exists "projects_teacher_update" on public.projects;
create policy "projects_teacher_update" on public.projects
  for update to authenticated
  using (public.is_teacher_of_project(id))
  with check (public.is_teacher_of_project(id));

drop policy if exists "projects_teacher_delete" on public.projects;
create policy "projects_teacher_delete" on public.projects
  for delete to authenticated
  using (public.is_teacher_of_project(id) and status = 'draft');

drop policy if exists "task_templates_select" on public.task_templates;
create policy "task_templates_select" on public.task_templates
  for select to authenticated
  using (
    public.is_admin() or
    public.is_teacher_of_project(project_id) or
    exists (
      select 1 from public.projects p
      where p.id = task_templates.project_id
        and public.is_student_in_class(p.class_id)
        and p.status <> 'draft'
    )
  );

drop policy if exists "task_templates_mutation" on public.task_templates;
create policy "task_templates_mutation" on public.task_templates
  for all to authenticated
  using (
    public.is_teacher_of_project(project_id) and
    exists (select 1 from public.projects p where p.id = task_templates.project_id and p.status = 'draft')
  )
  with check (
    public.is_teacher_of_project(project_id) and
    exists (select 1 from public.projects p where p.id = task_templates.project_id and p.status = 'draft')
  );

drop policy if exists "task_template_reqs_select" on public.task_template_requirements;
create policy "task_template_reqs_select" on public.task_template_requirements
  for select to authenticated
  using (
    exists (
      select 1 from public.task_templates tt
      where tt.id = task_template_requirements.template_id
        and (
          public.is_admin() or
          public.is_teacher_of_project(tt.project_id) or
          exists (
            select 1 from public.projects p
            where p.id = tt.project_id
              and public.is_student_in_class(p.class_id)
              and p.status <> 'draft'
          )
        )
    )
  );

drop policy if exists "task_template_reqs_mutation" on public.task_template_requirements;
create policy "task_template_reqs_mutation" on public.task_template_requirements
  for all to authenticated
  using (
    exists (
      select 1 from public.task_templates tt
      join public.projects p on tt.project_id = p.id
      where tt.id = task_template_requirements.template_id
        and public.is_teacher_of_project(p.id)
        and p.status = 'draft'
    )
  )
  with check (
    exists (
      select 1 from public.task_templates tt
      join public.projects p on tt.project_id = p.id
      where tt.id = task_template_requirements.template_id
        and public.is_teacher_of_project(p.id)
        and p.status = 'draft'
    )
  );

-- ----------------------------------------------------------------------------
-- 5.5 groups & group_members
-- ----------------------------------------------------------------------------
drop policy if exists "groups_select_policy" on public.groups;
create policy "groups_select_policy" on public.groups
  for select to authenticated
  using (
    public.is_admin() or
    public.is_teacher_of_project(project_id) or
    public.is_member_of_group(id)
  );

drop policy if exists "groups_teacher_mutation" on public.groups;
create policy "groups_teacher_mutation" on public.groups
  for all to authenticated
  using (public.is_teacher_of_project(project_id) and locked_at is null)
  with check (public.is_teacher_of_project(project_id) and locked_at is null);

drop policy if exists "group_members_select_policy" on public.group_members;
create policy "group_members_select_policy" on public.group_members
  for select to authenticated
  using (
    public.is_admin() or
    public.is_teacher_of_project(project_id) or
    public.is_member_of_group(group_id)
  );

drop policy if exists "group_members_teacher_mutation" on public.group_members;
create policy "group_members_teacher_mutation" on public.group_members
  for all to authenticated
  using (
    public.is_teacher_of_project(project_id) and
    exists (select 1 from public.groups g where g.id = group_members.group_id and g.locked_at is null)
  )
  with check (
    public.is_teacher_of_project(project_id) and
    exists (select 1 from public.groups g where g.id = group_members.group_id and g.locked_at is null)
  );

-- ----------------------------------------------------------------------------
-- 5.6 tasks, task_events, group_messages
-- ----------------------------------------------------------------------------
drop policy if exists "tasks_select_policy" on public.tasks;
create policy "tasks_select_policy" on public.tasks
  for select to authenticated
  using (
    public.is_admin() or
    public.is_teacher_of_project((select project_id from public.groups where id = tasks.group_id)) or
    public.is_member_of_group(group_id)
  );

drop policy if exists "tasks_insert_policy" on public.tasks;
create policy "tasks_insert_policy" on public.tasks
  for insert to authenticated
  with check (
    public.is_member_of_group(group_id) and
    public.project_is_active((select project_id from public.groups where id = tasks.group_id))
  );

drop policy if exists "tasks_update_policy" on public.tasks;
create policy "tasks_update_policy" on public.tasks
  for update to authenticated
  using (
    public.is_member_of_group(group_id) and
    public.project_is_active((select project_id from public.groups where id = tasks.group_id))
  )
  with check (
    public.is_member_of_group(group_id) and
    public.project_is_active((select project_id from public.groups where id = tasks.group_id))
  );

drop policy if exists "task_events_select_policy" on public.task_events;
create policy "task_events_select_policy" on public.task_events
  for select to authenticated
  using (
    public.is_admin() or
    exists (
      select 1 from public.tasks t
      join public.groups g on t.group_id = g.id
      where t.id = task_events.task_id and (
        public.is_teacher_of_project(g.project_id) or
        public.is_member_of_group(g.id)
      )
    )
  );

drop policy if exists "group_messages_select_policy" on public.group_messages;
create policy "group_messages_select_policy" on public.group_messages
  for select to authenticated
  using (
    public.is_admin() or
    public.is_teacher_of_project((select project_id from public.groups where id = group_messages.group_id)) or
    public.is_member_of_group(group_id)
  );

drop policy if exists "group_messages_insert_policy" on public.group_messages;
create policy "group_messages_insert_policy" on public.group_messages
  for insert to authenticated
  with check (
    author_id = auth.uid() and (
      public.is_member_of_group(group_id) or
      public.is_teacher_of_project((select project_id from public.groups where id = group_messages.group_id))
    )
  );

-- ----------------------------------------------------------------------------
-- 5.7 bars_criteria, bars_levels, bars_level_points
-- ----------------------------------------------------------------------------
drop policy if exists "bars_criteria_select" on public.bars_criteria;
create policy "bars_criteria_select" on public.bars_criteria
  for select to authenticated
  using (
    public.is_admin() or
    (project_id is null) or
    public.is_teacher_of_project(project_id) or
    exists (
      select 1 from public.projects p
      join public.evaluation_rounds er on p.id = er.project_id
      where p.id = bars_criteria.project_id
        and public.is_student_in_class(p.class_id)
        and er.status <> 'draft'
    )
  );

drop policy if exists "bars_criteria_mutation" on public.bars_criteria;
create policy "bars_criteria_mutation" on public.bars_criteria
  for all to authenticated
  using (
    (project_id is null and public.is_admin()) or
    (
      project_id is not null and
      public.is_teacher_of_project(project_id) and
      not exists (
        select 1 from public.evaluation_rounds er
        where er.project_id = bars_criteria.project_id and er.status in ('open', 'closed')
      )
    )
  )
  with check (
    (project_id is null and public.is_admin()) or
    (
      project_id is not null and
      public.is_teacher_of_project(project_id) and
      not exists (
        select 1 from public.evaluation_rounds er
        where er.project_id = bars_criteria.project_id and er.status in ('open', 'closed')
      )
    )
  );

drop policy if exists "bars_levels_select" on public.bars_levels;
create policy "bars_levels_select" on public.bars_levels
  for select to authenticated
  using (
    exists (
      select 1 from public.bars_criteria bc
      where bc.id = bars_levels.criterion_id and (
        public.is_admin() or
        bc.project_id is null or
        public.is_teacher_of_project(bc.project_id) or
        exists (
          select 1 from public.projects p
          join public.evaluation_rounds er on p.id = er.project_id
          where p.id = bc.project_id
            and public.is_student_in_class(p.class_id)
            and er.status <> 'draft'
        )
      )
    )
  );

drop policy if exists "bars_levels_mutation" on public.bars_levels;
create policy "bars_levels_mutation" on public.bars_levels
  for all to authenticated
  using (
    exists (
      select 1 from public.bars_criteria bc
      where bc.id = bars_levels.criterion_id and (
        (bc.project_id is null and public.is_admin()) or
        (
          bc.project_id is not null and
          public.is_teacher_of_project(bc.project_id) and
          not exists (
            select 1 from public.evaluation_rounds er
            where er.project_id = bc.project_id and er.status in ('open', 'closed')
          )
        )
      )
    )
  )
  with check (
    exists (
      select 1 from public.bars_criteria bc
      where bc.id = bars_levels.criterion_id and (
        (bc.project_id is null and public.is_admin()) or
        (
          bc.project_id is not null and
          public.is_teacher_of_project(bc.project_id) and
          not exists (
            select 1 from public.evaluation_rounds er
            where er.project_id = bc.project_id and er.status in ('open', 'closed')
          )
        )
      )
    )
  );

-- bars_level_points: chỉ admin và giáo viên đúng dự án mới xem được (học sinh 0 dòng - scenario 9)
drop policy if exists "bars_level_points_select" on public.bars_level_points;
create policy "bars_level_points_select" on public.bars_level_points
  for select to authenticated
  using (
    exists (
      select 1 from public.bars_criteria bc
      where bc.id = bars_level_points.criterion_id and (
        public.is_admin() or
        (bc.project_id is not null and public.is_teacher_of_project(bc.project_id))
      )
    )
  );

drop policy if exists "bars_level_points_mutation" on public.bars_level_points;
create policy "bars_level_points_mutation" on public.bars_level_points
  for all to authenticated
  using (
    exists (
      select 1 from public.bars_criteria bc
      where bc.id = bars_level_points.criterion_id and (
        (bc.project_id is null and public.is_admin()) or
        (
          bc.project_id is not null and
          public.is_teacher_of_project(bc.project_id) and
          not exists (
            select 1 from public.evaluation_rounds er
            where er.project_id = bc.project_id and er.status in ('open', 'closed')
          )
        )
      )
    )
  )
  with check (
    exists (
      select 1 from public.bars_criteria bc
      where bc.id = bars_level_points.criterion_id and (
        (bc.project_id is null and public.is_admin()) or
        (
          bc.project_id is not null and
          public.is_teacher_of_project(bc.project_id) and
          not exists (
            select 1 from public.evaluation_rounds er
            where er.project_id = bc.project_id and er.status in ('open', 'closed')
          )
        )
      )
    )
  );

-- ----------------------------------------------------------------------------
-- 5.8 evaluation_rounds, peer_reviews, peer_review_answers, peer_scores
-- ----------------------------------------------------------------------------
drop policy if exists "evaluation_rounds_select" on public.evaluation_rounds;
create policy "evaluation_rounds_select" on public.evaluation_rounds
  for select to authenticated
  using (
    public.is_admin() or
    public.is_teacher_of_project(project_id) or
    (
      status <> 'draft' and
      exists (
        select 1 from public.projects p
        where p.id = evaluation_rounds.project_id and public.is_student_in_class(p.class_id)
      )
    )
  );

drop policy if exists "evaluation_rounds_teacher_mutation" on public.evaluation_rounds;
create policy "evaluation_rounds_teacher_mutation" on public.evaluation_rounds
  for all to authenticated
  using (public.is_teacher_of_project(project_id))
  with check (public.is_teacher_of_project(project_id));

-- peer_reviews: giáo viên thấy hết, học sinh chỉ thấy phiếu do chính mình chấm (admin 0 dòng - scenario 6)
drop policy if exists "peer_reviews_select" on public.peer_reviews;
create policy "peer_reviews_select" on public.peer_reviews
  for select to authenticated
  using (
    public.is_teacher_of_project(project_id) or
    rater_id = auth.uid()
  );

drop policy if exists "peer_reviews_insert" on public.peer_reviews;
create policy "peer_reviews_insert" on public.peer_reviews
  for insert to authenticated
  with check (
    rater_id = auth.uid() and
    public.is_member_of_group(group_id) and
    exists (
      select 1 from public.evaluation_rounds er
      where er.id = peer_reviews.round_id
        and er.status = 'open'
        and now() between er.opens_at and er.closes_at
    )
  );

drop policy if exists "peer_reviews_update" on public.peer_reviews;
create policy "peer_reviews_update" on public.peer_reviews
  for update to authenticated
  using (
    rater_id = auth.uid() and
    submitted_at is null and
    exists (
      select 1 from public.evaluation_rounds er
      where er.id = peer_reviews.round_id
        and er.status = 'open'
        and now() between er.opens_at and er.closes_at
    )
  )
  with check (
    rater_id = auth.uid() and
    submitted_at is null and
    exists (
      select 1 from public.evaluation_rounds er
      where er.id = peer_reviews.round_id
        and er.status = 'open'
        and now() between er.opens_at and er.closes_at
    )
  );

drop policy if exists "peer_review_answers_select" on public.peer_review_answers;
create policy "peer_review_answers_select" on public.peer_review_answers
  for select to authenticated
  using (
    exists (
      select 1 from public.peer_reviews pr
      where pr.id = peer_review_answers.review_id and (
        public.is_teacher_of_project(pr.project_id) or
        pr.rater_id = auth.uid()
      )
    )
  );

drop policy if exists "peer_review_answers_mutation" on public.peer_review_answers;
create policy "peer_review_answers_mutation" on public.peer_review_answers
  for all to authenticated
  using (
    exists (
      select 1 from public.peer_reviews pr
      join public.evaluation_rounds er on pr.round_id = er.id
      where pr.id = peer_review_answers.review_id
        and pr.rater_id = auth.uid()
        and pr.submitted_at is null
        and er.status = 'open'
        and now() between er.opens_at and er.closes_at
    )
  )
  with check (
    exists (
      select 1 from public.peer_reviews pr
      join public.evaluation_rounds er on pr.round_id = er.id
      where pr.id = peer_review_answers.review_id
        and pr.rater_id = auth.uid()
        and pr.submitted_at is null
        and er.status = 'open'
        and now() between er.opens_at and er.closes_at
    )
  );

-- peer_scores: giáo viên đúng dự án đọc; học sinh đọc điểm của mình khi đã công bố; admin 0 dòng (scenario 10)
drop policy if exists "peer_scores_select" on public.peer_scores;
create policy "peer_scores_select" on public.peer_scores
  for select to authenticated
  using (
    exists (
      select 1
      from public.evaluation_rounds er
      where er.id = peer_scores.round_id
        and (
          public.is_teacher_of_project(er.project_id) or
          (peer_scores.student_id = auth.uid() and public.results_published(er.project_id, peer_scores.student_id))
        )
    )
  );

-- ----------------------------------------------------------------------------
-- 5.9 group_scores, final_scores, research_consents, audit_logs, score_events, research_exports
-- ----------------------------------------------------------------------------
-- group_scores: giáo viên đúng dự án; thành viên nhóm khi đã công bố; admin 0 dòng
drop policy if exists "group_scores_select" on public.group_scores;
create policy "group_scores_select" on public.group_scores
  for select to authenticated
  using (
    public.is_teacher_of_project((select project_id from public.groups where id = group_scores.group_id)) or
    (
      public.is_member_of_group(group_id) and
      exists (
        select 1 from public.final_scores fs
        where fs.group_id = group_scores.group_id and fs.published_at is not null
      )
    )
  );

drop policy if exists "group_scores_teacher_mutation" on public.group_scores;
create policy "group_scores_teacher_mutation" on public.group_scores
  for all to authenticated
  using (public.is_teacher_of_project((select project_id from public.groups where id = group_scores.group_id)))
  with check (public.is_teacher_of_project((select project_id from public.groups where id = group_scores.group_id)));

-- final_scores: giáo viên đúng dự án; học sinh chỉ thấy của mình khi published_at IS NOT NULL; admin 0 dòng
drop policy if exists "final_scores_select" on public.final_scores;
create policy "final_scores_select" on public.final_scores
  for select to authenticated
  using (
    public.is_teacher_of_project(project_id) or
    (student_id = auth.uid() and published_at is not null)
  );

-- research_consents
drop policy if exists "research_consents_select" on public.research_consents;
create policy "research_consents_select" on public.research_consents
  for select to authenticated
  using (
    public.is_admin() or
    student_id = auth.uid() or
    public.can_manage_student(student_id)
  );

-- audit_logs: chỉ admin đọc
drop policy if exists "audit_logs_select" on public.audit_logs;
create policy "audit_logs_select" on public.audit_logs
  for select to authenticated
  using (public.is_admin());

-- score_events: chỉ giáo viên đúng dự án đọc; admin và học sinh 0 dòng
drop policy if exists "score_events_select" on public.score_events;
create policy "score_events_select" on public.score_events
  for select to authenticated
  using (public.is_teacher_of_project(project_id));

-- research_consent_events: admin, giáo viên đúng lớp, học sinh dòng của mình
drop policy if exists "research_consent_events_select" on public.research_consent_events;
create policy "research_consent_events_select" on public.research_consent_events
  for select to authenticated
  using (
    public.is_admin() or
    student_id = auth.uid() or
    public.can_manage_student(student_id)
  );

-- research_exports: chỉ admin đọc
drop policy if exists "research_exports_select" on public.research_exports;
create policy "research_exports_select" on public.research_exports
  for select to authenticated
  using (public.is_admin());
