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

**This skill also keeps `docs/CLASS-ROADMAP.md` current** — you record the class
there when you start it (step 1) and write it up when it's done (step 8). The
roadmap is the project's memory of what exists and what's planned, so it must not
fall behind reality.

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

**Record it in the roadmap now.** Once the concept is settled, add the class to
`docs/CLASS-ROADMAP.md` so the planning doc reflects that it's being built:
- Add a row to the **Current classes** table with the slug, through-line, and a
  status like `In progress (0/N)`.
- If the class came from the **Candidate classes** or **Honorable mentions**
  lists, leave that sketch in place (you'll convert it to a "Shipped" write-up in
  step 8) but make the table row the source of truth for status.
- Keep the planned lesson count (`N`) so the status reads `In progress (k/N)` as
  lessons land.

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

- `content/classes.ts` — fill in TWO description fields:
  - **`description`** — SHORT and **enticing** (~1 sentence, ~120–180 chars). This
    is the home-page card; it must stay tight so every card is the same height and
    none overflow. Make it a hook, not a summary — exciting for a 10-year-old, no
    dry "this class covers…" phrasing.
  - **`longDescription`** (optional) — the fuller one-paragraph pitch, shown only
    on the dedicated class landing page (and the OG/meta tag). Put the rich detail
    here; the card never shows it. If you omit it, the page falls back to
    `description`. Don't let the long pitch leak into `description`.
- `content/classes/<slug>/ai-prompt.ts` — fill the `systemPrompt` blanks: who the
  student is (what they already know — don't dumb the code down), the big ideas
  with the concrete analogy each hangs on, the domain conventions (e.g. functions
  return `str`/`int`/`bool`/`list`, never `dict`), and a warm, capable-kid voice.
  Use `content/classes/leo-codes/ai-prompt.ts` as the model.
- `content/classes/<slug>/syllabus.ts` — plan the phases and weeks. Add each
  `Week` with `status: "planned"` for now (flip to `"published"` per lesson as you
  build it). Keep the arc tight and building toward the through-line.
  - **Consider ending with a reflection capstone.** Every class so far closes with
    a final "The Big Picture" phase: one no-Python lesson that tells the *history*
    of the idea and asks the kid to re-explain a core concept in their own words
    (AI-graded for understanding). If you want one, add it as the last phase/week
    now; build it later via the **Reflection lessons** section of `/new-lesson`.

### 5. Generate the hero image (don't ship a placeholder)

Every class needs its own hero at `public/hero-<slug>.webp` — the class card and
landing banner use it. **Generate real art for it with the `/ask-gemini` skill;
do not leave a copied/placeholder image.** First open one or two existing heroes
(`public/hero-pixels.webp`, `public/hero-bio.webp`) to match the house style:
bright, playful, kid-friendly illustration; a little arcade/UI text is fine.

Then call `/ask-gemini` in image mode with a prompt for: the **through-line**
subject, the **accent color** as the dominant palette, and a concrete scene (a
character + the thing the class builds toward). For a drawing class, ask for a
**pixel-art** style (`--styles="pixel-art"`); plot classes can use a richer
illustration. Ask for a **16:9 landscape** image.

**Do NOT bake the class name or any title/headline text into the image.** The
class landing page renders its own title + tagline as real HTML over/under the
hero, so a name baked into the art is redundant and usually gets *duplicated*
(the leo-games hero first came back with "Leo's Game Studio" printed twice).
Prompt for the scene/subject/mood/palette only, and add an explicit negative like
*"no title text, no class name, no headline, no large words baked into the
image."* Tiny in-scene UI is fine (a small SCORE readout, short code snippets, a
game's own marquee) — just not the class's name or a banner headline.

`/ask-gemini` writes to the gitignored `nanobanana-output/` as a `.jpeg`. Convert
it to webp at the standard hero size (1376×768, matching the other heroes) and put
it in place:

```bash
cwebp -q 88 nanobanana-output/<generated>.jpeg -o public/hero-<slug>.webp
# (falls back to: sips -s format webp <src> --out public/hero-<slug>.webp)
```

Eyeball the result in the running app (home page card + class landing). If it's
off, regenerate with a tweaked prompt — it's cheap.

**Then generate the social-share card.** When a class link
(`/classes/<slug>`) is pasted into iMessage, Slack, X, etc., the class landing
page serves its own Open Graph / Twitter card (via `generateMetadata` in
`app/classes/[classSlug]/page.tsx`), pointing at `public/og-<slug>.jpg` — a
1200×630 JPEG cropped from the hero (JPEG, not webp, because LinkedIn/iMessage/
some unfurlers don't reliably render webp OG images). Regenerate the cards for
**all** classes from their heroes with:

```bash
node scripts/generate-og-images.mjs   # reads heroImage from content/classes.ts → public/og-<slug>.jpg
```

Run it whenever you add a class or swap a hero. (No code change needed per class —
the metadata derives the path as `/og-<slug>.jpg`.) The class **landing** page is
public in `lib/supabase/middleware.ts` (`updateSession`, called from root
`proxy.ts` — this repo uses Next 16 `proxy.ts`, **not** a root `middleware.ts`) so
crawlers and link recipients can see it; lesson pages stay gated. After deploying,
shared links cache — re-scrape via Facebook's Sharing Debugger / X Card Validator
to refresh an already-shared URL.

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

### 8. Update the roadmap on completion

When the class is done (all planned lessons published, or the agreed first batch
shipped), bring `docs/CLASS-ROADMAP.md` up to date so it reflects reality:

- **Current classes table** — flip the status to `Published (N) ✅` (or, for a
  partial ship, `Published (k/N), rest planned`). Update the `✅ new` marker if
  you use one.
- **Add a "Shipped from this list" write-up** — a short section like the existing
  Pixel Wizards / Secret Codes entries: the through-line, the as-shipped lesson
  arc (numbered titles), and an **As-built notes** bullet list of anything that
  diverged from the original sketch or any reusable tech the class introduced (a
  new viz type, a new accent, a novel pattern). If the class came from the
  Candidate/Honorable-mention list, move its sketch into this section rather than
  leaving it as a "future idea."
- **Suggested sequence / unblocks** — if the new class changes the recommended
  ladder for a kid, or unblocks an honorable-mention class, note it.

Do this as the final step of the build so the roadmap never lags behind what's
actually published. (If you're building lessons across multiple sessions, update
the table's `k/N` status as each batch lands and write the full section when the
last lesson ships.)

## Quick checklist

1. concept (slug/name/tagline/through-line/accent/panel kind) **+ record it in
`docs/CLASS-ROADMAP.md`** (Current-classes row, `In progress (0/N)`) →
2. `scaffold-class.mjs` (move the entry up if it should lead the home page) →
3. add accent to `lib/accents.ts` if new → 4. fill SHORT enticing `description`
(card) + optional `longDescription` (class page) + ai-prompt + syllabus (weeks
`planned`) → 5. generate the hero with `/ask-gemini` (real art,
not a placeholder) + convert to `public/hero-<slug>.webp` + `node
scripts/generate-og-images.mjs` (social-share card) → 6. `/new-lesson` per
lesson (`--viz draw` for a drawing class) → 7. drop `comingSoon`, `npm run build`
→ 8. **update `docs/CLASS-ROADMAP.md`** (flip table status to `Published ✅`, add
the "Shipped from this list" write-up).
