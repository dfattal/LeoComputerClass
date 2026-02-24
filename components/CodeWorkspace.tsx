"use client";

import { useState, useCallback } from "react";
import CodeEditor from "./CodeEditor";
import RunPanel from "./RunPanel";
import TestResults from "./TestResults";
import SubmitPanel from "./SubmitPanel";
import { usePyodide } from "@/lib/pyodide/usePyodide";
import type { TestResult } from "@/lib/pyodide/usePyodide";
import type { TestEntry } from "@/lib/lessons/loadLesson";

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

  return (
    <div className="space-y-4">
      <CodeEditor weekSlug={weekSlug} onChange={handleCodeChange} />

      <div className="flex gap-2">
        <button
          onClick={handleRun}
          disabled={loading}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {loading ? "Running..." : "Run"}
        </button>
        <button
          onClick={handleRunTests}
          disabled={loading}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
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
      />
    </div>
  );
}
