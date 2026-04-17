create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  credits integer not null default 10,
  plan text not null default 'free',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create table public.images (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  prompt text not null,
  image_url text not null,
  is_public boolean not null default false,
  remix_of uuid references public.images(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.images enable row level security;

create policy "Public images viewable by everyone"
  on public.images for select using (is_public = true or auth.uid() = user_id);

create policy "Users insert own images"
  on public.images for insert with check (auth.uid() = user_id);

create policy "Users update own images"
  on public.images for update using (auth.uid() = user_id);

create policy "Users delete own images"
  on public.images for delete using (auth.uid() = user_id);

create index images_user_id_idx on public.images(user_id, created_at desc);
create index images_public_idx on public.images(is_public, created_at desc) where is_public = true;