#!/usr/bin/env node
// Audit every lesson's teaching panel (viz.json) and classify how it relates to
// the student's code. Helps track the "make graphs reflect student code" rollout
// (GH #1) and the progress-aware-caption work.
//
//   node scripts/audit-viz.mjs            # all classes
//   node scripts/audit-viz.mjs leo-space  # one class
//
// Classifications:
//   PROGRESSIVE      draw lesson with `stages` — advances + captions per step
//   STUDENT-DRIVEN   the viz calls one of the lesson's own functions by name
//   BAKED-IN         the viz computes the answer itself; ignores student code
//   (no-ref)         couldn't read tests.json to know the student fn names

import { readdirSync, statSync, existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CLASSES_DIR = join(ROOT, "content", "classes");

const only = process.argv[2];
const C = { reset: "\x1b[0m", dim: "\x1b[2m", red: "\x1b[31m", green: "\x1b[32m", yellow: "\x1b[33m", bold: "\x1b[1m" };

function readJSON(p) {
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

// Does the viz reference any of the student's function names (as a whole word)?
function callsStudentFn(viz, studentFns) {
  const hay = `${viz.resultFn || ""}\n${viz.setup || ""}`;
  return studentFns.some((fn) => new RegExp(`\\b${fn}\\b`).test(hay));
}

function classify(viz, studentFns) {
  if (viz.type === "draw" && Array.isArray(viz.stages)) return "PROGRESSIVE";
  if (!studentFns.length) return "no-ref";
  // draw simple-mode: resultFn IS a student fn → student-driven
  const driven =
    (viz.type === "draw" && viz.resultFn && studentFns.includes(viz.resultFn)) ||
    callsStudentFn(viz, studentFns);
  if (!driven) return "BAKED-IN";
  // plot lessons with a progress-aware caption get their own bucket
  if (viz.type === "plot" && viz.caption && Array.isArray(viz.caption.checks))
    return "STUDENT-DRIVEN+CAPTION";
  return "STUDENT-DRIVEN";
}

function lessonDirs(classDir) {
  return readdirSync(classDir)
    .filter((d) => /^(lesson|week)-\d+/.test(d))
    .filter((d) => statSync(join(classDir, d)).isDirectory())
    .sort();
}

const classSlugs = (only ? [only] : readdirSync(CLASSES_DIR)).filter((d) =>
  statSync(join(CLASSES_DIR, d)).isDirectory?.() ||
  (existsSync(join(CLASSES_DIR, d)) && statSync(join(CLASSES_DIR, d)).isDirectory())
);

const totals = { PROGRESSIVE: 0, "STUDENT-DRIVEN+CAPTION": 0, "STUDENT-DRIVEN": 0, "BAKED-IN": 0, "no-ref": 0, none: 0 };
const tag = {
  PROGRESSIVE: `${C.green}PROGRESSIVE${C.reset}`,
  "STUDENT-DRIVEN+CAPTION": `${C.green}STUDENT-DRIVEN+CAPTION${C.reset}`,
  "STUDENT-DRIVEN": `${C.green}STUDENT-DRIVEN${C.reset}`,
  "BAKED-IN": `${C.red}BAKED-IN${C.reset}`,
  "no-ref": `${C.yellow}no-ref${C.reset}`,
};

for (const slug of classSlugs) {
  const classDir = join(CLASSES_DIR, slug);
  if (!statSync(classDir).isDirectory()) continue;
  const dirs = lessonDirs(classDir);
  if (!dirs.length) continue;

  const rows = [];
  for (const d of dirs) {
    const vizPath = join(classDir, d, "viz.json");
    if (!existsSync(vizPath)) {
      totals.none++;
      continue;
    }
    const viz = readJSON(vizPath);
    if (!viz) {
      rows.push(`  ${d}  ${C.red}INVALID viz.json${C.reset}`);
      continue;
    }
    const tests = readJSON(join(classDir, d, "tests.json")) || [];
    const studentFns = tests.map((t) => t.entry).filter(Boolean);
    const klass = classify(viz, studentFns);
    totals[klass]++;
    const detail =
      klass === "BAKED-IN"
        ? `${C.dim}could call: ${studentFns.join(", ") || "?"}${C.reset}`
        : klass === "PROGRESSIVE"
        ? `${C.dim}${viz.stages.length} stages${C.reset}`
        : klass === "STUDENT-DRIVEN+CAPTION"
        ? `${C.dim}${viz.caption.checks.length} caption check(s)${C.reset}`
        : `${C.dim}${viz.type}${C.reset}`;
    rows.push(`  ${d.padEnd(10)} ${tag[klass].padEnd(34)} ${detail}`);
  }
  if (rows.length) {
    console.log(`\n${C.bold}${slug}${C.reset}`);
    rows.forEach((r) => console.log(r));
  }
}

console.log(
  `\n${C.bold}Totals${C.reset}  ` +
    `${C.green}progressive ${totals.PROGRESSIVE}${C.reset}  ` +
    `${C.green}student-driven+caption ${totals["STUDENT-DRIVEN+CAPTION"]}${C.reset}  ` +
    `${C.green}student-driven ${totals["STUDENT-DRIVEN"]}${C.reset}  ` +
    `${C.red}baked-in ${totals["BAKED-IN"]}${C.reset}  ` +
    `${C.yellow}no-ref ${totals["no-ref"]}${C.reset}` +
    (totals.none ? `  ${C.dim}(no viz: ${totals.none})${C.reset}` : "")
);
if (totals["BAKED-IN"] > 0) {
  console.log(`${C.dim}BAKED-IN graphs ignore student code — see GH #1.${C.reset}`);
}
