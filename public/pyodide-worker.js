/* eslint-disable no-restricted-globals */
// Pyodide Web Worker — runs Python code in a sandboxed context

// valuesMatch() — the test-grading comparison — lives in one shared file so the
// Python grader (here), the JS grader (js-worker.js), and validate-class can't
// drift. importScripts puts `valuesMatch` on this worker's global scope.
importScripts("/values-match.js");

let pyodide = null;

// Blanks out Python comments and string-literal contents so the forbidTokens
// check only looks at real code. Without this, a leftover starter comment like
// "# Return 1 only if both a and b are 1" would trip a `" and "` constraint even
// when the student's actual code is correct (e.g. `return a & b`). We replace
// stripped characters with spaces so token boundaries (the leading/trailing
// spaces in tokens like " and ") are preserved.
function stripCommentsAndStrings(src) {
  let out = "";
  let i = 0;
  const n = src.length;
  let quote = null; // current string delimiter: ', ", ''' or """
  while (i < n) {
    const ch = src[i];
    if (quote) {
      if (ch === "\\" && quote.length === 1) {
        // escape inside a single-char string: skip the next char
        out += "  ";
        i += 2;
        continue;
      }
      if (src.startsWith(quote, i)) {
        out += " ".repeat(quote.length);
        i += quote.length;
        quote = null;
        continue;
      }
      out += ch === "\n" ? "\n" : " ";
      i += 1;
      continue;
    }
    if (ch === "#") {
      // comment to end of line
      while (i < n && src[i] !== "\n") {
        out += " ";
        i += 1;
      }
      continue;
    }
    if (ch === '"' || ch === "'") {
      const triple = src.substr(i, 3);
      if (triple === '"""' || triple === "'''") {
        quote = triple;
        out += "   ";
        i += 3;
        continue;
      }
      quote = ch;
      out += " ";
      i += 1;
      continue;
    }
    out += ch;
    i += 1;
  }
  return out;
}

async function loadPyodideInstance() {
  if (pyodide) return pyodide;
  importScripts("https://cdn.jsdelivr.net/pyodide/v0.27.5/full/pyodide.js");
  pyodide = await loadPyodide();
  return pyodide;
}

// Loads the student's code inside Python, capturing parse/runtime errors with
// their real line number and type (far more reliable than scraping the JS
// traceback string). Defines the student's functions in the global namespace
// so the tests can call them. Returns null on success, or an info object.
const LOAD_WRAPPER = `
import sys, io, json, traceback
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()
__load_err = None
try:
    exec(compile(__student_src, "<your code>", "exec"), globals())
except SyntaxError as e:
    __load_err = {
        "kind": "syntax",
        "etype": type(e).__name__,
        "line": e.lineno,
        "msg": e.msg or "",
        "text": (e.text or "").rstrip(),
    }
except BaseException as e:
    __ln = None
    for __fr in reversed(traceback.extract_tb(e.__traceback__)):
        if __fr.filename == "<your code>":
            __ln = __fr.lineno
            break
    __load_err = {
        "kind": "runtime",
        "etype": type(e).__name__,
        "line": __ln,
        "msg": str(e),
        "text": None,
    }
json.dumps(__load_err)
`;

function loadStudent(py, code) {
  py.globals.set("__student_src", code);
  return JSON.parse(py.runPython(LOAD_WRAPPER));
}

// Turn a Python load error into a message a 10-year-old can act on, while still
// showing the real line number and Python error so it stays educational.
function friendlyLoadError(info) {
  const where = info.line ? `line ${info.line}` : "your code";
  const snippet = info.text ? `\n\n    ${info.text.trim()}` : "";
  const m = (info.msg || "").toLowerCase();
  if (info.kind === "syntax") {
    if (m.includes("expected an indented block")) {
      return {
        name: `Python expected some code on ${where}`,
        error:
          `A function or loop has nothing inside it but a comment. Leave a "pass" ` +
          `line there until you write your code — a comment by itself isn't enough for Python.` +
          snippet,
      };
    }
    if (m.includes("indent")) {
      return {
        name: `Indentation problem on ${where}`,
        error:
          `The spacing doesn't line up. Every line inside a function or loop needs ` +
          `the same indent (use 4 spaces).` + snippet,
      };
    }
    return {
      name: `Python couldn't read ${where}`,
      error:
        `There's a typo Python can't understand (${info.etype}: ${info.msg}). ` +
        `Look for a missing ":", bracket, or quote.` + snippet,
    };
  }
  return {
    name: info.line
      ? `Your code hit a problem on ${where}`
      : `Your code hit a problem while loading`,
    error: `${info.etype}: ${info.msg}` + snippet,
  };
}

self.onmessage = async function (e) {
  const { type, code, tests } = e.data;

  try {
    const py = await loadPyodideInstance();

    if (type === "run") {
      // Load + run the student's code (captures a friendly error if it fails)
      const loadErr = loadStudent(py, code);
      if (loadErr) {
        const f = friendlyLoadError(loadErr);
        self.postMessage({
          type: "run-result",
          stdout: py.runPython("sys.stdout.getvalue()"),
          stderr: `${f.name}\n${f.error}`,
          error: null,
        });
        return;
      }

      const stdout = py.runPython("sys.stdout.getvalue()");
      const stderr = py.runPython("sys.stderr.getvalue()");
      self.postMessage({ type: "run-result", stdout, stderr, error: null });
    } else if (type === "test") {
      // Run tests against student code
      const results = [];

      // First check constraints (forbidden tokens). Scan only real code —
      // comments and string literals are blanked out so leftover starter
      // comments (e.g. "both a and b") don't trip a `" and "` constraint.
      const codeForConstraints = stripCommentsAndStrings(code);
      for (const testEntry of tests) {
        if (testEntry.constraints && testEntry.constraints.forbidTokens) {
          for (const token of testEntry.constraints.forbidTokens) {
            if (codeForConstraints.includes(token)) {
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

      // Load student code (with a kid-friendly error if it won't parse/run)
      const loadErr = loadStudent(py, code);
      if (loadErr) {
        const f = friendlyLoadError(loadErr);
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

      // Run each test entry
      for (const testEntry of tests) {
        for (const tc of testEntry.cases) {
          try {
            // Serialize args as JSON and parse them inside Python via
            // json.loads, so JS booleans/null map to Python True/False/None
            // (interpolating them into source would yield true/false/null,
            // which are NameErrors in Python). Mirrors validate-class.mjs.
            py.globals.set("__test_args", JSON.stringify(tc.args));
            const callCode = `${testEntry.entry}(*__import__("json").loads(__test_args))`;
            const result = py.runPython(callCode);

            let actual;
            if (result && typeof result === "object" && typeof result.toJs === "function") {
              actual = result.toJs({ dict_converter: Object.fromEntries });
            } else {
              actual = result;
            }
            const tol = tc.tol ?? testEntry.tol;
            const passed = valuesMatch(actual, tc.expected, tol);

            results.push({
              entry: testEntry.entry,
              passed,
              name: tc.name,
              expected: tc.expected,
              actual: actual,
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
              error: err.message,
            });
          }
        }
      }

      self.postMessage({ type: "test-result", testResults: results, error: null });
    }
  } catch (err) {
    self.postMessage({
      type: e.data.type === "test" ? "test-result" : "run-result",
      stdout: "",
      stderr: "",
      testResults: [],
      error: err.message,
    });
  }
};
