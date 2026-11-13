-- [DB] View chỉ báo tiến trình và các thủ tục RPC nghiệp vụ · tài liệu mục 4.4 và 7.4

-- ============================================================================
-- 1. CÁC VIEW CHỈ BÁO TIẾN TRÌNH & THÀNH VIÊN NHÓM
-- ============================================================================

-- 1.1 View v_task_status: Tính toán trạng thái is_late và is_determined theo mục 7.2
create or replace view public.v_task_status
with (security_invoker = true) as
select
  t.id as task_id,
  t.group_id,
  g.project_id,
  t.title,
  t.status,
  t.assignee_id,
  t.due_at,
  t.completed_at,
  t.position,
  t.archived_at,
  (t.archived_at is null) as is_valid,
  case
    when t.due_at is null then false
    when t.status = 'done' and t.completed_at > t.due_at then true
    when t.status <> 'done' and t.due_at < now() then true
    else false
  end as is_late,
  case
    when t.status = 'done' then true
    when t.due_at is not null and t.due_at < now() then true
    else false
  end as is_determined
from public.tasks t
join public.groups g on t.group_id = g.id;

-- 1.2 View v_group_progress: Tổng hợp tiến độ nhóm theo mục 7.2
create or replace view public.v_group_progress
with (security_invoker = true) as
select
  g.id as group_id,
  g.project_id,
  g.name as group_name,
  count(vts.task_id) filter (where vts.is_valid) as total_tasks,
  count(vts.task_id) filter (where vts.is_valid and vts.status = 'done') as done_tasks,
  count(vts.task_id) filter (where vts.is_valid and vts.is_late) as late_tasks,
  count(vts.task_id) filter (where vts.is_valid and vts.is_determined) as determined_tasks,
  case
    when count(vts.task_id) filter (where vts.is_valid) > 0 then
      round(
        count(vts.task_id) filter (where vts.is_valid and vts.status = 'done')::numeric /
        count(vts.task_id) filter (where vts.is_valid)::numeric,
        4
      )
    else 0
  end as completion_rate,
  case
    when count(vts.task_id) filter (where vts.is_valid and vts.is_determined) > 0 then
      round(
        count(vts.task_id) filter (where vts.is_valid and vts.is_late)::numeric /
        count(vts.task_id) filter (where vts.is_valid and vts.is_determined)::numeric,
        4
      )
    else null
  end as overdue_rate
from public.groups g
left join public.v_task_status vts on g.id = vts.group_id
group by g.id, g.project_id, g.name;

-- 1.3 View v_student_contribution: Tổng hợp chỉ báo tiến trình cá nhân theo mục 7.2
create or replace view public.v_student_contribution
with (security_invoker = true) as
select
  gm.project_id,
  gm.group_id,
  gm.student_id,
  p.full_name as student_name,
  count(vts.task_id) filter (where vts.is_valid) as assigned_tasks,
  count(vts.task_id) filter (where vts.is_valid and vts.status = 'done') as completed_tasks,
  count(vts.task_id) filter (where vts.is_valid and vts.is_late) as late_tasks,
  count(vts.task_id) filter (where vts.is_valid and vts.is_determined) as determined_tasks,
  case
    when count(vts.task_id) filter (where vts.is_valid) > 0 then
      round(
        count(vts.task_id) filter (where vts.is_valid and vts.status = 'done')::numeric /
        count(vts.task_id) filter (where vts.is_valid)::numeric,
        4
      )
    else 0
  end as individual_completion_rate,
  case
    when count(vts.task_id) filter (where vts.is_valid and vts.is_determined) > 0 then
      round(
        count(vts.task_id) filter (where vts.is_valid and vts.is_late)::numeric /
        count(vts.task_id) filter (where vts.is_valid and vts.is_determined)::numeric,
        4
      )
    else null
  end as individual_overdue_rate,
  (
    select count(*)
    from public.task_events te
    join public.tasks t on te.task_id = t.id
    where t.group_id = gm.group_id
      and te.event_type = 'reassigned'
      and (te.from_assignee_id = gm.student_id or te.to_assignee_id = gm.student_id)
  ) as reassign_count,
  (
    select count(*)
    from public.task_events te
    join public.tasks t on te.task_id = t.id
    where t.group_id = gm.group_id
      and t.assignee_id = gm.student_id
      and te.event_type = 'due_date_changed'
  ) as postpone_count
