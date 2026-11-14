-- Registration roles, verified email signup, and atomic administrator role changes.

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
  v_requested_role text;
  v_is_active boolean;
begin
  v_requested_role := new.raw_user_meta_data->>'requested_role';

  -- raw_app_meta_data is writable only by trusted admin APIs. Public signup may
  -- request student or teacher, but a teacher account always starts inactive.
  if nullif(new.raw_app_meta_data->>'role', '') is not null then
    v_role := (new.raw_app_meta_data->>'role')::public.user_role;
    v_is_active := true;
  elsif v_requested_role = 'teacher' then
    v_role := 'teacher'::public.user_role;
    v_is_active := false;
  else
    v_role := 'student'::public.user_role;
    v_is_active := true;
  end if;

  v_username := coalesce(
    nullif(new.raw_user_meta_data->>'username', ''),
    split_part(new.email, '@', 1)
  );
  v_full_name := coalesce(
    nullif(new.raw_user_meta_data->>'full_name', ''),
    v_username
  );

  insert into public.profiles (id, role, username, full_name, is_active, must_change_password)
  values (new.id, v_role, v_username, v_full_name, v_is_active, false)
  on conflict (id) do update
  set updated_at = now();

  return new;
end;
$$;

create or replace function public.is_student_in_class(target_class_id uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.class_students cs
    join public.profiles p on p.id = cs.student_id
    where cs.class_id = target_class_id
      and cs.student_id = auth.uid()
      and p.role = 'student'
      and p.is_active = true
  );
$$;

create or replace function public.is_member_of_group(target_group_id uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.group_members gm
    join public.profiles p on p.id = gm.student_id
    where gm.group_id = target_group_id
      and gm.student_id = auth.uid()
      and p.role = 'student'
      and p.is_active = true
  );
$$;

create or replace function public.admin_update_user_role(
  p_actor_id uuid,
  p_target_id uuid,
  p_new_role public.user_role
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_target public.profiles%rowtype;
  v_old_role public.user_role;
begin
  if auth.role() <> 'service_role' then
    raise exception 'This operation must be called by a trusted server';
  end if;

  if not exists (
    select 1 from public.profiles
    where id = p_actor_id and role = 'admin' and is_active = true
  ) then
    raise exception 'Only active administrators can change user roles';
  end if;

  if p_actor_id = p_target_id then
    raise exception 'Administrators cannot change their own role';
  end if;

  select * into v_target from public.profiles where id = p_target_id for update;
  if not found then
    raise exception 'User profile not found';
  end if;

  v_old_role := v_target.role;
  if v_old_role = p_new_role then
    return;
  end if;

  if v_target.is_active and v_old_role = 'admin' and p_new_role <> 'admin'
     and (select count(*) from public.profiles where role = 'admin' and is_active = true) <= 1 then
    raise exception 'At least one active administrator must remain';
  end if;

  if v_old_role = 'teacher' and p_new_role <> 'teacher'
     and exists (select 1 from public.classes where teacher_id = p_target_id and archived_at is null) then
    raise exception 'Transfer or archive this teacher’s active classes before changing the role';
  end if;

  update public.profiles
  set role = p_new_role,
      student_code = case when p_new_role = 'student' then student_code else null end,
      staff_code = case when p_new_role = 'teacher' then staff_code else null end,
      updated_at = now()
  where id = p_target_id;

  update auth.users
  set raw_app_meta_data = jsonb_set(coalesce(raw_app_meta_data, '{}'::jsonb), '{role}', to_jsonb(p_new_role::text), true),
      raw_user_meta_data = jsonb_set(coalesce(raw_user_meta_data, '{}'::jsonb), '{role}', to_jsonb(p_new_role::text), true),
      updated_at = now()
  where id = p_target_id;

  insert into public.audit_logs (actor_id, action, target_table, target_id, detail)
  values (p_actor_id, 'user.role_changed', 'profiles', p_target_id::text,
    jsonb_build_object('from', v_old_role, 'to', p_new_role));
end;
$$;

create or replace function public.admin_set_user_active(
  p_actor_id uuid,
  p_target_id uuid,
  p_is_active boolean
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_target public.profiles%rowtype;
begin
  if auth.role() <> 'service_role' then
    raise exception 'This operation must be called by a trusted server';
  end if;

  if not exists (
    select 1 from public.profiles
    where id = p_actor_id and role = 'admin' and is_active = true
  ) then
    raise exception 'Only active administrators can change account status';
  end if;

  if p_actor_id = p_target_id then
    raise exception 'Administrators cannot change their own account status';
  end if;

  select * into v_target from public.profiles where id = p_target_id for update;
  if not found then
    raise exception 'User profile not found';
  end if;

  if v_target.is_active = p_is_active then
    return;
  end if;

  if v_target.role = 'admin' and v_target.is_active and not p_is_active
     and (select count(*) from public.profiles where role = 'admin' and is_active = true) <= 1 then
    raise exception 'At least one active administrator must remain';
  end if;

  update public.profiles set is_active = p_is_active, updated_at = now() where id = p_target_id;
  insert into public.audit_logs (actor_id, action, target_table, target_id, detail)
  values (p_actor_id, 'user.status_changed', 'profiles', p_target_id::text,
    jsonb_build_object('is_active', p_is_active));
end;
$$;

revoke all on function public.admin_update_user_role(uuid, uuid, public.user_role) from public, anon, authenticated;
revoke all on function public.admin_set_user_active(uuid, uuid, boolean) from public, anon, authenticated;
grant execute on function public.admin_update_user_role(uuid, uuid, public.user_role) to service_role;
grant execute on function public.admin_set_user_active(uuid, uuid, boolean) to service_role;
