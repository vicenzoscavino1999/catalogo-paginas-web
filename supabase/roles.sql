create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique,
  role text not null default 'viewer' check (role in ('viewer', 'editor', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'viewer')
  on conflict (id) do update
    set email = excluded.email;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;

create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute procedure public.handle_new_user_profile();

create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);
