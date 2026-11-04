-- [DB] Hàm hỗ trợ phân quyền và trigger nghiệp vụ bảo toàn dữ liệu · tài liệu mục 4.4 và 7.4

-- ============================================================================
-- 1. CÁC HÀM HỖ TRỢ PHÂN QUYỀN (SECURITY DEFINER, STABLE)
-- ============================================================================

-- 1.1 Lấy vai trò của người dùng hiện hành từ profiles
create or replace function public.auth_role()
returns public.user_role
language sql
security definer
stable
set search_path = ''
as $$
  select role from public.profiles
  where id = auth.uid() and is_active = true;
$$;

-- 1.2 Kiểm tra người dùng có phải admin không
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and is_active = true
  );
$$;

-- 1.3 Kiểm tra người dùng có phải giáo viên phụ trách lớp không
create or replace function public.is_teacher_of_class(target_class_id uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.classes
    where id = target_class_id and teacher_id = auth.uid()
  );
$$;

-- 1.4 Kiểm tra người dùng có phải giáo viên phụ trách dự án không
create or replace function public.is_teacher_of_project(target_project_id uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.projects p
    join public.classes c on p.class_id = c.id
    where p.id = target_project_id and c.teacher_id = auth.uid()
  );
$$;

-- 1.5 Kiểm tra người dùng có phải học sinh trong lớp không
create or replace function public.is_student_in_class(target_class_id uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.class_students
    where class_id = target_class_id and student_id = auth.uid()
  );
$$;

-- 1.6 Kiểm tra người dùng có phải thành viên của nhóm không
create or replace function public.is_member_of_group(target_group_id uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.group_members
    where group_id = target_group_id and student_id = auth.uid()
  );
$$;

-- 1.7 Kiểm tra dự án có đang chạy (status = 'active') không
create or replace function public.project_is_active(target_project_id uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.projects
    where id = target_project_id and status = 'active'
  );
$$;

-- 1.8 Kiểm tra điểm cuối đã được công bố cho học sinh trong dự án chưa
create or replace function public.results_published(target_project_id uuid, target_student_id uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.final_scores
    where project_id = target_project_id
      and student_id = target_student_id
      and published_at is not null
  );
$$;

-- 1.9 Kiểm tra quyền quản lý học sinh (admin hoặc giáo viên dạy lớp của học sinh)
create or replace function public.can_manage_student(target_student_id uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and is_active = true
  ) or exists (
    select 1 from public.class_students cs
    join public.classes c on cs.class_id = c.id
    where cs.student_id = target_student_id and c.teacher_id = auth.uid()
  );
$$;

-- Thu hồi quyền thực thi từ public và anon, cấp cho authenticated
revoke execute on function public.auth_role() from public, anon;
revoke execute on function public.is_admin() from public, anon;
revoke execute on function public.is_teacher_of_class(uuid) from public, anon;
revoke execute on function public.is_teacher_of_project(uuid) from public, anon;
revoke execute on function public.is_student_in_class(uuid) from public, anon;
revoke execute on function public.is_member_of_group(uuid) from public, anon;
revoke execute on function public.project_is_active(uuid) from public, anon;
revoke execute on function public.results_published(uuid, uuid) from public, anon;
revoke execute on function public.can_manage_student(uuid) from public, anon;

grant execute on function public.auth_role() to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_teacher_of_class(uuid) to authenticated;
grant execute on function public.is_teacher_of_project(uuid) to authenticated;
grant execute on function public.is_student_in_class(uuid) to authenticated;
grant execute on function public.is_member_of_group(uuid) to authenticated;
grant execute on function public.project_is_active(uuid) to authenticated;
grant execute on function public.results_published(uuid, uuid) to authenticated;
grant execute on function public.can_manage_student(uuid) to authenticated;

-- ============================================================================
-- 2. TRIGGER TỰ ĐỘNG CẬP NHẬT updated_at
-- ============================================================================

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

drop trigger if exists trg_learning_requirements_updated_at on public.learning_requirements;
create trigger trg_learning_requirements_updated_at
  before update on public.learning_requirements
  for each row execute function public.handle_updated_at();

drop trigger if exists trg_projects_updated_at on public.projects;
create trigger trg_projects_updated_at
  before update on public.projects
  for each row execute function public.handle_updated_at();

