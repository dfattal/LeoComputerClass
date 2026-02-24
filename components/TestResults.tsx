"use client";

import type { TestResult } from "@/lib/pyodide/usePyodide";

export default function TestResults({
  results,
}: {
  results: TestResult[];
}) {
  if (results.length === 0) return null;

  const passed = results.filter((r) => r.passed).length;
  const total = results.length;

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
          Test Results
        </h4>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            passed === total
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
          }`}
        >
          {passed}/{total} passed
        </span>
      </div>
      <div className="space-y-1.5">
        {results.map((r, i) => (
          <div
            key={i}
            className={`flex items-start gap-2 rounded-md px-3 py-2 text-sm ${
              r.passed
                ? "bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200"
                : "bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200"
            }`}
          >
            <span className="mt-0.5 shrink-0">
              {r.passed ? "\u2713" : "\u2717"}
            </span>
            <div className="min-w-0">
              <span className="font-medium">{r.name}</span>
              {r.error && (
                <p className="mt-0.5 text-xs opacity-80">{r.error}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
