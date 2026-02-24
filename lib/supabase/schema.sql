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
  week_number int not null unique,
  slug text not null unique,
  title text not null,
  created_at timestamptz not null default now()
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

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table lessons enable row level security;
alter table submissions enable row level security;
alter table lesson_progress enable row level security;

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

-- Seed initial lessons
insert into lessons (week_number, slug, title) values
  (1, 'week-01', 'Boolean Algebra & Truth Tables'),
  (2, 'week-02', 'Gates as Circuits')
on conflict (slug) do nothing;

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
