/* eslint-disable no-restricted-globals */
// Pyodide Web Worker — runs Python code in a sandboxed context

let pyodide = null;

async function loadPyodideInstance() {
  if (pyodide) return pyodide;
  importScripts("https://cdn.jsdelivr.net/pyodide/v0.27.5/full/pyodide.js");
  pyodide = await loadPyodide();
  return pyodide;
}

self.onmessage = async function (e) {
  const { type, code, tests } = e.data;

  try {
    const py = await loadPyodideInstance();

    if (type === "run") {
      // Simple code execution — capture stdout/stderr
      py.runPython(`
import sys, io
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()
`);
      try {
        py.runPython(code);
      } catch (err) {
        const stderr = py.runPython("sys.stderr.getvalue()");
        self.postMessage({
          type: "run-result",
          stdout: "",
          stderr: stderr + "\n" + err.message,
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

      // First check constraints (forbidden tokens)
      for (const testEntry of tests) {
        if (testEntry.constraints && testEntry.constraints.forbidTokens) {
          for (const token of testEntry.constraints.forbidTokens) {
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

      // Load student code
      py.runPython(`
import sys, io
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()
`);
      try {
        py.runPython(code);
      } catch (err) {
        self.postMessage({
          type: "test-result",
          testResults: [
            {
              entry: "load",
              passed: false,
              name: "Code loads without error",
              error: err.message,
            },
          ],
          error: null,
        });
        return;
      }

      // Run each test entry
      for (const testEntry of tests) {
        for (const tc of testEntry.cases) {
          try {
            const argsStr = tc.args.map(String).join(", ");
            const callCode = `${testEntry.entry}(${argsStr})`;
            const result = py.runPython(callCode);

            const actual = typeof result === "object" ? result.toJs() : result;
            const passed =
              JSON.stringify(actual) === JSON.stringify(tc.expected);

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
