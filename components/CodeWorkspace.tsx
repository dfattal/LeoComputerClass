"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import CodeEditor from "./CodeEditor";
import RunPanel from "./RunPanel";
import TestResults from "./TestResults";
import AIFeedback from "./AIFeedback";
import VerticalResizeHandle from "./VerticalResizeHandle";
import { usePyodide } from "@/lib/pyodide/usePyodide";
import type { TestResult } from "@/lib/pyodide/usePyodide";
import type { TestEntry } from "@/lib/lessons/loadLesson";

const V_STORAGE_KEY = "code-workspace-v-ratio";
const DEFAULT_V_RATIO = 0.6;
const MIN_EDITOR_PX = 150;
const MIN_OUTPUT_PX = 80;

interface ExistingSubmission {
  id: string;
  ai_feedback: Record<string, unknown> | null;
  instructor_feedback: string | null;
  status: string;
  test_results: Array<{ passed: boolean; name: string; error?: string }>;
}

export default function CodeWorkspace({
  weekSlug,
  tests,
}: {
  weekSlug: string;
  tests: TestEntry[];
}) {
  const { run, runTests, loading } = usePyodide();
  const [code, setCode] = useState("");
  const [stdout, setStdout] = useState("");
  const [stderr, setStderr] = useState("");
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [existingSubmission, setExistingSubmission] =
    useState<ExistingSubmission | null>(null);

  // Submit state
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<Record<string, unknown> | null>(
    null
  );
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Vertical resize state
  const [vRatio, setVRatio] = useState(DEFAULT_V_RATIO);
  const containerRef = useRef<HTMLDivElement>(null);
  const [vMounted, setVMounted] = useState(false);

  // Load saved vertical ratio
  useEffect(() => {
    const saved = localStorage.getItem(V_STORAGE_KEY);
    if (saved) {
      const parsed = parseFloat(saved);
      if (!isNaN(parsed) && parsed > 0 && parsed < 1) {
        setVRatio(parsed);
      }
    }
    setVMounted(true);
  }, []);

  const clampVRatio = useCallback((r: number, height: number) => {
    const minTop = MIN_EDITOR_PX / height;
    const maxTop = 1 - MIN_OUTPUT_PX / height;
    return Math.min(Math.max(r, minTop), maxTop);
  }, []);

  const handleVResize = useCallback(
    (deltaY: number) => {
      if (!containerRef.current) return;
      const height = containerRef.current.offsetHeight;
      if (height === 0) return;
      setVRatio((prev) => clampVRatio(prev + deltaY / height, height));
    },
    [clampVRatio]
  );

  const handleVResizeEnd = useCallback(() => {
    setVRatio((current) => {
      localStorage.setItem(V_STORAGE_KEY, current.toString());
      return current;
    });
  }, []);

  const handleVStepResize = useCallback(
    (direction: number) => {
      if (!containerRef.current) return;
      const height = containerRef.current.offsetHeight;
      if (height === 0) return;
      setVRatio((prev) => {
        const newRatio = clampVRatio(prev + direction * 0.02, height);
        localStorage.setItem(V_STORAGE_KEY, newRatio.toString());
        return newRatio;
      });
    },
    [clampVRatio]
  );

  // Fetch existing submission on mount
  useEffect(() => {
    async function fetchExisting() {
      try {
        const res = await fetch(
          `/api/submit?weekSlug=${encodeURIComponent(weekSlug)}`
        );
        if (res.ok) {
          const { submission } = await res.json();
          if (submission) setExistingSubmission(submission);
        }
      } catch {
        // Ignore — no existing submission
      }
    }
    fetchExisting();
  }, [weekSlug]);

  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode);
  }, []);

  async function handleRun() {
    setStdout("");
    setStderr("");
    const result = await run(code);
    setStdout(result.stdout);
    setStderr(result.stderr);
  }

  async function handleRunTests() {
    setTestResults([]);
    const result = await runTests(code, tests);
    setTestResults(result.testResults);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError(null);
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

      setExistingSubmission({
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
      setSubmitError(
        err instanceof Error ? err.message : "Submission failed"
      );
    } finally {
      setSubmitting(false);
    }
  }

  const hasSubmittedBefore = submitted || !!existingSubmission;
  const displayAiFeedback =
    aiFeedback ?? existingSubmission?.ai_feedback ?? null;
  const displayInstructorFeedback = existingSubmission?.instructor_feedback;

  return (
    <div ref={containerRef} className="flex h-full flex-col">
      {/* Code editor — resizable */}
      <div
        className="min-h-0 overflow-hidden"
        style={
          vMounted
            ? { flex: `0 0 ${vRatio * 100}%` }
            : { flex: "0 0 60%" }
        }
      >
        <CodeEditor weekSlug={weekSlug} onChange={handleCodeChange} />
      </div>

      {/* Button bar — fixed height */}
      <div className="flex shrink-0 items-center gap-2 border-t border-stone-200 px-3 py-2 dark:border-stone-800">
        <button
          onClick={handleRun}
          disabled={loading}
          className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Running..." : "Run"}
        </button>
        <button
          onClick={handleRunTests}
          disabled={loading}
          className="rounded-md border border-stone-300 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-stone-100 disabled:opacity-50 dark:border-stone-700 dark:hover:bg-stone-800"
        >
          {loading ? "Testing..." : "Run Tests"}
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting || !code.trim()}
          className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-50"
        >
          {submitting
            ? "Submitting..."
            : hasSubmittedBefore
              ? "Resubmit"
              : "Submit"}
        </button>
        {testResults.length === 0 && (
          <span className="ml-auto text-xs text-stone-500">
            Run tests first!
          </span>
        )}
      </div>

      {/* Vertical resize handle */}
      <VerticalResizeHandle
        onResize={handleVResize}
        onResizeEnd={handleVResizeEnd}
        onStepResize={handleVStepResize}
        ratio={vRatio}
      />

      {/* Output area — fills remaining space */}
      <div className="flex min-h-0 flex-1 flex-col space-y-3 overflow-y-auto p-3">
        <RunPanel stdout={stdout} stderr={stderr} />
        <TestResults results={testResults} />

        {submitError && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {submitError}
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
    </div>
  );
}
