-- Migration: public "shared games" for Leo's Game Studio (the /arcade share route).
--
-- A student can publish their finished JavaScript game (e.g. lesson-08 Breakout)
-- to a stable public URL — /arcade/<id> — that anyone can open WITHOUT logging in
-- and play full-screen. This table holds a snapshot of the code + which lesson's
-- preview config to run it with.
--
-- Apply this against the production database the same way migration-multiclass.sql
-- and the drafts table were applied (Supabase SQL editor / psql).

create table if not exists shared_games (
  id text primary key,                       -- short, URL-safe share id (generated in /api/share)
  user_id uuid not null references profiles(id) on delete cascade,
  class_slug text not null,                  -- e.g. "leo-games"
  lesson_slug text not null,                 -- e.g. "lesson-08" — selects the js.json preview config
  title text,                                -- optional display title for the shared page
  code text not null,                        -- a snapshot of the student's game code
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- One stable share per student per lesson, so re-publishing keeps the same link.
  unique(user_id, class_slug, lesson_slug)
);

alter table shared_games enable row level security;

-- PUBLIC read: anyone (even logged-out visitors) can open a shared game by its link.
create policy "Anyone can read shared games"
  on shared_games for select
  using (true);

-- Only the owner can create / update / delete their own shares.
create policy "Users can insert own shared games"
  on shared_games for insert
  with check (auth.uid() = user_id);

create policy "Users can update own shared games"
  on shared_games for update
  using (auth.uid() = user_id);

create policy "Users can delete own shared games"
  on shared_games for delete
  using (auth.uid() = user_id);
