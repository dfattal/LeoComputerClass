-- Migration: Add multi-class support to lessons table
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard/project/nxmhstiadopcphrkgxxl/sql)

-- Step 1: Add class_slug column (existing rows get 'leo')
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS class_slug text NOT NULL DEFAULT 'leo';

-- Step 2: Drop old unique constraints
ALTER TABLE lessons DROP CONSTRAINT IF EXISTS lessons_week_number_key;
ALTER TABLE lessons DROP CONSTRAINT IF EXISTS lessons_slug_key;

-- Step 3: Add new composite unique constraints
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'lessons_class_slug_unique'
  ) THEN
    ALTER TABLE lessons ADD CONSTRAINT lessons_class_slug_unique UNIQUE (class_slug, slug);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'lessons_class_week_unique'
  ) THEN
    ALTER TABLE lessons ADD CONSTRAINT lessons_class_week_unique UNIQUE (class_slug, week_number);
  END IF;
END $$;

-- Verify
SELECT class_slug, slug, title FROM lessons ORDER BY class_slug, week_number;