drop trigger if exists trg_tasks_updated_at on public.tasks;
create trigger trg_tasks_updated_at
  before update on public.tasks
  for each row execute function public.handle_updated_at();

-- ============================================================================
-- 3. TRIGGER BẢO VỆ PROFILES (Chặn tự sửa role, status hoặc id)
-- ============================================================================

create or replace function public.guard_profile_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (old.role is distinct from new.role or old.is_active is distinct from new.is_active or old.id is distinct from new.id) then
    if not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin' and is_active = true) then
      raise exception 'Only administrators can update role, status or id of user profiles';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_guard_profile_update on public.profiles;
create trigger trg_guard_profile_update
  before update on public.profiles
  for each row execute function public.guard_profile_update();

-- ============================================================================
-- 4. TRIGGER BẢO VỆ VÀ GHI NHẬT KÝ THẺ KANBAN (tasks -> task_events)
-- ============================================================================

-- 4.1 Trigger BEFORE trên tasks: kiểm tra ràng buộc & quản lý completed_at
create or replace function public.handle_task_before_write()
returns trigger
language plpgsql
as $$
begin
  -- 1. Chặn UPDATE completed_at trực tiếp nếu không phải do chuyển sang done
  if tg_op = 'UPDATE' and new.completed_at is distinct from old.completed_at then
    if new.status = old.status then
      raise exception 'completed_at cannot be updated directly (INV-01 / Scenario 2)';
    end if;
  end if;

  -- 2. Tự động cập nhật completed_at theo trạng thái
  if new.status = 'done' and (tg_op = 'INSERT' or old.status <> 'done') then
    new.completed_at := coalesce(new.completed_at, now());
  elsif new.status <> 'done' and (tg_op = 'UPDATE' and old.status = 'done') then
    new.completed_at := null;
  end if;

  -- 3. Chuyển sang doing bắt buộc phải có người phụ trách (assignee_id)
  if new.status = 'doing' and new.assignee_id is null then
    raise exception 'Cannot set task to doing without an assignee (Scenario 3)';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_tasks_before_write on public.tasks;
create trigger trg_tasks_before_write
  before insert or update on public.tasks
  for each row execute function public.handle_task_before_write();

-- 4.2 Trigger AFTER trên tasks: tự động ghi 4 tham số vào task_events
create or replace function public.handle_task_after_write()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid;
begin
  v_actor_id := coalesce(auth.uid(), new.assignee_id, new.created_by);

  if tg_op = 'INSERT' then
    insert into public.task_events (
      task_id, actor_id, event_type,
      from_status, to_status,
      from_assignee_id, to_assignee_id,
      from_due_at, to_due_at,
      detail, occurred_at
    ) values (
      new.id, v_actor_id, 'created'::public.task_event_type,
      null, new.status,
      null, new.assignee_id,
      null, new.due_at,
      jsonb_build_object('title', new.title),
      now()
    );
  elsif tg_op = 'UPDATE' then
    -- Ghi nhận chuyển trạng thái
    if old.status is distinct from new.status then
      insert into public.task_events (
        task_id, actor_id, event_type,
        from_status, to_status,
        from_assignee_id, to_assignee_id,
        from_due_at, to_due_at,
        detail, occurred_at
      ) values (
        new.id, v_actor_id, 'status_changed'::public.task_event_type,
        old.status, new.status,
        old.assignee_id, new.assignee_id,
        old.due_at, new.due_at,
        '{}'::jsonb,
        now()
      );
    end if;

    -- Ghi nhận đổi người phụ trách
    if old.assignee_id is distinct from new.assignee_id then
      insert into public.task_events (
        task_id, actor_id, event_type,
        from_status, to_status,
        from_assignee_id, to_assignee_id,
        from_due_at, to_due_at,
        detail, occurred_at
      ) values (
        new.id, v_actor_id, 'reassigned'::public.task_event_type,
        old.status, new.status,
        old.assignee_id, new.assignee_id,
        old.due_at, new.due_at,
        '{}'::jsonb,
        now()
      );
    end if;

    -- Ghi nhận dời hạn chót
    if old.due_at is distinct from new.due_at then
      insert into public.task_events (
        task_id, actor_id, event_type,
        from_status, to_status,
        from_assignee_id, to_assignee_id,
        from_due_at, to_due_at,
        detail, occurred_at
      ) values (
        new.id, v_actor_id, 'due_date_changed'::public.task_event_type,
        old.status, new.status,
        old.assignee_id, new.assignee_id,
        old.due_at, new.due_at,
        '{}'::jsonb,
        now()
      );
    end if;

    -- Ghi nhận lưu trữ thẻ
    if old.archived_at is null and new.archived_at is not null then
      insert into public.task_events (
        task_id, actor_id, event_type,
        from_status, to_status,
        from_assignee_id, to_assignee_id,
        from_due_at, to_due_at,
        detail, occurred_at
      ) values (
        new.id, v_actor_id, 'archived'::public.task_event_type,
        old.status, new.status,
        old.assignee_id, new.assignee_id,
        old.due_at, new.due_at,
        '{}'::jsonb,
        now()
      );
    end if;

    -- Ghi nhận đổi tiêu đề hoặc mô tả
    if old.title is distinct from new.title or old.description is distinct from new.description then
      insert into public.task_events (
        task_id, actor_id, event_type,
        from_status, to_status,
        from_assignee_id, to_assignee_id,
        from_due_at, to_due_at,
        detail, occurred_at
      ) values (
        new.id, v_actor_id, 'title_or_desc_changed'::public.task_event_type,
        old.status, new.status,
        old.assignee_id, new.assignee_id,
        old.due_at, new.due_at,
        jsonb_build_object('title', new.title),
        now()
      );
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_tasks_after_write on public.tasks;
create trigger trg_tasks_after_write
  after insert or update on public.tasks
  for each row execute function public.handle_task_after_write();

