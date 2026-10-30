-- Run in the chosen Supabase project's SQL editor. Uses existing Supabase Auth.
create table if not exists public.learning_progress (
 user_id uuid primary key references auth.users(id) on delete cascade,
 payload jsonb not null,
 revision bigint not null default 1,
 updated_at timestamptz not null default now(),
 constraint payload_size check (octet_length(payload::text) < 2000000)
);
alter table public.learning_progress enable row level security;
revoke all on public.learning_progress from anon, authenticated;
grant select on public.learning_progress to authenticated;
drop policy if exists own_progress on public.learning_progress;
create policy own_progress on public.learning_progress for select to authenticated using ((select auth.uid())=user_id);
-- Atomic optimistic update: stale devices cannot overwrite a newer revision.
create or replace function public.save_learning_progress(expected_revision bigint, new_payload jsonb)
returns setof public.learning_progress language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid();
begin
 if uid is null then raise exception 'not_authenticated'; end if;
 if expected_revision=0 then
  return query insert into public.learning_progress(user_id,payload) values(uid,new_payload)
   on conflict(user_id) do nothing returning *;
 else
  return query update public.learning_progress set payload=new_payload,revision=revision+1,updated_at=now()
   where user_id=uid and revision=expected_revision returning *;
 end if;
end;
$$;
revoke all on function public.save_learning_progress(bigint,jsonb) from public,anon;
grant execute on function public.save_learning_progress(bigint,jsonb) to authenticated;
-- Required for in-app account deletion. Cascades to the progress row.
create or replace function public.delete_my_account()
returns void language plpgsql security definer set search_path = '' as $$
begin
 if auth.uid() is null then raise exception 'not_authenticated'; end if;
 delete from auth.users where id=auth.uid();
end;
$$;
revoke all on function public.delete_my_account() from public,anon;
grant execute on function public.delete_my_account() to authenticated;
