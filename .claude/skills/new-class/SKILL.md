---
name: new-class
description: >-
  Create a brand-new class for the Family Classroom platform in this repo — a new
  subject taught through interactive Python lessons (like Leo's Computer Class,
  Secret Codes, Motion Lab, Space School). Use this whenever the user wants to
  add, create, start, or scaffold a new class, course, or subject — even phrasings
  like "let's make a class about music" or "I want to teach Leila chemistry."
  Scaffolds the class shell (syllabus, AI coaching prompt, registry entry, accent
  color), then hands off to /new-lesson to build the actual lessons.
---

# Create a new class

A "class" is one subject (computer architecture, cryptography, orbital mechanics)
taught as a sequence of coding lessons sharing a theme, an accent color, and an
AI coaching voice. This skill sets up the empty shell; the lessons themselves are
built one at a time with `/new-lesson`.

Before starting, read `docs/CLASS-ROADMAP.md` — it lists the "shared class DNA"
every class must follow and the candidate classes already sketched out. The most
important rule: a class needs **one build-toward-something through-line** (Secret
Codes is "send messages your sister can't read, then crack hers"; Space School is
"fly a mission to the Moon"), not a grab-bag of topics. Every lesson must be
expressible as testable pure functions a 10-year-old can write.

## Workflow

### 1. Settle the concept first

Pin down, with the user if anything's unclear:
- **slug** (kebab-case, e.g. `leo-music`) and **name** (e.g. "Leo's Music Machine")
- **tagline** — a short, exciting promise ("Make Songs with Code")
- **through-line** — the one thing the whole class builds toward
- **accent color** — one of the known accents in `lib/accents.ts` (currently
  `indigo`, `violet`, `emerald`, `amber`, `sky`, `rose`, `fuchsia` — check the
  file for the live set, it grows). If you want a color that isn't there yet, see
  step 3.
- **panel kind** — will the lessons teach with **plot** graphs (most classes) or
  a **pixel-grid drawing** canvas (`type: "draw"`, like Pixel Wizards)? This picks
  the `--viz` flag you'll pass to `/new-lesson`. A drawing canvas is a great fit
  for a true-beginner / visual class.

### 2. Scaffold the shell

```bash
node scripts/scaffold-class.mjs <slug> "<Name>" "<tagline>" <accentColor>
```

This creates `content/classes/<slug>/syllabus.ts` and `ai-prompt.ts` (skeletons)
and appends a `comingSoon: true` entry to `content/classes.ts` pointing at a hero
image `public/hero-<slug>.webp`. It prints a loud warning if the accent color
isn't in `lib/accents.ts`.

**Home-page order = array order.** The scaffolder *appends* the new entry, so the
class shows up last on the home page. If it should lead — e.g. a beginner on-ramp
that students hit first (Pixel Wizards sits above Python Primer) — move the entry
up in the `classes` array yourself after scaffolding.

### 3. Add the accent color if it's new (single source of truth)

Accent class strings live in **one place**: `lib/accents.ts`. (They used to be
copy-pasted across three files, which drifted — `leo-space`'s "sky" silently fell
back to indigo for a while because one copy was never updated. Don't reintroduce
that.) If you chose a color that isn't already a key in `lib/accents.ts`, copy an
existing color block, swap the color name on **every** line (they must be literal
class strings so Tailwind v4's scanner keeps them), and add it. All three
consumers (`AccentContext`, `app/page.tsx`, the class landing page) read from
this file, so that's the only edit needed.

### 4. Fill in the shell

- `content/classes.ts` — replace the `description` placeholder with a real
  one-paragraph pitch for the class card and landing page.
- `content/classes/<slug>/ai-prompt.ts` — fill the `systemPrompt` blanks: who the
  student is (what they already know — don't dumb the code down), the big ideas
  with the concrete analogy each hangs on, the domain conventions (e.g. functions
  return `str`/`int`/`bool`/`list`, never `dict`), and a warm, capable-kid voice.
  Use `content/classes/leo-codes/ai-prompt.ts` as the model.
- `content/classes/<slug>/syllabus.ts` — plan the phases and weeks. Add each
  `Week` with `status: "planned"` for now (flip to `"published"` per lesson as you
  build it). Keep the arc tight and building toward the through-line.

### 5. Add the hero image

Drop an illustration at `public/hero-<slug>.webp` (the other classes' heroes show
the style). The class card and landing banner use it.

### 6. Build the lessons

Now build lessons one at a time with `/new-lesson <slug> <N> "<title>"` (add
`--viz draw` for a drawing class). Once the first lesson is published, remove
`comingSoon: true` from the registry entry in `content/classes.ts` so the class
goes live.

### 7. Verify

```bash
npm run build            # SSG clean, class card + landing render
npm run validate-class <slug>   # once lessons exist
```

## Quick checklist

1. concept (slug/name/tagline/through-line/accent/panel kind) →
2. `scaffold-class.mjs` (move the entry up if it should lead the home page) →
3. add accent to `lib/accents.ts` if new → 4. fill description + ai-prompt +
syllabus (weeks `planned`) → 5. hero image → 6. `/new-lesson` per lesson
(`--viz draw` for a drawing class) → 7. drop `comingSoon`, `npm run build`.
