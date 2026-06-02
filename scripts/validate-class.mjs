#!/usr/bin/env node
// Validate lesson content for one class (or all classes).
//
// Catches the mechanical mistakes that silently ship broken lessons:
//   - malformed tests.json / rubric.json / viz.json
//   - expected values in tests.json that don't match a real solution
//   - a viz graph that crashes or returns non-plottable data
//   - starter.py / reference.py that don't compile
//   - a tests.json entry with no matching stub in starter.py
//
// Usage:
//   node scripts/validate-class.mjs            # every class
//   node scripts/validate-class.mjs leo-codes  # one class
//
// The expected-value check needs a reference.py (the answer key) in the lesson
// dir. Lessons without one still get every other check. reference.py is the
// source of truth: tests.json expected values are generated from it.
//
// IMPORTANT: the expected-vs-actual comparison reuses the REAL valuesMatch()
// from public/pyodide-worker.js (read + eval'd below) so it can never drift from
// what students' code is graded against in the browser.

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CLASSES_DIR = join(ROOT, "content", "classes");
const WORKER = join(ROOT, "public", "pyodide-worker.js");

// ---------------------------------------------------------------------------
// Borrow the real valuesMatch() from the worker (do NOT reimplement it).
// ---------------------------------------------------------------------------
function loadValuesMatch() {
  const src = readFileSync(WORKER, "utf-8");
  const start = src.indexOf("function valuesMatch");
  if (start === -1) throw new Error("Could not find valuesMatch in " + WORKER);
  // Balance braces from the first "{" after the signature to grab the whole fn.
  const braceStart = src.indexOf("{", start);
  let depth = 0;
  let end = -1;
  for (let i = braceStart; i < src.length; i++) {
    if (src[i] === "{") depth++;
    else if (src[i] === "}") {
      depth--;
      if (depth === 0) {
        end = i + 1;
        break;
      }
    }
  }
  if (end === -1) throw new Error("Could not balance braces for valuesMatch");
  const fnSrc = src.slice(start, end);
  return (0, eval)("(" + fnSrc + ")");
}
const valuesMatch = loadValuesMatch();

// ---------------------------------------------------------------------------
// Python driver: import reference.py, run each test case, run the viz. Returns
// JSON on stdout: { actuals: [...], viz: {...} }. Spec arrives on stdin.
// ---------------------------------------------------------------------------
const PY_DRIVER = `
import sys, json, importlib.util

spec = json.load(sys.stdin)
mod = None
load_error = None
try:
    s = importlib.util.spec_from_file_location("reference", spec["refPath"])
    mod = importlib.util.module_from_spec(s)
    s.loader.exec_module(mod)
except Exception as e:
    load_error = repr(e)

def run_case(entry, args):
    fn = getattr(mod, entry, None)
    if fn is None:
        return {"error": "no function named " + entry + " in reference.py"}
    try:
        return {"value": fn(*args)}
    except Exception as e:
        return {"error": repr(e)}

out = {"loadError": load_error, "actuals": [], "viz": None}
if load_error is None:
    for c in spec["cases"]:
        out["actuals"].append(run_case(c["entry"], c["args"]))

    if spec.get("viz") is not None:
        v = spec["viz"]
        try:
            # The real app prepends the (student) solution, then the viz setup;
            # we prepend reference.py by exec'ing setup in the module namespace
            # so the graph can call the lesson's own functions if it needs to.
            if v.get("setup"):
                exec(v["setup"], mod.__dict__)
            fn = mod.__dict__.get(v["resultFn"])
            if fn is None:
                out["viz"] = {"error": "no resultFn named " + v["resultFn"]}
            else:
                result = fn(*v.get("demoArgs", []))
                json.dumps(result)  # must be serializable
                out["viz"] = {"value": result}
        except Exception as e:
            out["viz"] = {"error": repr(e)}

print(json.dumps(out))
`;

