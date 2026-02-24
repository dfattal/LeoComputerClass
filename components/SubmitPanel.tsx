"use client";

import { useState } from "react";
import type { TestResult } from "@/lib/pyodide/usePyodide";
import AIFeedback from "./AIFeedback";

interface ExistingSubmission {
  id: string;
  ai_feedback: Record<string, unknown> | null;
  instructor_feedback: string | null;
  status: string;
  test_results: Array<{ passed: boolean; name: string; error?: string }>;
}

export default function SubmitPanel({
  weekSlug,
  code,
  stdout,
  stderr,
  testResults,
  existingSubmission,
  onSubmitted,
}: {
  weekSlug: string;
  code: string;
  stdout: string;
  stderr: string;
  testResults: TestResult[];
  existingSubmission: ExistingSubmission | null;
  onSubmitted: (submission: ExistingSubmission) => void;
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

      let feedback: Record<string, unknown> | null = null;
      if (reviewRes.ok) {
        const data = await reviewRes.json();
        feedback = data.feedback;
        setAiFeedback(feedback);
      }

      // Notify parent with new submission data
      onSubmitted({
        id: submissionId,
        ai_feedback: feedback,
        instructor_feedback: null,
        status: feedback ? "reviewed" : "submitted",
        test_results: testResults.map((r) => ({
          passed: r.passed,
          name: r.name,
          error: r.error ?? undefined,
        })),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  const hasPassingTests =
    testResults.length > 0 && testResults.some((r) => r.passed);

  // Show AI feedback: from current submission or from previously loaded one
  const displayAiFeedback = aiFeedback ?? existingSubmission?.ai_feedback ?? null;
  const displayInstructorFeedback = existingSubmission?.instructor_feedback;
  const hasSubmittedBefore = submitted || !!existingSubmission;

  return (
    <div className="space-y-4 border-t border-stone-200 pt-4 dark:border-stone-800">
      <div className="flex items-center gap-3">
        <button
          onClick={handleSubmit}
          disabled={submitting || !code.trim()}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-50"
        >
          {submitting
            ? "Submitting..."
            : hasSubmittedBefore
              ? "Resubmit"
              : "Submit"}
        </button>
        {testResults.length === 0 && (
          <span className="text-xs text-stone-500">
            Run tests first so your progress gets tracked!
          </span>
        )}
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

      {displayAiFeedback && <AIFeedback feedback={displayAiFeedback} />}

      {displayInstructorFeedback && (
        <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-800 dark:bg-indigo-950/40">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-sm font-semibold text-indigo-800 dark:text-indigo-200">
              Instructor Feedback
            </span>
          </div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-indigo-900 dark:text-indigo-100">
            {displayInstructorFeedback}
          </p>
        </div>
      )}
    </div>
  );
}
