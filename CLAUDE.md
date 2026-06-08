# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Project Is

**Family Classroom** — a multi-class educational platform that teaches kids through interactive Python coding lessons. Currently supports two classes:

- **Leo's Computer Class** — computer architecture from first principles (logic gates → CPU)
- **Leila's Bio Lab** — biology through code (DNA, mutations, CRISPR) *(coming soon)*

**Audience matters:** All lesson content (MDX files, AI feedback prompts, exercise descriptions) must be written for a 10-year-old. Use simple language, concrete analogies, and an encouraging tone. Avoid jargon unless it's being explicitly taught.

## Commands

```bash
npm run dev               # Start dev server (localhost:3000)
npm run build             # Production build (also validates SSG)
npm run lint              # ESLint (no auto-fix)
npm start                 # Serve production build
npm run validate-class [slug]  # Validate lesson content (all classes, or one)
```

No test runner is configured. Tests are student-facing (defined in `content/classes/<class>/*/tests.json`) and run in-browser via Pyodide. `npm run validate-class` is the authoring-time check that those tests are correct (see "Class-making tooling" below).

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

**Accent colors:** `lib/accents.ts` is the single source of truth for every accent-color class string (one record per color: `indigo`, `violet`, `emerald`, `amber`, `sky`, `rose`). `AccentContext`, `app/page.tsx`, and the class landing page all read from it via `getAccent()`. To add a new accent, copy an existing color block and swap the name on every line (literal class strings only — Tailwind v4 purges interpolated ones). Do **not** hardcode accent strings in components.

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
- `tests.json` — Array of `TestEntry` objects: `{ entry, cases: [{name, args, expected, tol?}], constraints?: { forbidTokens } }`
- `rubric.json` — Grading criteria for AI review
- `starter.py` — (optional) Starter code for the editor
- `viz.json` — (optional) Teaching panel config. `type: "plot"` (line graph from a `setup`-defined `resultFn`) or `type: "draw"` (pixel-grid canvas). Both support **progressive stages** (`stages: [...]`) — a "pin-to-play" chip row where the student sees the furthest correct step by default but can pin an earlier function's curve/picture to experiment with it live (the view re-snaps to the furthest step when progress advances). Use stages **only when each function draws a genuinely separate curve/picture**; for composed pipelines or intentional comparison series, keep the single `resultFn`/`caption` form (no chips). See the `/new-lesson` skill.
- `reference.py` — (optional, **inert**) The answer key. `loadLesson.ts` only reads the fixed filenames above, so `reference.py` is never served or built. It exists so `npm run validate-class` can generate/check `tests.json` expected values from a real solution. **Write it before `tests.json`.**

**"latex" lessons** (Leo's Proof Press, `language: "latex"` in the registry) swap Python for LaTeX typesetting. Signalled by `latex.json` (like `reflection.json` signals a reflection lesson). The student edits one small LaTeX document (`starter.tex`, loaded into the same `starterCode` field); exercises are regions delimited by `%% exercise-id` marker lines. The editor gets a Monaco LaTeX mode and a **live KaTeX-typeset page** (`LatexPreview`) instead of a graph. Grading is in-browser JS, no Pyodide — `lib/latex/check.mjs` runs three tiers per exercise: KaTeX compiles → required/forbidden commands → **the math is numerically TRUE** (`lib/latex/evaluate.mjs` evaluates every `=`-separated chain segment at sampled variable values, complex-valued; definite integrals via quadrature, indefinite integrals by differentiating the student's answer back to the integrand — the FTC as grader; also handles `\left[F\right]_a^b`, `\sum` incl. `\infty`, `\lim`, `d/dx`). Results reuse the Python `TestResult` shape, so submit/completion/AI-review pipelines work unchanged. The answer key is `reference.tex` (inert, like `reference.py` — **write it before `latex.json`**); `npm run validate-class` proves it passes every check using the same checker module the browser imports.

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

## Class-making tooling

Authoring is automated. Prefer these over doing it by hand:

- **`/new-lesson` skill** (`.claude/skills/new-lesson/`) — guided workflow to add a lesson. Encodes the proven order: **write `reference.py` first, generate `tests.json` expected values from it** (never hand-author them), design the teaching graph, write the student files in a 10-year-old voice, then `npm run validate-class` until green and flip the syllabus to `published`.
- **`/new-class` skill** (`.claude/skills/new-class/`) — guided workflow to scaffold a new class shell (syllabus, ai-prompt, registry entry, accent color), then hand off to `/new-lesson`.
- **`scripts/scaffold-class.mjs <slug> "<Name>" "<tagline>" <accent>`** — creates the class dir + appends a `comingSoon` registry entry; warns if the accent isn't in `lib/accents.ts`.
- **`scripts/scaffold-lesson.mjs <slug> <N> "<title>"`** — creates a lesson dir with all six student files + a `reference.py` template.
- **`scripts/validate-class.mjs` (`npm run validate-class [slug]`)** — compiles `lesson.mdx`/`exercises.mdx` with the lesson page's exact MDX pipeline (raw `{braces}` in prose are JSX expressions that 500 the page at request time — `npm run build` won't catch it because lesson pages render on demand), JSON-parses every `tests.json`/`rubric.json`/`viz.json`, compiles the Python, checks every test entry has a starter stub, runs `reference.py` against every case using the **real `valuesMatch` extracted from `public/pyodide-worker.js`** (so it can't drift from the in-browser grader), and execs the graph to confirm it returns plottable data. For progressive-stage panels it runs **every stage's producer** and cross-checks each stage's gate value against `reference.py`. Exits nonzero on any failure. Lessons without a `reference.py` skip the value checks but still get the rest.

### Adding a New Lesson (to an existing class)

Use `/new-lesson` (or `scaffold-lesson.mjs` directly). Manual fallback: create `content/classes/<classSlug>/<lessonSlug>/` with the lesson files, add the week to `syllabus.ts` with status `"published"`, and run `npm run validate-class <classSlug>`. The build auto-discovers it via `getLessonSlugs()`; the dashboard syncs published lessons into the `lessons` DB table on load.

### Adding a New Class

Use `/new-class` (or `scaffold-class.mjs` directly). It creates `content/classes/<newSlug>/` with `syllabus.ts` + `ai-prompt.ts`, appends the registry entry to `content/classes.ts` (`comingSoon: true` until lessons exist), and reminds you to add the accent to `lib/accents.ts` if it's new. Remove `comingSoon` once the first lesson is published.
