---
name: new-lesson
description: >-
  Author a new lesson for a Family Classroom class (Leo's Computer Class, Secret
  Codes, Motion Lab, Space School, Python Primer, Pixel Wizards, Bio Lab, etc.).
  Use this
  whenever the user wants to add, build, write, or scaffold a lesson, week, or
  exercise for one of the classes in this repo — even if they just say "add
  lesson 9 to leo-codes" or "write the next cryptography lesson." Encodes the
  proven workflow: scaffold → write reference.py FIRST → generate exact test
  values from it → design the graph → write the 6 student files for a 10-year-old
  → validate until green → publish. Enforces "reference.py before tests.json."
---

# Author a new lesson

A lesson is a self-contained coding exercise set: theory, exercises, an
auto-graded test suite, a teaching graph, and starter code. The hard part isn't
the prose — it's that the **expected values in `tests.json` must be exactly what
a correct solution produces**, or every student gets marked wrong on right
answers (or, worse, right on wrong ones). This skill keeps that honest by making
you write the real solution first and generate the test values from it.

## Two kinds of lesson

Most lessons are **coding lessons** (the rest of this skill). But some ideas can't
be tested as code — understanding them *is* the point. For those, author a
**reflection lesson**: no Python, no tests, just one open question the kid
re-explains in their own words, graded by the AI coach for *understanding*. These
are great as a class's final "looking back / big picture" capstone (history of the
idea → one question). If that's what you're building, **skip to
[Reflection lessons](#reflection-lessons-no-python) at the bottom** — the
`reference.py`-before-`tests.json` workflow below does not apply.

## The core invariant: reference.py before tests.json

`reference.py` is the answer key — the real, correct implementation of every
function the lesson asks for. It is the **source of truth**. You write it first,
run it to produce the expected outputs, and only then fill in `tests.json`. Never
hand-author expected values by reasoning about them in your head — that's how
broken tests ship. (`reference.py` is inert: `lib/lessons/loadLesson.ts` only
reads fixed filenames, so it is never served to students or included in the
build. It exists purely so `npm run validate-class` can check the test suite.)

## Workflow

### 1. Scaffold the files

```bash
node scripts/scaffold-lesson.mjs <slug> <N> "<Lesson Title>" [--viz plot|draw]
```

This creates `content/classes/<slug>/lesson-0N/` with all seven files (the six
student-facing ones plus `reference.py`), each a template with `TODO`/
`REPLACE_FROM_REFERENCE` placeholders. It refuses to overwrite an existing
lesson. If the class doesn't exist yet, run `/new-class` first.

Pick the teaching panel with `--viz`: **`plot`** (a line/scatter graph — the
default, used by Motion Lab, Space School, Secret Codes) or **`draw`** (a
pixel-grid drawing canvas — used by Pixel Wizards). Pass `--viz draw` for a
drawing class so `viz.json` scaffolds with the right shape; otherwise you'll get
the plot skeleton and have to convert it by hand. Match whatever the rest of the
class uses.

Before writing anything, study the most recent finished class as your pattern —
`content/classes/leo-codes` is the reference build (8 complete lessons). Match
its shape and voice.

### 2. Write reference.py — the real solution

Open `content/classes/<slug>/lesson-0N/reference.py` and implement every
function the lesson will teach. Rename the placeholder `first_function` to your
real exercise names. A few conventions that keep the test runner happy:

- **Return plain JSON-friendly types** — `str`, `int`, `bool`, `list`, and (with
  care) `dict`. The Pyodide worker compares results with **key-order-sensitive**
  `JSON.stringify` (`public/pyodide-worker.js`), and a Python dict round-trips
  preserving insertion order — so a student who builds the *right* dict in a
  *different* key order would be marked wrong. **Prefer non-dict returns when one
  works.** Return a `dict` only when the data genuinely is a mapping (a lookup
  table, a tally, decoded traits) AND you **pin a single, natural key order** that
  the `starter.py`/`exercises.mdx` teach explicitly, so every correct student
  produces the same order. Bio Lab does exactly this — `leila/lesson-01`
  (`count_bases` → `{"A","T","C","G"}`) and `leila/lesson-07` (`decode_traits` →
  `{"fur","eyes","tail"}`) — and DNA Decoders L6/L7 follow it. Avoid float-valued
  dicts (combine the dict caveat with the float-equality caveat).
- Keep helpers the student is "given" (not asked to write) in `reference.py` too,
  so it runs standalone.
- Match the domain conventions of the class (e.g. Secret Codes works on lowercase
  a–z, spaces pass through unchanged, the alphabet wraps with `% 26`; physics
  classes use Euler integration and may need a `tol`).

### 3. Generate the exact expected values

Run `reference.py` (or a tiny throwaway snippet) with the exact argument lists
you plan to test, and copy the printed outputs into `tests.json` as the
`expected` values. Each `tests.json` entry is:

```json
{
  "entry": "function_name",
  "cases": [
    { "name": "human-readable label", "args": [arg1, arg2], "expected": <from reference.py> }
  ]
}
```

For float/physics exercises, add a `"tol"` (per-case or per-entry) so
near-equal numbers pass — see `content/classes/leo-space` for examples. If an
exercise must be solved from primitives, add
`"constraints": { "forbidTokens": [...] }` (see `content/classes/leo` week 5).

Pick cases that teach: a simple one, an edge case (wrap-around, empty input,
spaces), and a round-trip (encrypt→decrypt returns the original) where it
applies. The `name` shows up in the student's test panel, so make it readable.

### 4. Design the teaching panel (viz.json) — it's a teaching panel, not filler

Every lesson ships a live panel driven by the student's code through the `__VIZ__`
channel, and the good ones make the concept *visible*. There are two kinds — pick
the one the class uses (`--viz` in step 1).

**Plot graphs** (`type: "plot"`). The good ones reveal a comparison. Look at the
existing classes for the bar to clear:

- Motion Lab plots **"your Euler simulation vs the exact formula"** — the student
  sees their approximation converge as the step shrinks.
- Secret Codes plots **"the cipher wheel"** and **"plain letters vs after XOR"** —
  before/after comparisons.

So decide: **what does this graph reveal about the idea?** Usually it's a
comparison — the student's method vs the ideal answer, or before vs after. Then
write the `setup` Python so it defines the `resultFn` (conventionally `__plot`)
returning either a single `[[x,y],...]` series or a list of series objects
`{"name", "points":[[x,y],...], "highlight":bool}`. Set `demoArgs`, `title`,
`xLabel`, `yLabel`. The `setup` can call the lesson's own functions (the app
prepends the student's code before `setup`; the validator prepends
`reference.py`), so the graph can show off what the student just built.

