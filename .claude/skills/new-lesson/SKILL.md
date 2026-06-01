---
name: new-lesson
description: >-
  Author a new lesson for a Family Classroom class (Leo's Computer Class, Secret
  Codes, Motion Lab, Space School, Python Primer, Bio Lab, etc.). Use this
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
node scripts/scaffold-lesson.mjs <slug> <N> "<Lesson Title>"
```

This creates `content/classes/<slug>/lesson-0N/` with all seven files (the six
student-facing ones plus `reference.py`), each a template with `TODO`/
`REPLACE_FROM_REFERENCE` placeholders. It refuses to overwrite an existing
lesson. If the class doesn't exist yet, run `/new-class` first.

Before writing anything, study the most recent finished class as your pattern —
`content/classes/leo-codes` is the reference build (8 complete lessons). Match
its shape and voice.

### 2. Write reference.py — the real solution

Open `content/classes/<slug>/lesson-0N/reference.py` and implement every
function the lesson will teach. Rename the placeholder `first_function` to your
real exercise names. A few conventions that keep the test runner happy:

- **Return plain JSON-friendly types** — `str`, `int`, `bool`, `list`. Never
  return a `dict` (the Pyodide worker compares results by JSON equality, and dict
  ordering/serialization makes that brittle). This is a hard rule across the
  platform.
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

### 4. Design the graph (viz.json) — it's a teaching panel, not filler

Every lesson ships a graph, and the good ones make the concept *visible*. Look at
the existing classes for the bar to clear:

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
`valuesMatch` from the Pyodide worker, and execs the graph to confirm it returns
plottable data. Fix anything red and rerun until it passes. A green run means a
correct student solution will pass exactly these tests.

### 7. Publish

Add the lesson to `content/classes/<slug>/syllabus.ts` (a `Week` entry under the
right phase) and set its `status` to `"published"`. The build auto-discovers it;
the dashboard syncs it into the DB on load. Run `npm run build` to confirm SSG is
clean.

## Quick checklist

1. `scaffold-lesson.mjs` → 2. write `reference.py` → 3. generate `tests.json`
values from it → 4. design the graph → 5. write the 6 files (10-yo voice) →
6. `npm run validate-class <slug>` green → 7. flip `syllabus.ts` to `published` +
`npm run build`.
