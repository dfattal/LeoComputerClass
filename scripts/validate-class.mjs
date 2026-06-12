#!/usr/bin/env node
// Validate lesson content for one class (or all classes).
//
// Catches the mechanical mistakes that silently ship broken lessons:
//   - malformed tests.json / rubric.json / viz.json
//   - expected values in tests.json that don't match a real solution
//   - a viz graph that crashes or returns non-plottable data
//   - starter.py / reference.py that don't compile
//   - a tests.json entry with no matching stub in starter.py
//   - lesson.mdx / exercises.mdx that don't compile as MDX (e.g. raw {braces}
//     in prose are parsed as a JSX expression and 500 the page at request
//     time — `npm run build` stays green because lesson pages render on demand)
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
// from public/values-match.js (read + eval'd below) — the SAME file both the
// Python (pyodide-worker.js) and JS (js-worker.js) graders importScripts, so it
// can never drift from what students' code is graded against in the browser.

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import vm from "node:vm";
// The latex-lesson grader — the SAME module the browser runs, so reference.tex
// is proven against exactly what students are graded with.
import { checkDocument } from "../lib/latex/check.mjs";
// The MDX compiler + the SAME plugin pipeline the lesson page renders with
// (app/classes/[classSlug]/[lessonSlug]/page.tsx), so a file that compiles here
// can't fail there.
import { compile as mdxCompile } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CLASSES_DIR = join(ROOT, "content", "classes");
const VALUES_MATCH_SRC = join(ROOT, "public", "values-match.js");