**Make the curve student-driven, with a fallback.** Build the highlighted
"your answer" series by calling the student's function(s) by name, wrapped in
`try/except` + a type/truthiness check so an unfinished or wrong implementation
falls back to a built-in reference curve — the panel must never go blank or
crash. (See `leo-physics/lesson-02` calling `velocity_components`.)

**Optional: a progress-aware caption** (GH #4). A plot lesson can show one line
under the graph telling the student where they are: *"Finish `step_velocity` to
see your own curve"* → *"keep tuning it"* → *"✅ your curve matches the exact
answer!"*. Because the curve always renders (the fallback above), the caption
**can't** be read from the series — the engine instead checks the *curve-driving*
student function(s) directly. Add it last, after the graph works:

```bash
node scripts/scaffold-captions.mjs <slug> lesson-0N
```

This reads `tests.json` + `viz.json` and prints a paste-ready `caption` block:
one `{fn, args, expected, tol}` check per curve-driving function (the ones the
`setup` actually calls), plus three `TODO` strings. Paste it into `viz.json` and
rewrite the three strings in the lesson's voice (the `todo` names the
curve-driving fn; the `match` references the lesson's concrete thing — dart
flight, orbit, cipher wheel). Gate the ✅ on the curve-driving fn(s) only, so the
caption always agrees with the visible curve. **Verify the check case is
discriminating** — a `pass`-stub that returns a placeholder must NOT satisfy it
(e.g. an integrator stub that returns its starting value will match a degenerate
"no motion" case; pick a case where the answer genuinely moves). `validate-class`
cross-checks each caption's `expected`/`tol` against `reference.py`. Optional —
skip it for lessons that read fine with just the student-driven curve.

