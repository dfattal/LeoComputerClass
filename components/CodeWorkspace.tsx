"use client";

import { useState, useCallback, useEffect } from "react";
import CodeEditor from "./CodeEditor";
import RunPanel from "./RunPanel";
import TestResults from "./TestResults";
import SubmitPanel from "./SubmitPanel";
import { usePyodide } from "@/lib/pyodide/usePyodide";
import type { TestResult } from "@/lib/pyodide/usePyodide";
import type { TestEntry } from "@/lib/lessons/loadLesson";

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

  function handleSubmitted(submission: ExistingSubmission) {
    setExistingSubmission(submission);
  }

  return (
    <div className="space-y-4">
      <CodeEditor weekSlug={weekSlug} onChange={handleCodeChange} />

      <div className="flex gap-2">
        <button
          onClick={handleRun}
          disabled={loading}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Running..." : "Run"}
        </button>
        <button
          onClick={handleRunTests}
          disabled={loading}
          className="rounded-md border border-stone-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-stone-100 disabled:opacity-50 dark:border-stone-700 dark:hover:bg-stone-800"
        >
          {loading ? "Testing..." : "Run Tests"}
        </button>
      </div>

      <RunPanel stdout={stdout} stderr={stderr} />
      <TestResults results={testResults} />
      <SubmitPanel
        weekSlug={weekSlug}
        code={code}
        stdout={stdout}
        stderr={stderr}
        testResults={testResults}
        existingSubmission={existingSubmission}
        onSubmitted={handleSubmitted}
      />
    </div>
  );
}
