#!/usr/bin/env node
// Scaffold one lesson: the student-facing files PLUS an answer key. Fill them in
// afterward — but write the answer key (reference.py / reference.js) FIRST and
// generate the tests.json expected values from it (use the /new-lesson skill for
// the guided workflow and `npm run validate-class <slug>` to check your work).
//
// Usage:
//   node scripts/scaffold-lesson.mjs <slug> <N> "<title>" [--viz plot|draw] [--kind python|js]
//   node scripts/scaffold-lesson.mjs leo-codes 9 "The Vigenere Cipher"
//   node scripts/scaffold-lesson.mjs pixels 8 "Your Masterpiece" --viz draw
//   node scripts/scaffold-lesson.mjs leo-games 1 "The Canvas" --kind js
//
// --kind picks the language: "python" (default, Pyodide) or "js" (a Game Studio
// JavaScript lesson — starter.js + js.json + reference.js, graded in the JS
// sandbox with a live <GamePreview> canvas instead of a plot/draw viz).
// --viz picks the teaching panel for PYTHON lessons: "plot" (a line/scatter
// graph, the default) or "draw" (a pixel-grid drawing canvas). Either way the
// panel is driven by the student's code via the __VIZ__ channel. (--viz is
// ignored for --kind js, which always uses the game canvas.)

import { writeFileSync, existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// Parse args: positional <slug> <N> "<title>" plus optional --viz / --kind flags
// (each accepts "--flag value" or "--flag=value").
const positional = [];
let vizType = "plot";
let kind = "python";
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === "--viz") {
    vizType = argv[++i];
  } else if (a.startsWith("--viz=")) {
    vizType = a.slice("--viz=".length);
  } else if (a === "--kind") {
    kind = argv[++i];
  } else if (a.startsWith("--kind=")) {
    kind = a.slice("--kind=".length);
  } else if (a.startsWith("-")) {
    console.error(`Unknown flag: ${a}`);
    process.exit(2);
  } else {
    positional.push(a);
  }
}
const [slug, nRaw, title] = positional;
if (!slug || !nRaw || !title) {
  console.error(
    'Usage: node scripts/scaffold-lesson.mjs <slug> <N> "<title>" [--viz plot|draw] [--kind python|js]'
  );
  process.exit(2);
}
if (kind !== "python" && kind !== "js") {
  console.error(`--kind must be "python" or "js". Got: ${kind ?? "(missing value)"}`);
  process.exit(2);
}
if (kind === "python" && vizType !== "plot" && vizType !== "draw") {
  console.error(`--viz must be "plot" or "draw". Got: ${vizType ?? "(missing value)"}`);
  process.exit(2);
}
const isJs = kind === "js";
const lang = isJs ? "javascript" : "python";
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

const fn1 = isJs ? "firstFunction" : "first_function"; // rename to your real exercise names
const lineComment = isJs ? "//" : "#"; // comment marker for the working language

