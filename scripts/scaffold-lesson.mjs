#!/usr/bin/env node
// Scaffold one lesson: the six student-facing files PLUS a reference.py answer
// key. Fill them in afterward — but write reference.py FIRST and generate the
// tests.json expected values from it (use the /new-lesson skill for the guided
// workflow and `npm run validate-class <slug>` to check your work).
//
// Usage:
//   node scripts/scaffold-lesson.mjs <slug> <N> "<title>"
//   node scripts/scaffold-lesson.mjs leo-codes 9 "The Vigenere Cipher"

import { writeFileSync, existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const [slug, nRaw, title] = process.argv.slice(2);
if (!slug || !nRaw || !title) {
  console.error('Usage: node scripts/scaffold-lesson.mjs <slug> <N> "<title>"');
  process.exit(2);
}
const n = parseInt(nRaw, 10);
if (!Number.isInteger(n) || n < 1) {
  console.error(`Lesson number must be a positive integer. Got: ${nRaw}`);
  process.exit(2);
}
const nn = String(n).padStart(2, "0");

const classDir = join(ROOT, "content", "classes", slug);
if (!existsSync(classDir)) {
  console.error(`No such class: ${slug}. Scaffold it first with scaffold-class.mjs.`);
  process.exit(2);
}
const lessonDir = join(classDir, `lesson-${nn}`);
if (existsSync(lessonDir)) {
  console.error(`Lesson dir already exists: ${lessonDir} — refusing to overwrite.`);
  process.exit(2);
}
mkdirSync(lessonDir, { recursive: true });

const fn1 = "first_function"; // rename to your real exercise names

// --- lesson.mdx (theory) ---
writeFileSync(
  join(lessonDir, "lesson.mdx"),
  `# ${title}

> One-sentence hook a 10-year-old wants to read.

## The big idea

Explain the ONE concept this lesson teaches, with a concrete analogy. Keep
sentences short. Show, don't lecture.

\`\`\`python
# A tiny, runnable example of the idea in action.
\`\`\`

## What you'll build

A short list of the functions the student will write, and why they matter to the
class's through-line.
`
);

// --- exercises.mdx ---
writeFileSync(
  join(lessonDir, "exercises.mdx"),
  `## Your mission

### Exercise 1 — \`${fn1}(...)\`

Describe exactly what the function takes and returns, in plain language. Give a
worked example with real input and output:

\`\`\`python
${fn1}("example")   # -> "result"
\`\`\`

**Hint:** one concrete nudge, not the whole answer.
`
);

// --- tests.json (GENERATE expected values from reference.py — don't hand-write) ---
writeFileSync(
  join(lessonDir, "tests.json"),
  JSON.stringify(
    [
      {
        entry: fn1,
        cases: [
          { name: `${fn1}("example")`, args: ["example"], expected: "REPLACE_FROM_REFERENCE" },
        ],
      },
    ],
    null,
    2
  ) + "\n"
);

// --- rubric.json ---
writeFileSync(
  join(lessonDir, "rubric.json"),
  JSON.stringify(
    [
      { criterion: "Correctness", weight: 60, description: "What the function must do to be right." },
      { criterion: "Edge cases", weight: 25, description: "Spaces / wrap-around / empty input handled." },
      { criterion: "Clean code", weight: 15, description: "Reuses helpers, clear names, a return on every path." },
    ],
    null,
    2
  ) + "\n"
);

// --- starter.py (stubs only — must define a stub for every tests.json entry) ---
writeFileSync(
  join(lessonDir, "starter.py"),
  `# ${title}
# One or two lines framing the mission for the student.
#
# Tip: leave each "pass" as-is until you replace it with your code — don't just
# delete it, or Python will complain that a function is empty.


def ${fn1}(x):
    # Describe the steps; leave the one-line trick as a comment if helpful.
    pass


print("Press Run to see the Graph panel!")
`
);

// --- viz.json (REAL plot skeleton — the graph is a teaching panel, not filler) ---
writeFileSync(
  join(lessonDir, "viz.json"),
  JSON.stringify(
    {
      type: "plot",
      resultFn: "__plot",
      demoArgs: [10],
      title: "What this graph reveals about the concept",
      xLabel: "x axis label",
      yLabel: "y axis label",
      setup:
        "# --- plot helper (hidden) ---\n" +
        "# Define __plot(...) returning either a single [[x,y],...] series, or a\n" +
        "# list of series objects {\"name\", \"points\":[[x,y],...], \"highlight\":bool}.\n" +
        "# Often the most teachable graph compares two things (e.g. the student's\n" +
        "# method vs the exact answer, or before vs after).\n" +
        "def __plot(n):\n" +
        "    yours = [[i, i] for i in range(n)]\n" +
        "    return [\n" +
        '        {"name": "your result", "points": yours, "highlight": True},\n' +
        "    ]\n",
    },
    null,
    2
  ) + "\n"
);

// --- reference.py (the ANSWER KEY — write this FIRST, before tests.json) ---
writeFileSync(
  join(lessonDir, "reference.py"),
  `# reference.py — answer key for ${slug}/lesson-${nn} (${title}).
#
# INERT: loadLesson.ts only reads fixed filenames (lesson.mdx, exercises.mdx,
# tests.json, rubric.json, starter.py, viz.json), so this file is never served
# or built. WRITE THIS FIRST, then generate tests.json expected values from it:
# reference.py is the source of truth; tests.json is generated from it.
#
# Run \`npm run validate-class ${slug}\` to check tests.json against this answer key.


def ${fn1}(x):
    # The real, correct implementation goes here.
    raise NotImplementedError
`
);

console.log(`✓ Created ${lessonDir}/ with lesson.mdx, exercises.mdx, tests.json,`);
console.log(`  rubric.json, starter.py, viz.json, reference.py`);
console.log("");
console.log("Next (the proven order — reference.py BEFORE tests.json):");
console.log(`  1. Write reference.py with the real solution(s).`);
console.log(`  2. Run reference.py to GENERATE the exact expected values for tests.json.`);
console.log(`  3. Rename "${fn1}" everywhere to your real exercise names.`);
console.log(`  4. Design the viz.json graph so it reveals the concept.`);
console.log(`  5. Write the student-facing files in a 10-year-old voice.`);
console.log(`  6. npm run validate-class ${slug}   (until green)`);
console.log(`  7. Add the week to content/classes/${slug}/syllabus.ts, status "published".`);
