# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Project Is

"Build a Computer From Physics" — an educational platform that teaches a 10-year-old (Leo) computer architecture from first principles through interactive Python coding lessons. Students progress week by week, building logic gates, then arithmetic circuits, all the way up toward a working computer.

**Audience matters:** All lesson content (MDX files, AI feedback prompts, exercise descriptions) must be written for a 10-year-old. Use simple language, concrete analogies, and an encouraging tone. Avoid jargon unless it's being explicitly taught.

## Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build (also validates SSG)
npm run lint     # ESLint (no auto-fix)
npm start        # Serve production build
```

No test runner is configured. Tests are student-facing (defined in `content/week-XX/tests.json`) and run in-browser via Pyodide.

## Tech Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript** (strict)
- **Tailwind CSS v4** (PostCSS plugin, no tailwind.config file)
- **Supabase** — Auth (Google OAuth) + PostgreSQL database with RLS
- **Pyodide** — Python execution in a Web Worker (`public/pyodide-worker.js`)
- **Monaco Editor** — In-browser code editor
- **next-mdx-remote** — Compiles MDX lesson content at build time
- **OpenAI gpt-4o-mini** — AI coaching feedback on student submissions

## Architecture

### Routing & Rendering

App Router with Server Components by default. Pages in `app/` are server-rendered; interactive components in `components/` use `"use client"`. Course pages (`app/course/[week]/page.tsx`) are statically generated via `generateStaticParams()`.

Path alias: `@/*` maps to project root (e.g., `@/lib/supabase/client`).

### Lesson Content Pipeline

Each week lives in `content/week-XX/` with four files:
- `lesson.mdx` — Theory (MDX, rendered server-side)
- `exercises.mdx` — Coding exercises (MDX)
- `tests.json` — Array of `TestEntry` objects: `{ entry, cases: [{name, args, expected}], constraints?: { forbidTokens } }`
- `rubric.json` — Grading criteria for AI review

`lib/lessons/loadLesson.ts` reads these at build time. `getWeekSlugs()` discovers weeks by scanning the `content/` directory for `week-*` folders.

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
- `lessons` — Week metadata (week_number, slug, title)
- `submissions` — Student code, stdout/stderr, test_results (JSONB), ai_feedback (JSONB)
- `lesson_progress` — Completion tracking per user per lesson

RLS enforces: students see only their own data; instructors see all submissions.

### UI Layout

Split-pane layout for course pages: lesson content on the left, code editor + output on the right. Both horizontal and vertical splits are resizable (custom `ResizeHandle`/`VerticalResizeHandle` components, no library). Split ratios persist in localStorage. Mobile collapses to stacked layout at the `lg:` breakpoint (1024px).

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL       # Supabase project URL (exposed to browser)
NEXT_PUBLIC_SUPABASE_ANON_KEY  # Supabase anon key (exposed to browser)
SUPABASE_SERVICE_ROLE_KEY      # Server-only, elevated permissions
OPENAI_API_KEY                 # For AI feedback (server-only)
```

## Adding a New Week

1. Create `content/week-XX/` with `lesson.mdx`, `exercises.mdx`, `tests.json`, `rubric.json`
2. Update `content/syllabus.ts` — change the week's status from `"planned"` to `"published"`
3. The build auto-discovers it via `getWeekSlugs()` — no config changes needed
4. Add a corresponding row to the `lessons` table in Supabase for submission tracking