function runPython(spec) {
  const stdout = execFileSync("python3", ["-c", PY_DRIVER], {
    input: JSON.stringify(spec),
    encoding: "utf-8",
    maxBuffer: 64 * 1024 * 1024,
  });
  return JSON.parse(stdout);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function pyCompile(file) {
  execFileSync("python3", ["-m", "py_compile", file], { stdio: "pipe" });
}

function isPlotSeries(result) {
  // Accept either a single [[x,y],...] series, or a list of series objects
  // each having a "points" array.
  if (!Array.isArray(result)) return false;
  if (result.length === 0) return true; // empty plot is allowed
  const first = result[0];
  if (Array.isArray(first)) {
    return result.every((p) => Array.isArray(p) && p.length >= 2);
  }
  if (first && typeof first === "object") {
    return result.every(
      (s) => s && typeof s === "object" && Array.isArray(s.points)
    );
  }
  return false;
}

function isDrawGrid(result) {
  // A pixel-grid drawing: a non-empty list of rows, each row a list of cells
  // (color name / emoji string, number, or null/"" for empty).
  if (!Array.isArray(result) || result.length === 0) return false;
  return result.every(
    (row) =>
      Array.isArray(row) &&
      row.every((c) => c === null || ["string", "number"].includes(typeof c))
  );
}

function lessonDirs(classDir) {
  return readdirSync(classDir)
    .filter((d) => /^(?:lesson|week)-\d+/.test(d))
    .filter((d) => statSync(join(classDir, d)).isDirectory())
    .sort();
}

// ---------------------------------------------------------------------------
// Validate one lesson. Returns { checks: [{ok, label, detail?}], skippedRef }
// ---------------------------------------------------------------------------
function validateLesson(lessonDir) {
  const checks = [];
  const add = (ok, label, detail) => checks.push({ ok, label, detail });

  // 1. JSON parse
  let tests = null;
  let viz = null;
  for (const [name, required] of [
    ["tests.json", false],
    ["rubric.json", false],
    ["viz.json", false],
  ]) {
    const p = join(lessonDir, name);
    if (!existsSync(p)) {
      if (required) add(false, `${name} present`, "missing");
      continue;
    }
    try {
      const parsed = JSON.parse(readFileSync(p, "utf-8"));
      add(true, `${name} parses`);
      if (name === "tests.json") tests = parsed;
      if (name === "viz.json") viz = parsed;
    } catch (e) {
      add(false, `${name} parses`, e.message);
    }
  }

  // 2. py_compile starter.py and reference.py
  const starterPath = join(lessonDir, "starter.py");
  const refPath = join(lessonDir, "reference.py");
  let starterSrc = null;
  if (existsSync(starterPath)) {
    starterSrc = readFileSync(starterPath, "utf-8");
    try {
      pyCompile(starterPath);
      add(true, "starter.py compiles");
    } catch (e) {
      add(false, "starter.py compiles", String(e.stderr || e.message).trim());
    }
  }
  const hasRef = existsSync(refPath);
  if (hasRef) {
    try {
      pyCompile(refPath);
      add(true, "reference.py compiles");
    } catch (e) {
      add(false, "reference.py compiles", String(e.stderr || e.message).trim());
    }
  }

  // 3. Stub check: each tests.json entry has a def in starter.py
  if (tests && starterSrc !== null) {
    for (const t of tests) {
      const hasStub = new RegExp(`def\\s+${t.entry}\\s*\\(`).test(starterSrc);
      add(hasStub, `starter.py defines ${t.entry}()`, hasStub ? undefined : "no stub");
    }
  }

  // 4. Expected-value check + viz check via python3 (needs reference.py)
  if (hasRef && (tests || viz)) {
    const flatCases = [];
    if (tests) {
      for (const t of tests) {
        for (const c of t.cases || []) {
          flatCases.push({ entry: t.entry, args: c.args || [], expected: c.expected, tol: c.tol ?? t.tol });
        }
      }
    }
    // Progressive "draw" lessons declare stages instead of a resultFn. Each
    // stage's expected grid must match what reference.py actually returns, so we
    // run them through the same reference-execution + valuesMatch path as tests
    // (this also catches a stage's embedded `expected` drifting from the answer).
    const stageCases =
      viz && viz.type === "draw" && Array.isArray(viz.stages)
        ? viz.stages.map((s) => ({ entry: s.fn, args: s.args || [], expected: s.expected }))
        : [];
    const usesResultFn = viz && !(viz.type === "draw" && Array.isArray(viz.stages));
    const allCases = [...flatCases, ...stageCases];

    let res;
    try {
      res = runPython({
        refPath,
        cases: allCases.map(({ entry, args }) => ({ entry, args })),
        viz: usesResultFn ? { setup: viz.setup || "", resultFn: viz.resultFn, demoArgs: viz.demoArgs || [] } : null,
      });
    } catch (e) {
      add(false, "python3 reference run", String(e.stderr || e.message).trim());
      res = null;
    }

    if (res && res.loadError) {
      add(false, "reference.py imports", res.loadError);
    } else if (res) {
      // expected-value comparisons (tests)
      flatCases.forEach((c, i) => {
        const a = res.actuals[i];
        if (!a || "error" in a) {
          add(false, `${c.entry}: ${caseName(tests, c, i)}`, a ? a.error : "no result");
          return;
        }
        const ok = valuesMatch(a.value, c.expected, c.tol);
        add(
          ok,
          `${c.entry}: ${caseName(tests, c, i)}`,
          ok ? undefined : `expected ${JSON.stringify(c.expected)}, got ${JSON.stringify(a.value)}`
        );
      });

      // viz stage checks (progressive draw lessons)
      stageCases.forEach((c, j) => {
        const a = res.actuals[flatCases.length + j];
        if (!a || "error" in a) {
          add(false, `viz stage ${c.entry}()`, a ? a.error : "no result");
          return;
        }
        const ok = valuesMatch(a.value, c.expected);
        add(
          ok,
          `viz stage ${c.entry}() draws the right picture`,
          ok ? undefined : `expected ${JSON.stringify(c.expected)}, got ${JSON.stringify(a.value)}`
        );
      });

      // viz check for simple-mode (resultFn) draw / plot lessons.
      if (usesResultFn) {
        if (res.viz && "value" in res.viz) {
          if (viz.type === "draw") {
            const ok = isDrawGrid(res.viz.value);
            add(ok, `viz ${viz.resultFn}() returns a pixel grid`, ok ? undefined : "not a list of rows of cells");
          } else {
            const ok = isPlotSeries(res.viz.value);
            add(ok, `viz ${viz.resultFn}() returns plottable series`, ok ? undefined : "not a [x,y] / points series");
          }
        } else {
          add(false, `viz ${viz.resultFn}() runs`, res.viz ? res.viz.error : "no viz result");
        }
      }
    }
  } else if (viz && !hasRef) {
    add(true, "viz.json parses (viz run skipped — no reference.py)");
  }

  return { checks, skippedRef: !hasRef };
}

// Map a flat case index back to its human-readable name from tests.json.
function caseName(tests, c, flatIndex) {
  if (!tests) return c.entry;
  let i = 0;
  for (const t of tests) {
    for (const cc of t.cases || []) {
      if (i === flatIndex) return cc.name || c.entry;
      i++;
    }
  }
  return c.entry;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function classDirs(slug) {
  if (slug) {
    const d = join(CLASSES_DIR, slug);
    if (!existsSync(d) || !statSync(d).isDirectory()) {
      console.error(`No such class: ${slug} (looked in ${d})`);
      process.exit(2);
    }
    return [slug];
  }
  return readdirSync(CLASSES_DIR)
    .filter((d) => statSync(join(CLASSES_DIR, d)).isDirectory())
    .sort();
}

const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const DIM = "\x1b[2m";
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";

const slug = process.argv[2];
let totalChecks = 0;
let totalFailed = 0;
let lessonsWithoutRef = 0;

for (const cls of classDirs(slug)) {
  const classDir = join(CLASSES_DIR, cls);
  const lessons = lessonDirs(classDir);
  if (lessons.length === 0) continue;
  console.log(`\n${BOLD}${cls}${RESET}`);

  for (const lesson of lessons) {
    const { checks, skippedRef } = validateLesson(join(classDir, lesson));
    const failed = checks.filter((c) => !c.ok);
    totalChecks += checks.length;
    totalFailed += failed.length;
    if (skippedRef) lessonsWithoutRef++;

    const mark = failed.length === 0 ? `${GREEN}✓${RESET}` : `${RED}✗${RESET}`;
    const refNote = skippedRef ? ` ${DIM}(no reference.py — value checks skipped)${RESET}` : "";
    console.log(`  ${mark} ${lesson}  ${DIM}${checks.length} checks${RESET}${refNote}`);
    for (const f of failed) {
      console.log(`      ${RED}✗ ${f.label}${RESET}${f.detail ? `\n        ${DIM}${f.detail}${RESET}` : ""}`);
    }
  }
}

console.log(
  `\n${totalFailed === 0 ? GREEN + "PASS" : RED + "FAIL"}${RESET} — ` +
    `${totalChecks - totalFailed}/${totalChecks} checks passed` +
    (lessonsWithoutRef ? `, ${lessonsWithoutRef} lesson(s) without reference.py` : "")
);

process.exit(totalFailed === 0 ? 0 : 1);
