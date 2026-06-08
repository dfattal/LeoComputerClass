-- Run this in the Supabase SQL Editor

-- Profiles table (linked to auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text not null default 'student',
  created_at timestamptz not null default now()
);

-- Lessons table
create table if not exists lessons (
  id uuid primary key default gen_random_uuid(),
  class_slug text not null default 'leo',
  week_number int not null,
  slug text not null,
  title text not null,
  created_at timestamptz not null default now(),
  unique(class_slug, slug),
  unique(class_slug, week_number)
);

-- Submissions table
create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  lesson_id uuid not null references lessons(id) on delete cascade,
  code text not null,
  stdout text,
  stderr text,
  test_results jsonb,
  ai_feedback jsonb,
  instructor_feedback text,
  status text not null default 'submitted',
  created_at timestamptz not null default now()
);

-- Lesson progress table
create table if not exists lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  lesson_id uuid not null references lessons(id) on delete cascade,
  is_complete boolean not null default false,
  completed_at timestamptz,
  unique(user_id, lesson_id)
);

-- Drafts table: in-progress (unsubmitted) code, auto-saved as the student types.
-- One row per (user, lesson), upserted on each save. Cleared once submitted.
create table if not exists drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  lesson_id uuid not null references lessons(id) on delete cascade,
  code text not null,
  updated_at timestamptz not null default now(),
  unique(user_id, lesson_id)
);

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table lessons enable row level security;
alter table submissions enable row level security;
alter table lesson_progress enable row level security;
alter table drafts enable row level security;

-- Profiles policies
create policy "Users can read own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Instructors can read all profiles"
  on profiles for select
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'instructor')
  );

-- Lessons policies (readable by all authenticated)
create policy "Authenticated users can read lessons"
  on lessons for select
  to authenticated
  using (true);

-- Submissions policies
create policy "Users can insert own submissions"
  on submissions for insert
  with check (auth.uid() = user_id);

create policy "Users can read own submissions"
  on submissions for select
  using (auth.uid() = user_id);

create policy "Instructors can read all submissions"
  on submissions for select
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'instructor')
  );

create policy "Instructors can update submissions"
  on submissions for update
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'instructor')
  );

-- Lesson progress policies
create policy "Users can manage own progress"
  on lesson_progress for all
  using (auth.uid() = user_id);

create policy "Instructors can read all progress"
  on lesson_progress for select
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'instructor')
  );

create policy "Instructors can update progress"
  on lesson_progress for update
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'instructor')
  );

-- Drafts policies
create policy "Users can manage own drafts"
  on drafts for all
  using (auth.uid() = user_id);

create policy "Instructors can read all drafts"
  on drafts for select
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'instructor')
  );

-- Shared games (the /arcade public share route — see migration-shared-games.sql).
-- A published snapshot of a student's Game Studio game, openable by anyone.
create table if not exists shared_games (
  id text primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  class_slug text not null,
  lesson_slug text not null,
  title text,
  code text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, class_slug, lesson_slug)
);

alter table shared_games enable row level security;

-- PUBLIC read so logged-out visitors can open a shared link.
create policy "Anyone can read shared games"
  on shared_games for select
  using (true);

create policy "Users can insert own shared games"
  on shared_games for insert
  with check (auth.uid() = user_id);

create policy "Users can update own shared games"
  on shared_games for update
  using (auth.uid() = user_id);

create policy "Users can delete own shared games"
  on shared_games for delete
  using (auth.uid() = user_id);

-- Seed initial lessons (keep in sync with content/classes/leo/syllabus.ts published weeks)
insert into lessons (class_slug, week_number, slug, title) values
  ('leo', 1, 'week-01', 'Boolean Algebra & Truth Tables'),
  ('leo', 2, 'week-02', 'Gates as Circuits'),
  ('leo', 3, 'week-03', 'Binary Numbers & The Half Adder'),
  ('leo', 4, 'week-04', 'Full Adder, Ripple-Carry & Subtraction'),
  ('leo', 5, 'week-05', 'Latches & Flip-Flops'),
  ('leo', 6, 'week-06', 'Registers & Register File')
on conflict (class_slug, slug) do nothing;

-- Create a trigger to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, role)
  values (new.id, new.raw_user_meta_data->>'display_name', 'student');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Migration for existing databases:
-- ALTER TABLE lessons ADD COLUMN class_slug text NOT NULL DEFAULT 'leo';
-- ALTER TABLE lessons DROP CONSTRAINT IF EXISTS lessons_week_number_key;
-- ALTER TABLE lessons DROP CONSTRAINT IF EXISTS lessons_slug_key;
-- ALTER TABLE lessons ADD CONSTRAINT lessons_class_slug_unique UNIQUE (class_slug, slug);
-- ALTER TABLE lessons ADD CONSTRAINT lessons_class_week_unique UNIQUE (class_slug, week_number);

-- Migration to add the drafts table to an existing database (run as one block):
-- create table if not exists drafts (
--   id uuid primary key default gen_random_uuid(),
--   user_id uuid not null references profiles(id) on delete cascade,
--   lesson_id uuid not null references lessons(id) on delete cascade,
--   code text not null,
--   updated_at timestamptz not null default now(),
--   unique(user_id, lesson_id)
-- );
-- alter table drafts enable row level security;
-- create policy "Users can manage own drafts" on drafts for all using (auth.uid() = user_id);
-- create policy "Instructors can read all drafts" on drafts for select
--   using (exists (select 1 from profiles where id = auth.uid() and role = 'instructor'));