from public.group_members gm
join public.profiles p on gm.student_id = p.id
left join public.v_task_status vts on gm.student_id = vts.assignee_id and gm.group_id = vts.group_id
group by gm.project_id, gm.group_id, gm.student_id, p.full_name;

-- 1.4 View v_group_members: Chạy với security_invoker = false để học sinh thấy bạn cùng nhóm (mục 6.3)
create or replace view public.v_group_members
with (security_invoker = false) as
select
  gm.group_id,
  gm.project_id,
  gm.student_id,
  p.full_name
from public.group_members gm
join public.profiles p on gm.student_id = p.id
where public.is_admin()
   or public.is_teacher_of_project(gm.project_id)
   or public.is_member_of_group(gm.group_id);

grant select on public.v_task_status to authenticated;
grant select on public.v_group_progress to authenticated;
grant select on public.v_student_contribution to authenticated;
grant select on public.v_group_members to authenticated;

-- ============================================================================
-- 2. CÁC THỦ TỤC RPC NGHIỆP VỤ (SECURITY DEFINER, SET search_path = '')
-- ============================================================================

-- 2.1 RPC: mark_password_changed()
create or replace function public.mark_password_changed()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;
  update public.profiles
  set must_change_password = false
  where id = auth.uid();
end;
$$;

-- 2.2 RPC: admin_db_size()
create or replace function public.admin_db_size()
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Access denied: admin only';
  end if;
  return pg_database_size(current_database());
end;
$$;

