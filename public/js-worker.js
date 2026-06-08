/* eslint-disable no-restricted-globals */
// JavaScript Web Worker — runs a student's JS in a sandboxed worker context.
//
// The JS analog of pyodide-worker.js (for "javascript" lessons, e.g. Game
// Studio). No Pyodide: student functions are compiled with `new Function` and
// called directly. Grading uses the SAME valuesMatch() as the Python grader
// (shared file), so a JS lesson's tests.json is judged exactly like a Python
// lesson's — same TestResult shape, so submit/completion/AI-review work unchanged.
//
// The student's OWN code runs in their OWN browser, so the "sandbox" is about
// not freezing the UI and not leaking globals — the worker gives us both, and an
// infinite loop is killed by the main thread terminating the worker (useJsRunner
// owns the timeout, mirroring usePyodide).

importScripts("/values-match.js");

// --- Capture console output while student code runs ---------------------------
let __out = [];
let __err = [];
const realLog = console.log.bind(console);
const realError = console.error.bind(console);
const fmt = (a) =>
  typeof a === "string" ? a : (() => { try { return JSON.stringify(a); } catch { return String(a); } })();
function startCapture() {
  __out = [];
  __err = [];
  console.log = (...a) => __out.push(a.map(fmt).join(" "));
  console.error = (...a) => __err.push(a.map(fmt).join(" "));
  console.info = console.log;
  console.warn = console.error;
}
function stopCapture() {
  console.log = realLog;
  console.error = realError;
}

// Compile the student's code once and expose the named entry functions. Top-level
// `function f(){}`, `const f = …`, `let f = …` all land in the body scope, so we
// return a map { name: fn|undefined } for every entry the tests ask about.
// Throws on a syntax/parse error (caught by the caller for a friendly message).
function loadStudent(code, names) {
  const uniq = [...new Set(names)];
  const exports = uniq
    .map((n) => `${JSON.stringify(n)}: (typeof ${n} !== "undefined" ? ${n} : undefined)`)
    .join(", ");
  const body = `"use strict";\n${code}\n;\nreturn { ${exports} };`;
  // eslint-disable-next-line no-new-func
  const factory = new Function(body);
  return factory();
}

// Turn a JS error into something a 10-year-old can act on, while keeping the real
// message so it stays educational.
function friendlyError(e) {
  const type = e && e.name ? e.name : "Error";
  const msg = e && e.message ? e.message : String(e);
  if (type === "SyntaxError") {
    return {
      name: "JavaScript couldn't read your code",
      error:
        `There's a typo JavaScript can't understand (${msg}). ` +
        `Look for a missing }, ), ; or quote, or a stray word.`,
    };
  }
  if (type === "ReferenceError") {
    return {
      name: "Your code used a name JavaScript doesn't know",
      error:
        `${msg}. Did you spell a variable or function name differently from where you made it? ` +
        `(JavaScript is picky about capital letters — ballX and ballx are different.)`,
    };
  }
  return { name: "Your code hit a problem", error: `${type}: ${msg}` };
}

self.onmessage = function (e) {
  const { type, code, tests } = e.data;

  if (type === "run") {
    startCapture();
    try {
      // Execute the student's top-level code (defines functions, runs any
      // console.log). We don't auto-call anything — the live preview drives the
      // game; "Run" is for trying things out / printing.
      // eslint-disable-next-line no-new-func
      new Function(`"use strict";\n${code}`)();
      stopCapture();
      self.postMessage({
        type: "run-result",
        stdout: __out.join("\n"),
        stderr: __err.join("\n"),
        error: null,
      });
    } catch (err) {
      stopCapture();
      const f = friendlyError(err);
      self.postMessage({
        type: "run-result",
        stdout: __out.join("\n"),
        stderr: `${f.name}\n${f.error}`,
        error: null,
      });
    }
    return;
  }

  if (type === "test") {
    const results = [];

    // 1. Constraints (forbidden tokens) — checked on the raw source.
    for (const testEntry of tests) {
      const forbid = testEntry.constraints && testEntry.constraints.forbidTokens;
      if (forbid) {
        for (const token of forbid) {
          if (code.includes(token)) {
            results.push({
              entry: testEntry.entry,
              passed: false,
              name: `Constraint: forbidden token "${token.trim()}"`,
              error: `Your code contains "${token.trim()}" which is not allowed for this exercise`,
            });
          }
        }
      }
    }

    // 2. Compile + expose the entry functions (friendly error if it won't parse).
    let fns;
    try {
      fns = loadStudent(code, tests.map((t) => t.entry));
    } catch (err) {
      const f = friendlyError(err);
      self.postMessage({
        type: "test-result",
        testResults: [
          ...results,
          { entry: "load", passed: false, name: f.name, error: f.error },
        ],
        error: null,
      });
      return;
    }

    // 3. Run each case. Deep-clone args per case so a mutating student function
    // can't poison a later case's inputs.
    for (const testEntry of tests) {
      const fn = fns[testEntry.entry];
      for (const tc of testEntry.cases) {
        if (typeof fn !== "function") {
          results.push({
            entry: testEntry.entry,
            passed: false,
            name: tc.name,
            expected: tc.expected,
            actual: null,
            error: `There's no function named ${testEntry.entry} yet. Define it with: function ${testEntry.entry}(...) { ... }`,
          });
          continue;
        }
        try {
          const args = JSON.parse(JSON.stringify(tc.args ?? []));
          const actual = fn.apply(null, args);
          const tol = tc.tol ?? testEntry.tol;
          const passed = valuesMatch(actual, tc.expected, tol);
          results.push({
            entry: testEntry.entry,
            passed,
            name: tc.name,
            expected: tc.expected,
            actual,
            error: passed
              ? null
              : `Expected ${JSON.stringify(tc.expected)}, got ${JSON.stringify(actual)}`,
          });
        } catch (err) {
          results.push({
            entry: testEntry.entry,
            passed: false,
            name: tc.name,
            expected: tc.expected,
            actual: null,
            error: err && err.message ? err.message : String(err),
          });
        }
      }
    }

    self.postMessage({ type: "test-result", testResults: results, error: null });
  }
};
