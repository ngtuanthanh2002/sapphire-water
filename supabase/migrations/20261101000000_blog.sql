-- Sapphire Water — blog schema.
-- Safe to run more than once: paste into the SQL Editor or use `supabase db push`.

-- ===== ADMINS =====
-- Only accounts listed here may write. Visitors never sign in, so a Supabase
-- account alone grants nothing.
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

-- SECURITY DEFINER so policies can read admin_users, which has no policies
-- of its own and stays invisible through the API.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users where user_id = (select auth.uid())
  );
$$;

revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ===== POSTS =====
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null
    check (char_length(btrim(title)) between 1 and 200),
  excerpt text not null default ''
    check (char_length(excerpt) <= 400),
  cover_url text,
  category text not null default 'tin-tuc'
    check (category in ('tin-tuc', 'sapphire')),
  content_html text not null default '',
  reading_minutes integer not null default 1
    check (reading_minutes >= 1),
  status text not null default 'draft'
    check (status in ('draft', 'published')),
  like_count integer not null default 0
    check (like_count >= 0),
  author_id uuid default auth.uid() references auth.users (id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint posts_published_has_date
    check (status = 'draft' or published_at is not null)
);

create index if not exists posts_status_published_at_idx
  on public.posts (status, published_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

alter table public.posts enable row level security;

drop policy if exists "posts: read published" on public.posts;
create policy "posts: read published"
  on public.posts for select
  to anon, authenticated
  using (status = 'published' or (select public.is_admin()));

drop policy if exists "posts: admin insert" on public.posts;
create policy "posts: admin insert"
  on public.posts for insert
  to authenticated
  with check ((select public.is_admin()));

drop policy if exists "posts: admin update" on public.posts;
create policy "posts: admin update"
  on public.posts for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "posts: admin delete" on public.posts;
create policy "posts: admin delete"
  on public.posts for delete
  to authenticated
  using ((select public.is_admin()));

-- ===== COMMENTS =====
-- Anyone may comment on a published post. Only a display name is kept:
-- every comment is publicly readable, so nothing private belongs here.
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  author_name text not null
    check (char_length(btrim(author_name)) between 1 and 80),
  body text not null
    check (char_length(btrim(body)) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists comments_post_id_created_at_idx
  on public.comments (post_id, created_at);

alter table public.comments enable row level security;

drop policy if exists "comments: read on published posts" on public.comments;
create policy "comments: read on published posts"
  on public.comments for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.posts p
      where p.id = comments.post_id and p.status = 'published'
    )
    or (select public.is_admin())
  );

drop policy if exists "comments: write on published posts" on public.comments;
create policy "comments: write on published posts"
  on public.comments for insert
  to anon, authenticated
  with check (
    exists (
      select 1 from public.posts p
      where p.id = comments.post_id and p.status = 'published'
    )
  );

drop policy if exists "comments: admin delete" on public.comments;
create policy "comments: admin delete"
  on public.comments for delete
  to authenticated
  using ((select public.is_admin()));

-- ===== LIKES =====
-- Visitors have no account, so likes are a counter. Going through this
-- function keeps them away from every other column on posts.
create or replace function public.set_post_like(p_post_id uuid, p_liked boolean)
returns integer
language sql
security definer
set search_path = ''
as $$
  update public.posts
  set like_count = greatest(like_count + case when p_liked then 1 else -1 end, 0),
      updated_at = updated_at
  where id = p_post_id and status = 'published'
  returning like_count;
$$;

revoke execute on function public.set_post_like(uuid, boolean) from public;
grant execute on function public.set_post_like(uuid, boolean) to anon, authenticated;

-- ===== API GRANTS =====
-- Stated explicitly: newer Supabase projects don't expose new tables to the
-- Data API by default. RLS above still decides which rows each role reaches.
grant usage on schema public to anon, authenticated;
grant select on public.posts to anon, authenticated;
grant insert, update, delete on public.posts to authenticated;
grant select on public.comments to anon, authenticated;
grant insert (post_id, author_name, body) on public.comments to anon, authenticated;
grant delete on public.comments to authenticated;

-- ===== IMAGE STORAGE =====
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'blog-images',
  'blog-images',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- The bucket is public, so reading needs no policy for visitors.
drop policy if exists "blog images: admin read" on storage.objects;
create policy "blog images: admin read"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'blog-images' and (select public.is_admin()));

drop policy if exists "blog images: admin upload" on storage.objects;
create policy "blog images: admin upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'blog-images' and (select public.is_admin()));

drop policy if exists "blog images: admin update" on storage.objects;
create policy "blog images: admin update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'blog-images' and (select public.is_admin()));

drop policy if exists "blog images: admin delete" on storage.objects;
create policy "blog images: admin delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'blog-images' and (select public.is_admin()));