-- 2.3 RPC: instantiate_group_tasks(project_id)
create or replace function public.instantiate_group_tasks(p_project_id uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_inserted_count integer := 0;
  v_group record;
  v_template record;
begin
  if not public.is_teacher_of_project(p_project_id) then
    raise exception 'Access denied: teacher only';
  end if;

  for v_group in
    select id from public.groups
    where project_id = p_project_id and locked_at is not null
  loop
    for v_template in
      select id, title, description, default_due_on
      from public.task_templates
      where project_id = p_project_id
    loop
      if not exists (
        select 1 from public.tasks
        where group_id = v_group.id and template_id = v_template.id
      ) then
        insert into public.tasks (
          group_id, template_id, title, description,
          status, due_at, created_by
        ) values (
          v_group.id,
          v_template.id,
          v_template.title,
          v_template.description,
          'todo'::public.task_status,
          case when v_template.default_due_on is not null
               then (v_template.default_due_on::timestamptz + interval '1 day' - interval '1 millisecond')
               else null end,
          auth.uid()
        );
        v_inserted_count := v_inserted_count + 1;
      end if;
    end loop;
  end loop;

  return v_inserted_count;
end;
$$;

-- 2.3a RPC: assign_project_member(project_id, group_id, student_id)
create or replace function public.assign_project_member(
  p_project_id uuid,
  p_group_id uuid,
  p_student_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_teacher_of_project(p_project_id) then
    raise exception 'Access denied: teacher only';
  end if;
  if not exists (
    select 1 from public.groups g
    join public.projects p on p.id = g.project_id
    where g.id = p_group_id and g.project_id = p_project_id
      and g.locked_at is null and p.status = 'draft'
  ) then
    raise exception 'Group is not available for assignment';
  end if;

  insert into public.group_members (group_id, project_id, student_id)
  values (p_group_id, p_project_id, p_student_id)
  on conflict (project_id, student_id)
  do update set group_id = excluded.group_id;
end;
$$;

-- 2.3b RPC: lock_project_groups(project_id)
create or replace function public.lock_project_groups(p_project_id uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_project public.projects%rowtype;
  v_group_count integer;
  v_created_count integer;
begin
  if not public.is_teacher_of_project(p_project_id) then
    raise exception 'Access denied: teacher only';
  end if;
  select * into v_project from public.projects where id = p_project_id for update;
  if not found or v_project.status <> 'draft' then
    raise exception 'Only draft projects can lock groups';
  end if;

  select count(*) into v_group_count from public.groups where project_id = p_project_id;
  if v_group_count = 0 then raise exception 'Create at least one group before locking'; end if;
  if exists (
    select 1 from public.class_students cs
    where cs.class_id = v_project.class_id
      and not exists (select 1 from public.group_members gm where gm.project_id = p_project_id and gm.student_id = cs.student_id)
  ) then raise exception 'Every student must be assigned to a group'; end if;
  if exists (
    select 1 from public.groups g
    left join public.group_members gm on gm.group_id = g.id
    where g.project_id = p_project_id
    group by g.id
    having count(gm.student_id) < v_project.group_size_min or count(gm.student_id) > v_project.group_size_max
  ) then raise exception 'Every group must meet the configured size limits'; end if;

  update public.groups set locked_at = now() where project_id = p_project_id and locked_at is null;
  select public.instantiate_group_tasks(p_project_id) into v_created_count;
  return coalesce(v_created_count, 0);
end;
$$;

-- 2.4 RPC: set_project_status(project_id, status)
create or replace function public.set_project_status(p_project_id uuid, p_status public.project_status)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_project public.projects%rowtype;
  v_missing_reqs boolean;
  v_group_mismatch boolean;
  v_unlocked_groups boolean;
  v_no_tasks boolean;
begin
  if not public.is_teacher_of_project(p_project_id) then
    raise exception 'Access denied: teacher only';
  end if;

  select * into v_project from public.projects where id = p_project_id for update;
  if not found then
    raise exception 'Project not found';
  end if;

  if v_project.status = 'closed' and p_status <> 'closed' then
    raise exception 'Cannot change status of a closed project';
  end if;

  if p_status = 'active' and v_project.status = 'draft' then
    -- (1) Mỗi nhiệm vụ mẫu có ít nhất một YCCĐ
    select exists (
      select 1 from public.task_templates tt
      where tt.project_id = p_project_id
        and not exists (
          select 1 from public.task_template_requirements ttr
          where ttr.template_id = tt.id
        )
    ) into v_missing_reqs;
    if v_missing_reqs then
      raise exception 'Cannot activate project: some task templates lack learning requirements';
    end if;

    -- (2) Đã đặt trọng số a (weight_group)
    if v_project.weight_group is null or v_project.weight_group <= 0 or v_project.weight_group >= 1 then
      raise exception 'Cannot activate project: weight_group must be set between 0 and 1';
    end if;

    -- (3) Mọi nhóm có số thành viên trong [min, max]
    select exists (
      select 1 from public.groups g
      where g.project_id = p_project_id
        and (
          (select count(*) from public.group_members gm where gm.group_id = g.id) < v_project.group_size_min or
          (select count(*) from public.group_members gm where gm.group_id = g.id) > v_project.group_size_max
        )
    ) into v_group_mismatch;
    if v_group_mismatch then
      raise exception 'Cannot activate project: some groups do not satisfy group size constraints';
    end if;

    -- (4) Mọi nhóm đã khóa
    select exists (
      select 1 from public.groups g
      where g.project_id = p_project_id and g.locked_at is null
    ) into v_unlocked_groups;
    if v_unlocked_groups then
      raise exception 'Cannot activate project: all groups must be locked first';
    end if;

    -- (5) Đã chạy instantiate_group_tasks (có thẻ việc)
    select not exists (
      select 1 from public.tasks t
      join public.groups g on t.group_id = g.id
      where g.project_id = p_project_id
    ) into v_no_tasks;
    if v_no_tasks then
      raise exception 'Cannot activate project: group tasks must be instantiated first';
    end if;
  end if;

  update public.projects
  set status = p_status, updated_at = now()
  where id = p_project_id;
end;
$$;

-- 2.5 RPC: open_round(round_id)
create or replace function public.open_round(p_round_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_round public.evaluation_rounds%rowtype;
  v_unlocked_groups boolean;
  v_no_criteria boolean;
  v_invalid_levels boolean;
  v_group record;
  v_rater record;
  v_ratee record;
begin
  select * into v_round from public.evaluation_rounds where id = p_round_id for update;
  if not found then
    raise exception 'Evaluation round not found';
  end if;

  if not public.is_teacher_of_project(v_round.project_id) then
    raise exception 'Access denied: teacher only';
  end if;

  if v_round.status <> 'draft' then
    raise exception 'Round is already %', v_round.status;
  end if;

  if v_round.closes_at <= now() then
    raise exception 'closes_at must be in the future';
  end if;

  -- Nhóm đã khóa
  select exists (
    select 1 from public.groups where project_id = v_round.project_id and locked_at is null
  ) into v_unlocked_groups;
  if v_unlocked_groups then
    raise exception 'All groups must be locked before opening round';
  end if;

  -- Có ít nhất một tiêu chí
  select not exists (
    select 1 from public.bars_criteria
    where project_id = v_round.project_id or project_id is null
  ) into v_no_criteria;
  if v_no_criteria then
    raise exception 'No BARS criteria found for project';
  end if;

  -- Khởi tạo sẵn phiếu đánh giá (peer_reviews) cho các thành viên cùng nhóm
  for v_group in select id from public.groups where project_id = v_round.project_id loop
    for v_rater in select student_id from public.group_members where group_id = v_group.id loop
      for v_ratee in select student_id from public.group_members where group_id = v_group.id and student_id <> v_rater.student_id loop
        insert into public.peer_reviews (
          round_id, project_id, group_id, rater_id, ratee_id
        ) values (
          v_round.id, v_round.project_id, v_group.id, v_rater.student_id, v_ratee.student_id
        ) on conflict (round_id, rater_id, ratee_id) do nothing;
      end loop;
    end loop;
  end loop;

  update public.evaluation_rounds
  set status = 'open'
  where id = p_round_id;
end;
$$;

-- 2.6 RPC: submit_review(review_id)
create or replace function public.submit_review(p_review_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_review public.peer_reviews%rowtype;
  v_round public.evaluation_rounds%rowtype;
  v_criteria_count integer;
  v_answers_count integer;
begin
  select * into v_review from public.peer_reviews where id = p_review_id for update;
  if not found then
    raise exception 'Review not found';
  end if;

  if v_review.rater_id <> auth.uid() then
    raise exception 'Access denied: can only submit own review';
  end if;

  if v_review.submitted_at is not null then
    raise exception 'Review is already submitted';
  end if;

  select * into v_round from public.evaluation_rounds where id = v_review.round_id;
  if v_round.status <> 'open' or now() < v_round.opens_at or now() > v_round.closes_at then
    raise exception 'Round is not open for submission';
  end if;

  -- Kiểm tra đã trả lời đủ mọi tiêu chí
  select count(*) into v_criteria_count
  from public.bars_criteria
  where project_id = v_review.project_id or project_id is null;

  select count(distinct criterion_id) into v_answers_count
  from public.peer_review_answers
  where review_id = p_review_id;

  if v_answers_count < v_criteria_count then
    raise exception 'Cannot submit review: missing answers for some criteria';
  end if;

  update public.peer_reviews
  set submitted_at = now()
  where id = p_review_id;
end;
$$;

-- 2.7 RPC: finalize_round(round_id)
create or replace function public.finalize_round(p_round_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_round public.evaluation_rounds%rowtype;
  v_student record;
  v_member_count integer;
  v_reviews_expected integer;
  v_reviews_received integer;
  v_avg_score numeric(4,2);
begin
  select * into v_round from public.evaluation_rounds where id = p_round_id for update;
  if not found then
    raise exception 'Round not found';
  end if;

  if not public.is_teacher_of_project(v_round.project_id) then
    raise exception 'Access denied: teacher only';
  end if;

  -- Tính lặp an toàn (idempotency - Section 7.5)
  if v_round.status = 'closed' then
    return;
  end if;

  -- Tính điểm cho từng học sinh trong dự án
  for v_student in
    select gm.student_id, gm.group_id
    from public.group_members gm
    where gm.project_id = v_round.project_id
  loop
    select count(*) into v_member_count
    from public.group_members
    where group_id = v_student.group_id;

    v_reviews_expected := greatest(0, v_member_count - 1);

    -- Tính điểm trung bình của các phiếu đã nộp chấm cho học sinh này
    with review_scores as (
      select
        pr.id as review_id,
        round(
          sum(bc.weight * blp.points)::numeric / nullif(sum(bc.weight), 0)::numeric,
          2
        ) as review_p
      from public.peer_reviews pr
      join public.peer_review_answers pra on pr.id = pra.review_id
      join public.bars_criteria bc on pra.criterion_id = bc.id
      join public.bars_level_points blp on pra.criterion_id = blp.criterion_id and pra.level = blp.level
      where pr.round_id = p_round_id
        and pr.ratee_id = v_student.student_id
        and pr.submitted_at is not null
      group by pr.id
    )
    select
      count(*),
      case when count(*) > 0 then round(avg(review_p), 2) else null end
    into v_reviews_received, v_avg_score
    from review_scores;

    insert into public.peer_scores (
      round_id, student_id, group_id,
      score, reviews_received, reviews_expected,
      computed_at
    ) values (
      p_round_id, v_student.student_id, v_student.group_id,
      v_avg_score, v_reviews_received, v_reviews_expected,
      now()
    ) on conflict (round_id, student_id) do update set
      score = excluded.score,
      reviews_received = excluded.reviews_received,
      reviews_expected = excluded.reviews_expected,
      computed_at = excluded.computed_at;
  end loop;

  update public.evaluation_rounds
  set status = 'closed', finalized_at = now()
  where id = p_round_id;

  -- Ghi audit log
  insert into public.audit_logs (actor_id, action, target_table, target_id, detail)
  values (auth.uid(), 'round.finalize', 'evaluation_rounds', p_round_id::text, jsonb_build_object('project_id', v_round.project_id));
end;
$$;

-- 2.8 RPC: compute_final_scores(project_id, round_id)
create or replace function public.compute_final_scores(p_project_id uuid, p_round_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_project public.projects%rowtype;
  v_student record;
  v_group_score numeric(4,2);
  v_peer_score numeric(4,2);
  v_peer_missing boolean;
  v_computed numeric(4,2);
  v_snapshot jsonb;
begin
  select * into v_project from public.projects where id = p_project_id for update;
  if not found then
    raise exception 'Project not found';
  end if;

  if not public.is_teacher_of_project(p_project_id) then
    raise exception 'Access denied: teacher only';
  end if;

  -- Chỉ tính khi chưa công bố
  if exists (select 1 from public.final_scores where project_id = p_project_id and published_at is not null) then
    raise exception 'Cannot recompute scores while published. Unpublish first';
  end if;

  -- Mọi nhóm đã có điểm nhóm
  if exists (
    select 1 from public.groups g
    where g.project_id = p_project_id
      and not exists (select 1 from public.group_scores gs where gs.group_id = g.id)
  ) then
    raise exception 'Cannot compute final scores: some groups lack group_scores';
  end if;

  for v_student in
    select gm.student_id, gm.group_id
    from public.group_members gm
    where gm.project_id = p_project_id
  loop
    select score into v_group_score
    from public.group_scores
    where group_id = v_student.group_id;

    select score, (score is null) into v_peer_score, v_peer_missing
    from public.peer_scores
    where round_id = p_round_id and student_id = v_student.student_id;

    if v_peer_missing or v_peer_score is null then
      v_peer_score := null;
      v_peer_missing := true;
      v_computed := v_group_score;
    else
      v_peer_missing := false;
      v_computed := round(v_project.weight_group * v_group_score + v_project.weight_peer * v_peer_score, 2);
    end if;

    -- Chụp ảnh tiến trình (progress_snapshot) từ v_student_contribution
    select jsonb_build_object(
      'assigned_tasks', sc.assigned_tasks,
      'completed_tasks', sc.completed_tasks,
      'late_tasks', sc.late_tasks,
      'determined_tasks', sc.determined_tasks,
      'completion_rate', sc.individual_completion_rate,
      'overdue_rate', sc.individual_overdue_rate,
      'reassign_count', sc.reassign_count,
      'postpone_count', sc.postpone_count,
      'snapshot_at', now()
    ) into v_snapshot
    from public.v_student_contribution sc
    where sc.student_id = v_student.student_id and sc.project_id = p_project_id;

    insert into public.final_scores (
      project_id, student_id, group_id, round_id,
      group_score, peer_score, peer_missing,
      weight_group, weight_peer,
      progress_snapshot, computed_score,
      computed_at
    ) values (
      p_project_id, v_student.student_id, v_student.group_id, p_round_id,
      v_group_score, v_peer_score, v_peer_missing,
      v_project.weight_group, v_project.weight_peer,
      coalesce(v_snapshot, '{}'::jsonb), v_computed,
      now()
    ) on conflict (project_id, student_id) do update set
      group_id = excluded.group_id,
      round_id = excluded.round_id,
      group_score = excluded.group_score,
      peer_score = excluded.peer_score,
      peer_missing = excluded.peer_missing,
      weight_group = excluded.weight_group,
      weight_peer = excluded.weight_peer,
      progress_snapshot = excluded.progress_snapshot,
      computed_score = excluded.computed_score,
      computed_at = excluded.computed_at;

    -- Ghi score_events
    insert into public.score_events (
      project_id, student_id, event_type, actor_id,
      before_value, after_value, result_version, occurred_at
    ) values (
      p_project_id, v_student.student_id, 'computed'::public.score_event_type, auth.uid(),
      null, v_computed, 0, now()
    );
  end loop;
end;
$$;

-- 2.9 RPC: adjust_final_score(...)
create or replace function public.adjust_final_score(
  p_project_id uuid,
  p_student_id uuid,
  p_adjusted_score numeric,
  p_reason text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_score public.final_scores%rowtype;
  v_before numeric(4,2);
begin
  if not public.is_teacher_of_project(p_project_id) then
    raise exception 'Access denied: teacher only';
  end if;

  if p_adjusted_score < 0 or p_adjusted_score > 10 then
    raise exception 'Adjusted score must be between 0 and 10';
  end if;

  if char_length(btrim(p_reason)) < 10 then
    raise exception 'Adjustment reason must be at least 10 characters';
  end if;

  select * into v_score
  from public.final_scores
  where project_id = p_project_id and student_id = p_student_id
  for update;

  if not found then
    raise exception 'Final score not found';
  end if;

  if v_score.published_at is not null then
    raise exception 'Cannot adjust score while published. Unpublish first (Scenario 19)';
  end if;

  v_before := v_score.final_score;

  update public.final_scores
  set
    adjusted_score = p_adjusted_score,
    adjust_reason = btrim(p_reason),
    adjusted_by = auth.uid(),
    adjusted_at = now()
  where project_id = p_project_id and student_id = p_student_id;

  -- Ghi score_events
  insert into public.score_events (
    project_id, student_id, event_type, actor_id,
    reason, before_value, after_value, result_version, occurred_at
  ) values (
    p_project_id, p_student_id, 'adjusted'::public.score_event_type, auth.uid(),
    btrim(p_reason), v_before, p_adjusted_score, v_score.result_version, now()
  );

  -- Ghi audit_logs
  insert into public.audit_logs (actor_id, action, target_table, target_id, detail)
  values (
    auth.uid(), 'score.adjust', 'final_scores',
    p_project_id || ':' || p_student_id,
    jsonb_build_object('before', v_before, 'after', p_adjusted_score, 'reason', btrim(p_reason))
  );
end;
$$;

-- 2.10 RPC: publish_results(project_id)
create or replace function public.publish_results(p_project_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_count integer;
  v_score_count integer;
begin
  if not public.is_teacher_of_project(p_project_id) then
    raise exception 'Access denied: teacher only';
  end if;

  select count(*) into v_student_count
  from public.group_members
  where project_id = p_project_id;

  select count(*) into v_score_count
  from public.final_scores
  where project_id = p_project_id;

  if v_score_count < v_student_count or v_student_count = 0 then
    raise exception 'Cannot publish results: not all students have final scores computed';
  end if;

  update public.final_scores
  set
    published_at = now(),
    result_version = result_version + 1
  where project_id = p_project_id;

  insert into public.score_events (
    project_id, student_id, event_type, actor_id,
    result_version, occurred_at
  ) values (
    p_project_id, null, 'published'::public.score_event_type, auth.uid(),
    (select max(result_version) from public.final_scores where project_id = p_project_id),
    now()
  );

  insert into public.audit_logs (actor_id, action, target_table, target_id, detail)
  values (auth.uid(), 'score.publish', 'projects', p_project_id::text, '{}'::jsonb);
end;
$$;

-- 2.11 RPC: unpublish_results(project_id, reason)
create or replace function public.unpublish_results(p_project_id uuid, p_reason text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_teacher_of_project(p_project_id) then
    raise exception 'Access denied: teacher only';
  end if;

  if char_length(btrim(p_reason)) < 10 then
    raise exception 'Unpublish reason must be at least 10 characters';
  end if;

  if not exists (select 1 from public.final_scores where project_id = p_project_id and published_at is not null) then
    raise exception 'Scores are not currently published';
  end if;

  update public.final_scores
  set published_at = null
  where project_id = p_project_id;

  insert into public.score_events (
    project_id, student_id, event_type, actor_id,
    reason, result_version, occurred_at
  ) values (
    p_project_id, null, 'unpublished'::public.score_event_type, auth.uid(),
    btrim(p_reason),
    (select max(result_version) from public.final_scores where project_id = p_project_id),
    now()
  );

  insert into public.audit_logs (actor_id, action, target_table, target_id, detail)
  values (
    auth.uid(), 'score.unpublish', 'projects', p_project_id::text,
    jsonb_build_object('reason', btrim(p_reason))
  );
end;
$$;

-- 2.12 RPC: record_consent(...)
create or replace function public.record_consent(
  p_student_id uuid,
  p_status public.consent_status,
  p_consented_by public.consent_party,
  p_form_version text,
  p_note text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.can_manage_student(p_student_id) then
    raise exception 'Access denied: cannot manage consent for this student';
  end if;

  insert into public.research_consents (
    student_id, status, consented_by, form_version,
    recorded_by, recorded_at, note
  ) values (
    p_student_id, p_status, p_consented_by, p_form_version,
    auth.uid(), now(), p_note
  ) on conflict (student_id) do update set
    status = excluded.status,
    consented_by = excluded.consented_by,
    form_version = excluded.form_version,
    recorded_by = excluded.recorded_by,
    recorded_at = excluded.recorded_at,
    note = excluded.note;

  insert into public.research_consent_events (
    student_id, status, consented_by, form_version,
    recorded_by, recorded_at, note
  ) values (
    p_student_id, p_status, p_consented_by, p_form_version,
    auth.uid(), now(), p_note
  );
end;
$$;

-- 2.13 RPC: get_my_results(project_id)
create or replace function public.get_my_results(p_project_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_score public.final_scores%rowtype;
  v_criteria_avgs jsonb;
begin
  select * into v_score
  from public.final_scores
  where project_id = p_project_id
    and student_id = auth.uid()
    and published_at is not null;

  if not found then
    return null;
  end if;

  select coalesce(jsonb_agg(sub), '[]'::jsonb) into v_criteria_avgs
  from (
    select
      bc.id as criterion_id,
      bc.title as criterion_title,
      round(avg(blp.points), 2) as avg_points
    from public.peer_reviews pr
    join public.peer_review_answers pra on pr.id = pra.review_id
    join public.bars_criteria bc on pra.criterion_id = bc.id
      join public.bars_level_points blp on pra.criterion_id = blp.criterion_id and pra.level = blp.level
    where pr.round_id = v_score.round_id
      and pr.ratee_id = auth.uid()
      and pr.submitted_at is not null
    group by bc.id, bc.title
  ) sub;

  return jsonb_build_object(
    'final_score', v_score.final_score,
    'group_score', v_score.group_score,
    'peer_score', v_score.peer_score,
    'peer_missing', v_score.peer_missing,
    'published_at', v_score.published_at,
    'criteria_averages', v_criteria_avgs
  );
end;
$$;

-- 2.14 RPC: export_research_dataset(project_id)
create or replace function public.export_research_dataset(p_project_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_included_ids uuid[];
  v_dataset jsonb;
  v_count integer;
begin
  if not public.is_admin() then
    raise exception 'Access denied: admin only';
  end if;

  -- Chỉ lấy học sinh có consent_status = 'granted' (INV-09 / Scenario 20)
  select array_agg(rc.student_id)
  into v_included_ids
  from public.research_consents rc
  join public.group_members gm on rc.student_id = gm.student_id
  where gm.project_id = p_project_id
    and rc.status = 'granted';

  if v_included_ids is null or array_length(v_included_ids, 1) = 0 then
    return '[]'::jsonb;
  end if;

  -- Giả danh hóa: dùng sha256 HMAC sinh pseudo_id
  with pseudo_data as (
    select
      encode(hmac(fs.student_id::text, 'pbl_research_key_v1', 'sha256'), 'hex') as pseudo_student_id,
      encode(hmac(fs.group_id::text, 'pbl_research_key_v1', 'sha256'), 'hex') as pseudo_group_id,
      fs.group_score,
      fs.peer_score,
      fs.peer_missing,
      fs.computed_score,
      fs.adjusted_score,
      fs.final_score,
      fs.progress_snapshot
    from public.final_scores fs
    where fs.project_id = p_project_id
      and fs.student_id = any(v_included_ids)
  )
  select coalesce(jsonb_agg(p), '[]'::jsonb), count(*)
  into v_dataset, v_count
  from pseudo_data p;

  -- Ghi nhận lần xuất dữ liệu
  insert into public.research_exports (
    project_id, exported_by, exported_at,
    key_version, included_student_ids, row_count, note
  ) values (
    p_project_id, auth.uid(), now(),
    1, v_included_ids, v_count, 'Export dataset for project ' || p_project_id
  );

  return v_dataset;
end;
$$;

-- Thu hồi quyền từ public/anon và cấp cho authenticated
revoke execute on function public.mark_password_changed() from public, anon;
revoke execute on function public.admin_db_size() from public, anon;
revoke execute on function public.instantiate_group_tasks(uuid) from public, anon;
revoke execute on function public.set_project_status(uuid, public.project_status) from public, anon;
revoke execute on function public.open_round(uuid) from public, anon;
revoke execute on function public.submit_review(uuid) from public, anon;
revoke execute on function public.finalize_round(uuid) from public, anon;
revoke execute on function public.compute_final_scores(uuid, uuid) from public, anon;
revoke execute on function public.adjust_final_score(uuid, uuid, numeric, text) from public, anon;
revoke execute on function public.publish_results(uuid) from public, anon;
revoke execute on function public.unpublish_results(uuid, text) from public, anon;
revoke execute on function public.record_consent(uuid, public.consent_status, public.consent_party, text, text) from public, anon;
revoke execute on function public.get_my_results(uuid) from public, anon;
revoke execute on function public.export_research_dataset(uuid) from public, anon;

grant execute on function public.mark_password_changed() to authenticated;
grant execute on function public.admin_db_size() to authenticated;
grant execute on function public.instantiate_group_tasks(uuid) to authenticated;
revoke execute on function public.assign_project_member(uuid, uuid, uuid) from public, anon;
revoke execute on function public.lock_project_groups(uuid) from public, anon;
grant execute on function public.assign_project_member(uuid, uuid, uuid) to authenticated;
grant execute on function public.lock_project_groups(uuid) to authenticated;
grant execute on function public.set_project_status(uuid, public.project_status) to authenticated;
grant execute on function public.open_round(uuid) to authenticated;
grant execute on function public.submit_review(uuid) to authenticated;
grant execute on function public.finalize_round(uuid) to authenticated;
grant execute on function public.compute_final_scores(uuid, uuid) to authenticated;
grant execute on function public.adjust_final_score(uuid, uuid, numeric, text) to authenticated;
grant execute on function public.publish_results(uuid) to authenticated;
grant execute on function public.unpublish_results(uuid, text) to authenticated;
grant execute on function public.record_consent(uuid, public.consent_status, public.consent_party, text, text) to authenticated;
grant execute on function public.get_my_results(uuid) to authenticated;
grant execute on function public.export_research_dataset(uuid) to authenticated;