-- ============================================================================
-- 5. TRIGGER BẢO VỆ BẢNG CHỈ GHI THÊM (forbid_mutation)
-- ============================================================================

create or replace function public.forbid_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'Mutations (UPDATE/DELETE) are strictly prohibited on append-only table %', tg_table_name;
end;
$$;

drop trigger if exists trg_forbid_mutation_task_events on public.task_events;
create trigger trg_forbid_mutation_task_events
  before update or delete on public.task_events
  for each row execute function public.forbid_mutation();

drop trigger if exists trg_forbid_mutation_score_events on public.score_events;
create trigger trg_forbid_mutation_score_events
  before update or delete on public.score_events
  for each row execute function public.forbid_mutation();

drop trigger if exists trg_forbid_mutation_research_consent_events on public.research_consent_events;
create trigger trg_forbid_mutation_research_consent_events
  before update or delete on public.research_consent_events
  for each row execute function public.forbid_mutation();

drop trigger if exists trg_forbid_mutation_research_exports on public.research_exports;
create trigger trg_forbid_mutation_research_exports
  before update or delete on public.research_exports
  for each row execute function public.forbid_mutation();

drop trigger if exists trg_forbid_mutation_audit_logs on public.audit_logs;
create trigger trg_forbid_mutation_audit_logs
  before update or delete on public.audit_logs
  for each row execute function public.forbid_mutation();

-- ============================================================================
-- 6. RÀNG BUỘC BẤT BIẾN KHI ĐÃ CÔNG BỐ ĐIỂM (INV-06 & INV-08)
-- ============================================================================

-- 6.1 Chặn sửa group_scores nếu nhóm đã có điểm cuối đang công bố
create or replace function public.guard_group_score_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (
    select 1 from public.final_scores
    where group_id = new.group_id and published_at is not null
  ) then
    raise exception 'Cannot update group score: final scores for this group are already published (INV-06 / Scenario 17)';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_guard_group_score_update on public.group_scores;
create trigger trg_guard_group_score_update
  before update on public.group_scores
  for each row execute function public.guard_group_score_update();

-- 6.2 Chặn sửa final_scores khi điểm đang được công bố
create or replace function public.guard_final_score_update()
returns trigger
language plpgsql
as $$
begin
  if old.published_at is not null and (
    new.computed_score is distinct from old.computed_score or
    new.adjusted_score is distinct from old.adjusted_score or
    new.group_score is distinct from old.group_score or
    new.peer_score is distinct from old.peer_score
  ) then
    raise exception 'Cannot modify scores while published. Unpublish first (INV-06, INV-08)';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_guard_final_score_update on public.final_scores;
create trigger trg_guard_final_score_update
  before update on public.final_scores
  for each row execute function public.guard_final_score_update();
