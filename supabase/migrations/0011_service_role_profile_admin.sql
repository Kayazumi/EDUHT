-- [DB] Cho phép tác vụ máy chủ tin cậy đồng bộ role của hồ sơ sau khi tạo Auth user.
create or replace function public.guard_profile_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.role() = 'service_role' then
    return new;
  end if;

  if (old.role is distinct from new.role or old.is_active is distinct from new.is_active or old.id is distinct from new.id) then
    if not exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin' and is_active = true
    ) then
      raise exception 'Only administrators can update role, status or id of user profiles';
    end if;
  end if;
  return new;
end;
$$;