// ---------------------------------------------------------------------------
// Borrow the real valuesMatch() from the shared file (do NOT reimplement it).
// ---------------------------------------------------------------------------
function loadValuesMatch() {
  const src = readFileSync(VALUES_MATCH_SRC, "utf-8");
  const start = src.indexOf("function valuesMatch");
  if (start === -1)
    throw new Error("Could not find valuesMatch in " + VALUES_MATCH_SRC);
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
            if v.get("resultFns") is not None:
                # Progressive plot: run every stage's producer; each must return
                # plottable data when driven by the reference solution.
                vals = []
                for rf in v["resultFns"]:
                    fn = mod.__dict__.get(rf["resultFn"])
                    if fn is None:
                        vals.append({"error": "no resultFn named " + rf["resultFn"]})
                    else:
                        result = fn(*rf.get("demoArgs", []))
                        json.dumps(result)  # must be serializable
                        vals.append({"value": result})
                out["viz"] = {"values": vals}
            else:
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
// JavaScript reference runner (for "javascript" lessons). Loads reference.js in
// a node:vm context the SAME way public/js-worker.js does (wrap in a function,
// return the named entries) so the answer key is exercised exactly as a
// student's code is in the browser. Returns { [name]: fn|undefined }.
// ---------------------------------------------------------------------------
function loadJsReference(src, names) {
  const uniq = [...new Set(names.filter(Boolean))];
  const exports = uniq
    .map(
      (n) => `${JSON.stringify(n)}: (typeof ${n} !== "undefined" ? ${n} : undefined)`
    )
    .join(", ");
  const wrapped = `(function(){ "use strict";\n${src}\n;\nreturn { ${exports} }; })`;
  const context = vm.createContext({ console, Math, JSON });
  const factory = vm.runInContext(wrapped, context, { timeout: 5000 });
  return factory();
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
  // Also accept a { grid, caption } wrapper — the same shape PixelCanvas renders
  // (lets a simple-mode draw ship a readable caption/legend with its grid).
  if (
    result &&
    typeof result === "object" &&
    !Array.isArray(result) &&
    "grid" in result
  ) {
    result = result.grid;
  }
  if (!Array.isArray(result) || result.length === 0) return false;
  return result.every(
    (row) =>
      Array.isArray(row) &&
      row.every((c) => c === null || ["string", "number"].includes(typeof c))
  );
}

// Find the *student exercise* functions in an exercises.mdx — the `def NAME(...)`
// stubs the kid has to fill in. A stub has a bare `pass` body and no `return`;
// the recap/Setup defs copied from prior weeks have real `return` bodies and are
// (correctly) ignored, as are complete worked examples like `always_one`. Used
// to prove every student task actually has a tests.json entry (else the kid gets
// no Run Tests feedback for it — exactly how leo/week-02's get_bit slipped through).
function findExerciseStubs(mdxSrc) {
  const lines = mdxSrc.split("\n");
  const stubs = [];
  let cur = null; // { name, body: [] }
  const flush = () => {
    if (cur) {
      const body = cur.body.join("\n");
      const isStub = /^\s*pass\s*$/m.test(body) && !/^\s*return\b/m.test(body);
      if (isStub) stubs.push(cur.name);
      cur = null;
    }
  };
  for (const line of lines) {
    const m = line.match(/^def\s+([A-Za-z_]\w*)\s*\(/);
    if (m) {
      flush();
      cur = { name: m[1], body: [] };
      continue;
    }
    if (cur) {
      // Body continues over indented or blank lines; the first non-indented,
      // non-blank line (next prose, a code-fence, etc.) ends the def.
      if (line.trim() === "" || /^\s/.test(line)) cur.body.push(line);
      else flush();
    }
  }
  flush();
  return [...new Set(stubs)];
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
async function validateLesson(lessonDir) {
  const checks = [];
  const add = (ok, label, detail) => checks.push({ ok, label, detail });

  // 0. MDX compile: both prose files must compile with the page's exact
  // pipeline. Personalization tokens are substituted first, like the page does
  // (personalizeText runs before <MDXRemote>). strict:"ignore" only silences
  // KaTeX's emoji/unicode warnings — it can't change pass/fail.
  for (const name of ["lesson.mdx", "exercises.mdx"]) {
    const p = join(lessonDir, name);
    if (!existsSync(p)) {
      add(false, `${name} present`, "missing — loadLesson.ts requires it");
      continue;
    }
    const src = readFileSync(p, "utf-8").replace(/\{\{[A-Z_]+\}\}/g, "Leo");
    try {
      await mdxCompile(src, {
        remarkPlugins: [remarkGfm, remarkMath],
        rehypePlugins: [[rehypeKatex, { strict: "ignore" }]],
      });
      add(true, `${name} compiles (MDX)`);
    } catch (e) {
      const where = e.line ? ` (line ${e.line})` : "";
      add(false, `${name} compiles (MDX)`, `${e.message}${where}`);
    }
  }

  // 1. JSON parse
  let tests = null;
  let viz = null;
  let reflection = null;
  let latex = null;
  let js = null;
  for (const [name, required] of [
    ["tests.json", false],
    ["rubric.json", false],
    ["viz.json", false],
    ["reflection.json", false],
    ["latex.json", false],
    ["js.json", false],
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
      if (name === "reflection.json") reflection = parsed;
      if (name === "latex.json") latex = parsed;
      if (name === "js.json") js = parsed;
    } catch (e) {
      add(false, `${name} parses`, e.message);
    }
  }

  // 1b. Reflection lessons (no Python): must carry a question + non-empty lookFor
  // so the AI grader has something to assess against.
  if (reflection) {
    const hasQ =
      typeof reflection.question === "string" && reflection.question.trim().length > 0;
    add(hasQ, "reflection.json has a question", hasQ ? undefined : "missing/empty question");
    const hasLookFor =
      Array.isArray(reflection.lookFor) && reflection.lookFor.length > 0;
    add(
      hasLookFor,
      "reflection.json has lookFor key ideas",
      hasLookFor ? undefined : "lookFor must be a non-empty array"
    );
  }

  // 1c. Latex lessons (no Python): the answer key is reference.tex, and it must
  // pass EVERY exercise check from latex.json under the real checker. Also make
  // sure starter.tex carries a `%% id` marker for each exercise so the student
  // has somewhere to write.
  const refTexPath = join(lessonDir, "reference.tex");
  const hasRefTex = existsSync(refTexPath);
  if (latex) {
    const exercises = Array.isArray(latex.exercises) ? latex.exercises : [];
    add(
      exercises.length > 0,
      "latex.json has exercises",
      exercises.length ? undefined : "exercises must be a non-empty array"
    );
    const ids = new Set(exercises.map((e) => e.id));
    add(
      ids.size === exercises.length,
      "latex.json exercise ids are unique",
      ids.size === exercises.length ? undefined : "duplicate exercise id"
    );

    const starterTexPath = join(lessonDir, "starter.tex");
    if (existsSync(starterTexPath)) {
      const starterTex = readFileSync(starterTexPath, "utf-8");
      for (const ex of exercises) {
        const has = new RegExp(`^\\s*%%\\s*${ex.id}\\s*$`, "m").test(starterTex);
        add(has, `starter.tex has marker %% ${ex.id}`, has ? undefined : "no marker line");
      }
    } else {
      add(false, "starter.tex present", "missing");
    }

    if (hasRefTex) {
      try {
        const { results } = checkDocument(readFileSync(refTexPath, "utf-8"), latex);
        for (const r of results)
          add(r.passed, `reference.tex: ${r.name}`, r.error ?? undefined);
      } catch (e) {
        add(false, "reference.tex passes the checker", e.message);
      }
    } else {
      add(false, "reference.tex present (answer key)", "missing — write it before latex.json");
    }
  }

  // 1d. Javascript lessons (Game Studio): the answer key is reference.js. It must
  // define every tests.json entry and produce each case's expected value under
  // the SAME valuesMatch the browser uses; starter.js must carry a stub for each
  // entry; and any preview fns named in js.json must exist (and init/update run).
  const refJsPath = join(lessonDir, "reference.js");
  const starterJsPath = join(lessonDir, "starter.js");
  if (js) {
    const preview = js.preview || null;

    if (existsSync(starterJsPath)) {
      const starterJs = readFileSync(starterJsPath, "utf-8");
      if (tests) {
        for (const t of tests) {
          const re = new RegExp(
            `(function\\s+${t.entry}\\s*\\(|\\b(?:const|let|var)\\s+${t.entry}\\s*=)`
          );
          const has = re.test(starterJs);
          add(has, `starter.js defines ${t.entry}`, has ? undefined : "no stub (function or const)");
        }
      }
    } else {
      add(false, "starter.js present", "missing");
    }

    if (existsSync(refJsPath)) {
      const refSrc = readFileSync(refJsPath, "utf-8");
      const names = [];
      if (tests) for (const t of tests) names.push(t.entry);
      if (preview)
        for (const k of ["init", "update", "render"]) if (preview[k]) names.push(preview[k]);
      let fns = null;
      try {
        fns = loadJsReference(refSrc, names);
        add(true, "reference.js loads");
      } catch (e) {
        add(false, "reference.js loads", e.message);
      }

      if (fns && tests) {
        for (const t of tests) {
          const fn = fns[t.entry];
          for (const c of t.cases || []) {
            if (typeof fn !== "function") {
              add(false, `${t.entry}: ${c.name}`, `reference.js has no function named ${t.entry}`);
              continue;
            }
            let actual;
            try {
              actual = fn(...(c.args ? JSON.parse(JSON.stringify(c.args)) : []));
            } catch (e) {
              add(false, `${t.entry}: ${c.name}`, String(e.message || e));
              continue;
            }
            const ok = valuesMatch(actual, c.expected, c.tol ?? t.tol);
            add(
              ok,
              `${t.entry}: ${c.name}`,
              ok ? undefined : `expected ${JSON.stringify(c.expected)}, got ${JSON.stringify(actual)}`
            );
          }
        }
      }

      if (fns && preview) {
        for (const k of ["init", "update", "render"]) {
          if (preview[k]) {
            const ok = typeof fns[preview[k]] === "function";
            add(ok, `reference.js preview ${k}() = ${preview[k]}`, ok ? undefined : "not a function");
          }
        }
        if (preview.init && typeof fns[preview.init] === "function") {
          try {
            const state = fns[preview.init](...(preview.initArgs || []));
            if (preview.update && typeof fns[preview.update] === "function") {
              const input = {
                keys: {},
                mouseX: 0,
                mouseY: 0,
                mouseDown: false,
                width: preview.width || 480,
                height: preview.height || 360,
                frame: 0,
              };
              fns[preview.update](state, input);
            }
            add(true, "reference.js preview init/update run");
          } catch (e) {
            add(false, "reference.js preview init/update run", String(e.message || e));
          }
        }
      }
    } else {
      add(false, "reference.js present (answer key)", "missing — write it before js.json");
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

  // 3b. Reverse stub check: every student-exercise stub in exercises.mdx must
  // have a tests.json entry, or the kid writes a function and gets no Run Tests
  // feedback for it (the bug that hid leo/week-02's get_bit). Python lessons only
  // — latex/js/reflection lessons have no tests.json so `tests` is null here.
  if (tests) {
    const exPath = join(lessonDir, "exercises.mdx");
    if (existsSync(exPath)) {
      const entries = new Set(tests.map((t) => t.entry));
      for (const name of findExerciseStubs(readFileSync(exPath, "utf-8"))) {
        const tested = entries.has(name);
        add(
          tested,
          `exercises.mdx task ${name}() has a test`,
          tested ? undefined : "stub has no tests.json entry — student gets no Run Tests feedback"
        );
      }
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
    // Progress-aware plot caption: each check's expected/tol must match what
    // reference.py returns for the curve-driving fn (keeps the baked caption
    // honest against the answer key — same idea as the draw stages above).
    const captionCases =
      viz && viz.type === "plot" && viz.caption && Array.isArray(viz.caption.checks)
        ? viz.caption.checks.map((c) => ({ entry: c.fn, args: c.args || [], expected: c.expected, tol: c.tol }))
        : [];
    // Progressive "plot" lessons (pin-to-play) declare stages, each with its own
    // resultFn producer + a `check`. The check's expected/tol must agree with
    // reference.py (same honesty guarantee as the draw stages / plot caption).
    const isPlotStages = viz && viz.type === "plot" && Array.isArray(viz.stages);
    const plotStageCases = isPlotStages
      ? viz.stages.map((s) => ({ entry: s.check.fn, args: s.check.args || [], expected: s.check.expected, tol: s.check.tol }))
      : [];
    const usesResultFn =
      viz && !(viz.type === "draw" && Array.isArray(viz.stages)) && !isPlotStages;
    const allCases = [...flatCases, ...stageCases, ...captionCases, ...plotStageCases];

    let res;
    try {
      res = runPython({
        refPath,
        cases: allCases.map(({ entry, args }) => ({ entry, args })),
        viz: isPlotStages
          ? {
              setup: viz.setup || "",
              resultFns: viz.stages.map((s) => ({ resultFn: s.resultFn, demoArgs: s.demoArgs || [] })),
            }
          : usesResultFn
            ? { setup: viz.setup || "", resultFn: viz.resultFn, demoArgs: viz.demoArgs || [] }
            : null,
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

      // viz caption checks (progress-aware plot lessons)
      captionCases.forEach((c, k) => {
        const a = res.actuals[flatCases.length + stageCases.length + k];
        if (!a || "error" in a) {
          add(false, `viz caption check ${c.entry}()`, a ? a.error : "no result");
          return;
        }
        const ok = valuesMatch(a.value, c.expected, c.tol);
        add(
          ok,
          `viz caption check ${c.entry}() matches reference`,
          ok ? undefined : `expected ${JSON.stringify(c.expected)}, got ${JSON.stringify(a.value)}`
        );
      });

      // viz check for progressive plot lessons: each stage's `check` must agree
      // with reference.py, and each stage's producer must return plottable data.
      plotStageCases.forEach((c, k) => {
        const a = res.actuals[flatCases.length + stageCases.length + captionCases.length + k];
        if (!a || "error" in a) {
          add(false, `viz plot stage check ${c.entry}()`, a ? a.error : "no result");
          return;
        }
        const ok = valuesMatch(a.value, c.expected, c.tol);
        add(
          ok,
          `viz plot stage check ${c.entry}() matches reference`,
          ok ? undefined : `expected ${JSON.stringify(c.expected)}, got ${JSON.stringify(a.value)}`
        );
      });
      if (isPlotStages) {
        const vals = res.viz && Array.isArray(res.viz.values) ? res.viz.values : null;
        if (!vals) {
          add(false, "viz plot stages run", res.viz ? res.viz.error : "no viz result");
        } else {
          viz.stages.forEach((s, k) => {
            const a = vals[k];
            if (!a || "error" in a) {
              add(false, `viz stage ${s.resultFn}() runs`, a ? a.error : "no result");
              return;
            }
            const ok = isPlotSeries(a.value);
            add(ok, `viz stage ${s.resultFn}() returns plottable series`, ok ? undefined : "not a [x,y] / points series");
          });
        }
      }

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

  // Latex, reflection, and javascript lessons have no reference.py by design —
  // don't count them as "missing the answer key" (js has reference.js instead).
  return { checks, skippedRef: !hasRef && !latex && !reflection && !js };
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
    const { checks, skippedRef } = await validateLesson(join(classDir, lesson));
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
