"use client";

import { useState } from "react";
import type { TestResult } from "@/lib/pyodide/usePyodide";
import AIFeedback from "./AIFeedback";

export default function SubmitPanel({
  weekSlug,
  code,
  stdout,
  stderr,
  testResults,
}: {
  weekSlug: string;
  code: string;
  stdout: string;
  stderr: string;
  testResults: TestResult[];
}) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<Record<string, unknown> | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const submitRes = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekSlug,
          code,
          stdout,
          stderr,
          testResults,
        }),
      });

      if (!submitRes.ok) {
        const data = await submitRes.json();
        throw new Error(data.error || "Submission failed");
      }

      const { submissionId } = await submitRes.json();
      setSubmitted(true);

      // Request AI review
      const reviewRes = await fetch("/api/ai-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId }),
      });

      if (reviewRes.ok) {
        const { feedback } = await reviewRes.json();
        setAiFeedback(feedback);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  const hasPassingTests =
    testResults.length > 0 && testResults.some((r) => r.passed);

  return (
    <div className="space-y-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
      <div className="flex items-center gap-3">
        <button
          onClick={handleSubmit}
          disabled={submitting || !code.trim()}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
        >
          {submitting ? "Submitting..." : submitted ? "Resubmit" : "Submit"}
        </button>
        {!hasPassingTests && testResults.length > 0 && (
          <span className="text-xs text-amber-600 dark:text-amber-400">
            Some tests are failing — you can still submit
          </span>
        )}
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      {submitted && !aiFeedback && !submitting && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950 dark:text-green-300">
          Submitted successfully!
        </div>
      )}

      {aiFeedback && <AIFeedback feedback={aiFeedback} />}
    </div>
  );
}