// --- lesson.mdx (theory) ---
writeFileSync(
  join(lessonDir, "lesson.mdx"),
  `# ${title}

> One-sentence hook a 10-year-old wants to read.

## The big idea

Explain the ONE concept this lesson teaches, with a concrete analogy. Keep
sentences short. Show, don't lecture.

\`\`\`${lang}
${lineComment} A tiny, runnable example of the idea in action.
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

\`\`\`${lang}
${fn1}("example")   ${lineComment} -> "result"
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

if (isJs) {
  // ============================ JAVASCRIPT LESSON ============================
  // --- starter.js (stubs only — must define a stub for every tests.json entry) ---
  writeFileSync(
    join(lessonDir, "starter.js"),
    `// ${title}
// One or two lines framing the mission for the student.

function ${fn1}(x) {
  // Describe the steps; leave the one-line trick as a comment if helpful.
}

// Press Run to see your game in the Game panel!
`
  );

  // --- js.json (signals a "javascript" lesson + drives the live game canvas) ---
  // Every field of "preview" is optional: a render-only lesson omits update; a
  // grading-only lesson omits "preview" entirely. update(state, input) -> state
  // runs each frame; render(ctx, state) draws it. The names below must exist in
  // the student's code (and reference.js). Delete what this lesson doesn't use.
  const jsJson = {
    preview: {
      width: 480,
      height: 360,
      fps: 60,
      // init: "createState",   // () -> initial state object
      // update: "update",      // (state, input) -> new state, called each frame
      render: "render", //         (ctx, state) -> void, draws each frame
      // keys: ["ArrowLeft", "ArrowRight", " "],  // keys exposed in input.keys
      caption: "What the student should watch happen here.",
    },
  };
  writeFileSync(join(lessonDir, "js.json"), JSON.stringify(jsJson, null, 2) + "\n");

  // --- reference.js (the ANSWER KEY — write this FIRST, before tests.json) ---
  writeFileSync(
    join(lessonDir, "reference.js"),
    `// reference.js — answer key for ${slug}/lesson-${nn} (${title}).
//
// INERT: loadLesson.ts only reads the student filenames (lesson.mdx,
// exercises.mdx, tests.json, rubric.json, starter.js, js.json), so this file is
// never served or built. WRITE THIS FIRST, then generate tests.json expected
// values from it: reference.js is the source of truth.
//
// Run \`npm run validate-class ${slug}\` to check tests.json + the preview fns
// against this answer key (it runs reference.js in a node sandbox).

function ${fn1}(x) {
  // The real, correct implementation goes here.
  throw new Error("not implemented");
}

// Any preview fns named in js.json (render/update/init) go here too, e.g.:
// function render(ctx, state) { /* draw the scene */ }
`
  );

  console.log(`✓ Created ${lessonDir}/ with lesson.mdx, exercises.mdx, tests.json,`);
  console.log(`  rubric.json, starter.js, js.json, reference.js  (kind "js")`);
  console.log("");
  console.log("Next (the proven order — reference.js BEFORE tests.json):");
  console.log(`  1. Write reference.js with the real solution(s) + preview fns.`);
  console.log(`  2. Run reference.js to GENERATE the exact expected values for tests.json.`);
  console.log(`  3. Rename "${fn1}" everywhere to your real exercise names.`);
  console.log(`  4. Set js.json "preview" (init/update/render names, keys) for the game canvas.`);
  console.log(`  5. Write the student-facing files in a 10-year-old voice.`);
  console.log(`  6. npm run validate-class ${slug}   (until green)`);
  console.log(`  7. Add the week to content/classes/${slug}/syllabus.ts, status "published".`);
} else {
  // ============================== PYTHON LESSON =============================
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

  // --- viz.json (REAL teaching panel — a plot graph or a pixel-grid drawing) ---
  // "draw" panels point resultFn at the student's own function, which must return
  // a 2D grid: a list of rows, each row a list of cells (a color name like "red",
  // an emoji, or "" for an empty/see-through square). See components/PixelCanvas.tsx
  // and the Pixel Wizards lessons for the contract.
  const vizJson =
    vizType === "draw"
      ? {
          type: "draw",
          resultFn: fn1, // rename to the function that returns the grid
          demoArgs: ["example"], // args passed to resultFn for the live preview
          title: "What this drawing shows about the concept",
        }
      : {
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
        };
  writeFileSync(join(lessonDir, "viz.json"), JSON.stringify(vizJson, null, 2) + "\n");

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
  console.log(`  rubric.json, starter.py, viz.json (type "${vizType}"), reference.py`);
  console.log("");
  console.log("Next (the proven order — reference.py BEFORE tests.json):");
  console.log(`  1. Write reference.py with the real solution(s).`);
  console.log(`  2. Run reference.py to GENERATE the exact expected values for tests.json.`);
  console.log(`  3. Rename "${fn1}" everywhere to your real exercise names.`);
  console.log(
    vizType === "draw"
      ? `  4. Point viz.json resultFn at the function that returns the pixel grid, and set demoArgs.`
      : `  4. Design the viz.json graph so it reveals the concept.`
  );
  console.log(`  5. Write the student-facing files in a 10-year-old voice.`);
  console.log(`  6. npm run validate-class ${slug}   (until green)`);
  console.log(`  7. Add the week to content/classes/${slug}/syllabus.ts, status "published".`);
}