**Optional: progressive stages — pin-to-play** (GH #4). When a lesson teaches
**two or more functions that each draw a genuinely separate curve/picture**, use
`stages` instead of a single `resultFn`. The panel grows a chip row: the student
sees the furthest correct step by default ("▶ Auto"), but can **pin an earlier
function to experiment with *its* output live** while later steps stay done — and
the view re-snaps to the furthest step the moment they push progress further.
Pixel Wizards uses this on every lesson (e.g. `my_square` then `two_tone`);
`leo-codes/lesson-08` uses it on a plot (Lock = `encrypt(m)`, Unlock =
`decrypt(encrypt(m))`).

- **draw** stages: each is `{fn, args, expected, caption, label?}` — `fn` is the
  student's function, `expected` is the grid a correct solution returns
  (generated from `reference.py`, exactly like a test value). The engine draws
  each stage's live output and ✓-marks the matched ones.
- **plot** stages: each is `{resultFn, demoArgs, check:{fn,args,expected,tol?},
  caption, label?}` — `resultFn` (defined in `setup`) builds *that stage's* series
  (student-driven, with the same try/except fallback as above), and `check` gates
  the stage's status against a curve-driving fn.

**When NOT to use stages** (the common case — default to single): if the
functions **compose into one curve** (editing either already updates the single
graph, so nothing is hidden) or the panel shows **intentional comparison series**
(big-vs-small step, two tank sizes, your-method-vs-exact), keep the single
`resultFn`/`caption` form — stages would *hide* the teaching. Single-function
lessons show no chips. This is why almost every Motion Lab / Space School plot
stays single and only RSA earned plot stages. `validate-class` runs every stage's
producer against `reference.py` and checks each stage's gate value, the same
honesty guarantee as the caption checks.

**Pixel-grid drawings** (`type: "draw"`, Pixel Wizards). Here the panel paints a
picture the student's code returns, which is hugely motivating for absolute
beginners. In simple mode, point `resultFn` directly at the student's own
function (no `__plot` wrapper needed) and set `demoArgs`; most Pixel Wizards
lessons instead use the progressive **`stages`** form above (one stage per
function). Either way the function must return a **2D grid**: a list of rows, each
row a list of cells, where a cell is a color name (`"red"`, `"blue"`, `"green"`,
`"yellow"`, `"black"`, `"white"`, `"pink"`, `"purple"`, `"orange"`, `"brown"`,
`"gray"`), an emoji (`"🌸"`), or `""`/`"."`/`None` for an empty see-through
square. Rows may be ragged (the renderer pads to the widest). A `setup` prelude is
optional (use it only if you need a hidden helper). See
`content/classes/pixels/lesson-07` (a `row_of` → 8×8 `checkerboard` two-stage
lesson) for the pattern, and `components/PixelCanvas.tsx` for the exact cell
contract.

### 5. Write the six student-facing files for a 10-year-old

- `lesson.mdx` — the one big idea, with a concrete analogy and a tiny runnable
  example. Short sentences. Show, don't lecture.
- `exercises.mdx` — each exercise with a worked input→output example and one
  hint (a nudge, not the answer).
- `starter.py` — stubs with `pass` and a comment hinting at the approach. **Must
  define a `def` for every `tests.json` entry name** (the validator checks this).
- `tests.json`, `rubric.json` — from steps 3; rubric criteria should sum to 100.

Voice: warm, excited, treats the kid as a capable young coder — no baby talk, no
jargon unless the lesson is explicitly teaching it. Anchor everything to the
class's through-line (the story the whole class is building toward).

### 6. Validate until green

```bash
npm run validate-class <slug>
```

This JSON-parses every file, compiles the Python, checks every `tests.json` entry
has a starter stub, runs `reference.py` against every test case using the **real**
`valuesMatch` from the Pyodide worker, and execs the panel to confirm it returns
plottable series (or, for `type: "draw"` lessons, a valid pixel grid). For
progressive-stage panels it runs **every stage's producer** and checks each
stage's gate value against `reference.py`. Fix anything red and rerun until it
passes. A green run means a correct student solution will pass exactly these tests.

### 7. Publish

Add the lesson to `content/classes/<slug>/syllabus.ts` (a `Week` entry under the
right phase) and set its `status` to `"published"`. The build auto-discovers it;
the dashboard syncs it into the DB on load. Run `npm run build` to confirm SSG is
clean.

## Quick checklist

1. `scaffold-lesson.mjs` (`--viz draw` for a drawing class) → 2. write
`reference.py` → 3. generate `tests.json` values from it → 4. design the panel
(student-driven curve + fallback; optional `scaffold-captions.mjs` caption;
`stages` for pin-to-play only when each fn draws a separate curve/picture) →
5. write the 6 files (10-yo voice) → 6. `npm run
validate-class <slug>` green → 7. flip `syllabus.ts` to `published` + `npm run
build`.

## Reflection lessons (no Python)

A reflection lesson swaps the code editor for a **prose answer box**. The kid
re-explains a core idea in their own words; the AI coach assesses *understanding*
(warm, formative — never spelling/grammar) and the lesson completes **on submit**
(participation-based, so a kid is never stuck on the last lesson). It reuses the
whole submission pipeline — the answer is stored where code normally is, and the
same feedback panel renders the grade — so there's nothing to wire up. The lesson
is **signalled purely by a `reflection.json` file**; no scaffold script.

Use it for the kind of question that has no single right wording — *"explain why
the Moon doesn't crash into Earth even though it's always falling."* Great as a
class's final capstone: a `lesson.mdx` that tells the **history** of the idea (what
problem it solved, who, when), then one question that makes the kid prove they
*get* it. The existing pattern across all 8 classes is a final phase named
**"The Big Picture"**; study `content/classes/leo-space/lesson-09` as the model.

