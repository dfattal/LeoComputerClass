# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Project Is

**Family Classroom** — a multi-class educational platform that teaches kids through interactive Python coding lessons. Currently supports two classes:

- **Leo's Computer Class** — computer architecture from first principles (logic gates → CPU)
- **Leila's Bio Lab** — biology through code (DNA, mutations, CRISPR) *(coming soon)*

**Audience matters:** All lesson content (MDX files, AI feedback prompts, exercise descriptions) must be written for a 10-year-old. Use simple language, concrete analogies, and an encouraging tone. Avoid jargon unless it's being explicitly taught.

## Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build (also validates SSG)
npm run lint     # ESLint (no auto-fix)
npm start        # Serve production build
```

No test runner is configured. Tests are student-facing (defined in `content/classes/<class>/*/tests.json`) and run in-browser via Pyodide.

## Tech Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript** (strict)
- **Tailwind CSS v4** (PostCSS plugin, no tailwind.config file)
- **Supabase** — Auth (Google OAuth) + PostgreSQL database with RLS
- **Pyodide** — Python execution in a Web Worker (`public/pyodide-worker.js`)
- **Monaco Editor** — In-browser code editor
- **next-mdx-remote** — Compiles MDX lesson content at build time
- **OpenAI gpt-4o-mini** — AI coaching feedback on student submissions

## Architecture

### Multi-Class Structure

The app is **one platform, multiple classes, one shared engine**. Each class has its own content, syllabus, theme, and AI coaching prompt. Shared infrastructure: code editor, test runner, submission system, AI review, dashboard, admin panel.

**Class registry:** `content/classes.ts` defines all classes (slug, name, accent color, hero image, etc.). To add a new class, add an entry here and create its content directory.

### Routing

```
/                                    → Class selector (home page)
/classes/[classSlug]                → Class landing page (hero + roadmap)
/classes/[classSlug]/[lessonSlug]   → Lesson page (editor + tests + content)
/course/[week]                       → Redirects to /classes/leo/[week] (backward compat)
/dashboard                           → Student progress (all classes)
/admin                               → Instructor panel
```

App Router with Server Components by default. Pages in `app/` are server-rendered; interactive components in `components/` use `"use client"`. Lesson pages are statically generated via `generateStaticParams()`.

Path alias: `@/*` maps to project root (e.g., `@/lib/supabase/client`).

### Lesson Content Pipeline

Each lesson lives in `content/classes/<classSlug>/<lessonSlug>/` with these files:
- `lesson.mdx` — Theory (MDX, rendered server-side)
- `exercises.mdx` — Coding exercises (MDX)
- `tests.json` — Array of `TestEntry` objects: `{ entry, cases: [{name, args, expected}], constraints?: { forbidTokens } }`
- `rubric.json` — Grading criteria for AI review
- `starter.py` — (optional) Starter code for the editor

Each class also has:
- `content/classes/<classSlug>/syllabus.ts` — Phases, weeks/lessons, status
- `content/classes/<classSlug>/ai-prompt.ts` — Class-specific AI coaching system prompt

`lib/lessons/loadLesson.ts` reads these at build time. `getLessonSlugs(classSlug)` discovers lessons by scanning the class content directory.

### Auth Flow

Supabase Auth with Google OAuth. Middleware (`middleware.ts`) refreshes sessions and guards non-public routes. If Supabase env vars are missing/placeholder, middleware is bypassed (allows local dev without auth).

Three Supabase client patterns in `lib/supabase/`:
- `client.ts` — Browser client (uses anon key)
- `server.ts` → `createClient()` — Server component/route handler client (reads cookies)
- `server.ts` → `createServiceClient()` — Elevated privileges (SERVICE_ROLE_KEY, for instructor ops)

### Code Execution

Student Python code runs in a **Web Worker** via Pyodide (not on the server). The `usePyodide` hook (`lib/pyodide/usePyodide.ts`) manages the worker lifecycle. Test cases from `tests.json` are sent to the worker, which checks `forbidTokens` constraints before executing, then returns pass/fail results. 10-second timeout per execution.

### Database Schema

Four tables in Supabase (schema in `lib/supabase/schema.sql`):
- `profiles` — Extends auth.users (display_name, role: student|instructor)
- `lessons` — Lesson metadata (class_slug, week_number, slug, title). Unique on (class_slug, slug).
- `submissions` — Student code, stdout/stderr, test_results (JSONB), ai_feedback (JSONB)
- `lesson_progress` — Completion tracking per user per lesson

RLS enforces: students see only their own data; instructors see all submissions.

### UI Layout

Split-pane layout for lesson pages: lesson content on the left, code editor + output on the right. Both horizontal and vertical splits are resizable (custom `ResizeHandle`/`VerticalResizeHandle` components, no library). Split ratios persist in localStorage. Mobile collapses to stacked layout at the `lg:` breakpoint (1024px).

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL       # Supabase project URL (exposed to browser)
NEXT_PUBLIC_SUPABASE_ANON_KEY  # Supabase anon key (exposed to browser)
SUPABASE_SERVICE_ROLE_KEY      # Server-only, elevated permissions
OPENAI_API_KEY                 # For AI feedback (server-only)
```

## Adding a New Lesson (to an existing class)

1. Create `content/classes/<classSlug>/<lessonSlug>/` with `lesson.mdx`, `exercises.mdx`, `tests.json`, `rubric.json`
2. Update `content/classes/<classSlug>/syllabus.ts` — add the week/lesson entry with status `"published"`
3. The build auto-discovers it via `getLessonSlugs()` — no config changes needed
4. The dashboard auto-syncs published lessons into the `lessons` DB table on load

## Adding a New Class

1. Create `content/classes/<newSlug>/` with `syllabus.ts` and `ai-prompt.ts`
2. Add lesson directories under it
3. Add the class to `content/classes.ts` (set `comingSoon: true` until content is ready)
4. Remove `comingSoon` when lessons are published
