/* eslint-disable no-restricted-globals */
// Single source of truth for the test-grading comparison.
//
// Loaded via importScripts() by BOTH graders so they can never drift:
//   - public/pyodide-worker.js  (Python lessons, run via Pyodide)
//   - public/js-worker.js       (JavaScript lessons, run via the JS sandbox)
// and read + eval'd verbatim by scripts/validate-class.mjs so the authoring-time
// answer-key check uses the exact same comparison students face in the browser.
//
// Keep this a plain top-level function declaration (no exports, no const arrow):
// importScripts puts it on the worker's global scope, and validate-class slices
// it out by name + brace-balancing (so the name must appear only once, below).

// Compare a test result to its expected value.
// When `tol` is a number, numeric values (and lists of numbers) match if they
// are within `tol` of each other — needed for physics/float exercises where
// exact equality never holds. Otherwise falls back to exact structural match.
function valuesMatch(actual, expected, tol) {
  if (typeof tol === "number") {
    if (typeof actual === "number" && typeof expected === "number") {
      return Math.abs(actual - expected) <= tol;
    }
    if (Array.isArray(actual) && Array.isArray(expected)) {
      return (
        actual.length === expected.length &&
        actual.every((v, i) => valuesMatch(v, expected[i], tol))
      );
    }
  }
  return JSON.stringify(actual) === JSON.stringify(expected);
}
