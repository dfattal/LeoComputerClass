#!/usr/bin/env node
// Scaffold a progress-aware `caption` config for a plot lesson (GH #4).
//
// Reads the lesson's tests.json + viz.json and prints a paste-ready `caption`
// block to stdout: one `{ fn, args, expected, tol }` check per curve-driving
// student function (i.e. each tests.json entry whose name the viz `setup`
// actually calls), derived from that entry's FIRST case, plus three caption
// strings stubbed as TODO for the author to rewrite in a 10-year-old voice.
//
// This automates the mechanical half. The human pastes the block into viz.json
// and writes the copy; `npm run validate-class <class>` then cross-checks each
// check's expected/tol against reference.py.
//
// Usage:
//   node scripts/scaffold-captions.mjs leo-physics lesson-02
//
// Caption-state semantics (see CourseShell's caption driver):
//   todo    — a check fn is missing / errors / returns None  → "Finish <fn> …"
//   tuning  — checks run but don't all match within tol      → "keep tuning"
//   match   — every check matches within tol                 → "✅ … matches"

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CLASSES_DIR = join(ROOT, "content", "classes");

const [cls, lesson] = process.argv.slice(2);
if (!cls || !lesson) {
  console.error("Usage: node scripts/scaffold-captions.mjs <class> <lesson>");
  console.error("   e.g. node scripts/scaffold-captions.mjs leo-physics lesson-02");
  process.exit(2);
}

const lessonDir = join(CLASSES_DIR, cls, lesson);
const testsPath = join(lessonDir, "tests.json");
const vizPath = join(lessonDir, "viz.json");

if (!existsSync(vizPath)) {
  console.error(`No viz.json in ${cls}/${lesson} — captions are for plot lessons.`);
  process.exit(2);
}
if (!existsSync(testsPath)) {
  console.error(`No tests.json in ${cls}/${lesson} — nothing to derive checks from.`);
  process.exit(2);
}

const viz = JSON.parse(readFileSync(vizPath, "utf-8"));
const tests = JSON.parse(readFileSync(testsPath, "utf-8"));

if (viz.type !== "plot") {
  console.error(`${cls}/${lesson} viz.json is type "${viz.type}", not "plot" — captions are plot-only.`);
  process.exit(2);
}
if (viz.caption) {
  console.error(`${cls}/${lesson} already has a caption block — nothing to scaffold.`);
  process.exit(2);
}

// Which student fns does the curve actually call? (whole-word match in setup +
// resultFn — same test audit-viz uses to call a viz "student-driven".)
const hay = `${viz.resultFn || ""}\n${viz.setup || ""}`;
const callsFn = (fn) => new RegExp(`\\b${fn}\\b`).test(hay);

const checks = [];
for (const entry of tests) {
  if (!entry.entry || !callsFn(entry.entry)) continue; // skip fns the curve ignores
  const first = (entry.cases || [])[0];
  if (!first) continue;
  const tol = first.tol ?? entry.tol;
  const check = { fn: entry.entry, args: first.args ?? [], expected: first.expected };
  if (tol !== undefined) check.tol = tol;
  checks.push(check);
}

if (!checks.length) {
  console.error(
    `Couldn't find any tests.json entry whose name appears in viz.setup for ${cls}/${lesson}.\n` +
      `The curve may be built without calling a student fn by name — add checks by hand.`
  );
  process.exit(1);
}

const driving = checks.map((c) => c.fn);
const firstFn = driving[0];

const caption = {
  todo: `TODO: Finish \`${firstFn}\` to see your own curve. (10-year-old voice)`,
  tuning: `TODO: Your curve is showing — keep tuning it to match the target.`,
  match: `TODO: ✅ Your simulation matches the exact answer!`,
  checks,
};

// Pretty-print as a paste-ready JSON fragment (trailing comma-free; the author
// slots it into viz.json before the closing brace).
const body = JSON.stringify({ caption }, null, 2)
  .replace(/^\{\n/, "")   // drop the wrapper "{"
  .replace(/\n\}$/, "");  // drop the wrapper "}"

console.error(`\n# ${cls}/${lesson} — curve-driving fn(s): ${driving.join(", ")}`);
console.error(`# Paste the block below into viz.json (add a comma after the field above it),`);
console.error(`# then rewrite the three TODO strings in ${firstFn}'s lesson voice.\n`);
console.log(body);
