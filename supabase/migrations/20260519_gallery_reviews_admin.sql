create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'viewer' check (role in ('viewer', 'admin')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'viewer')
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create table if not exists public.gallery_photos (
  id uuid primary key default gen_random_uuid(),
  category_id text not null check (category_id in ('wedding', 'bar-mitzvah', 'brit')),
  label text not null,
  file_url text not null,
  alt text,
  sort_order integer not null default 100,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  event_date date,
  quote text not null check (char_length(quote) between 10 and 900),
  rating integer not null default 5 check (rating between 1 and 5),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.gallery_photos enable row level security;
alter table public.reviews enable row level security;

drop policy if exists "Profiles: users can read own profile" on public.profiles;
create policy "Profiles: users can read own profile"
on public.profiles for select
to authenticated
using (id = auth.uid());

drop policy if exists "Profiles: admins can read profiles" on public.profiles;
create policy "Profiles: admins can read profiles"
on public.profiles for select
to authenticated
using (public.is_admin());

drop policy if exists "Gallery: public active read" on public.gallery_photos;
create policy "Gallery: public active read"
on public.gallery_photos for select
to anon, authenticated
using (is_active = true);

drop policy if exists "Gallery: admin all" on public.gallery_photos;
create policy "Gallery: admin all"
on public.gallery_photos for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Reviews: public approved read" on public.reviews;
create policy "Reviews: public approved read"
on public.reviews for select
to anon, authenticated
using (status = 'approved' or public.is_admin());

drop policy if exists "Reviews: visitors submit pending" on public.reviews;
create policy "Reviews: visitors submit pending"
on public.reviews for insert
to anon, authenticated
with check (status = 'pending');

drop policy if exists "Reviews: admin all" on public.reviews;
create policy "Reviews: admin all"
on public.reviews for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true)
on conflict (id) do update set public = true;

drop policy if exists "Storage gallery public read" on storage.objects;
create policy "Storage gallery public read"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'gallery');

drop policy if exists "Storage gallery admin upload" on storage.objects;
create policy "Storage gallery admin upload"
on storage.objects for insert
to authenticated
with check (bucket_id = 'gallery' and public.is_admin());

drop policy if exists "Storage gallery admin update" on storage.objects;
create policy "Storage gallery admin update"
on storage.objects for update
to authenticated
using (bucket_id = 'gallery' and public.is_admin())
with check (bucket_id = 'gallery' and public.is_admin());

drop policy if exists "Storage gallery admin delete" on storage.objects;
create policy "Storage gallery admin delete"
on storage.objects for delete
to authenticated
using (bucket_id = 'gallery' and public.is_admin());