### Files

A reflection lesson dir has **only three files** (no `tests.json`, `starter.py`,
`viz.json`, `rubric.json`, or `reference.py`):

- `lesson.mdx` — the narrative (for a capstone: the history of the idea). 10-yo
  voice, `{{FIRST_NAME}}` tokens, anchored to what the kid actually built in the
  class. Standard markdown (headings, bold, tables, blockquotes) renders fine.
- `exercises.mdx` — frames the question and explains *how* to answer: there's no
  code, write a few sentences in the box on the right, click **Submit answer**. A
  short "Think about…" list of 3 sub-prompts helps. (Keep this file — the loader
  requires both `lesson.mdx` and `exercises.mdx`.)
- `reflection.json`:

```json
{
  "question": "The open question, shown to the student (supports {{FIRST_NAME}}).",
  "guidance": "Optional one-line hint shown next to the answer box.",
  "lookFor": ["key idea a strong answer conveys", "another", "..."],
  "exemplar": "Optional model answer."
}
```

**Privacy:** `question` and `guidance` are shown to the student; `lookFor` and
`exemplar` are **grader-only** — the lesson page strips them before sending props
to the browser, and `/api/ai-review` reads `reflection.json` fresh server-side. So
a curious kid can't view-source the answer. Write `lookFor` as the concrete ideas
the AI should reward; write `exemplar` as a real kid-level answer (it's reference,
not a wording template the kid must match).

### Workflow

1. Create the lesson dir and write the three files above (no scaffold script).
   Pick a slug that sorts last among the class's existing dirs and matches the
   class's naming (`lesson-0N`, or `week-NN` for `leo`). For a class with
   planned-but-unbuilt future weeks (`leo`, `leila`), use the **highest** week
   number in a new final phase so it lands last without colliding with a planned
   slug (e.g. `leo/week-11`, `leila/lesson-11`).
2. `npm run validate-class <slug>` — confirms `reflection.json` parses and has a
   `question` + non-empty `lookFor`. (Value checks are skipped — there's no
   `reference.py`, which is expected.)
3. Add the `Week` to `syllabus.ts` under a final phase (the convention is
   `{ phase: N, name: "The Big Picture" }`), `status: "published"`, then
   `npm run build`.
