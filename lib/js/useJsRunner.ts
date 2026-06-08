"use client";

import { useRef, useState, useCallback } from "react";
import type {
  RunResult,
  TestResult,
  TestRunResult,
} from "@/lib/pyodide/usePyodide";

/**
 * The JavaScript analog of usePyodide: runs a "javascript" lesson's student code
 * in public/js-worker.js. Same RunResult/TestResult shapes as the Python runner,
 * so CourseShell's run/test/submit plumbing is shared. The worker can't interrupt
 * a synchronous infinite loop itself, so — exactly like usePyodide — we own the
 * timeout here and terminate the worker if it blows past it.
 */
export function useJsRunner() {
  const workerRef = useRef<Worker | null>(null);
  const [loading, setLoading] = useState(false);

  const getWorker = useCallback(() => {
    if (!workerRef.current) {
      workerRef.current = new Worker("/js-worker.js");
    }
    return workerRef.current;
  }, []);

  const run = useCallback(
    (code: string): Promise<RunResult> => {
      setLoading(true);
      return new Promise((resolve) => {
        const worker = getWorker();
        const timeout = setTimeout(() => {
          worker.terminate();
          workerRef.current = null;
          setLoading(false);
          resolve({
            stdout: "",
            stderr: "Your code took too long — check for a loop that never ends.",
            error: "timeout",
          });
        }, 10000);

        worker.onmessage = (e) => {
          if (e.data.type === "run-result") {
            clearTimeout(timeout);
            setLoading(false);
            resolve({
              stdout: e.data.stdout || "",
              stderr: e.data.stderr || "",
              error: e.data.error,
            });
          }
        };

        worker.postMessage({ type: "run", code });
      });
    },
    [getWorker]
  );

  const runTests = useCallback(
    (code: string, tests: unknown[]): Promise<TestRunResult> => {
      setLoading(true);
      return new Promise((resolve) => {
        const worker = getWorker();
        const timeout = setTimeout(() => {
          worker.terminate();
          workerRef.current = null;
          setLoading(false);
          resolve({ testResults: [], error: "timeout" });
        }, 15000);

        worker.onmessage = (e) => {
          if (e.data.type === "test-result") {
            clearTimeout(timeout);
            setLoading(false);
            resolve({
              testResults: (e.data.testResults || []) as TestResult[],
              error: e.data.error,
            });
          }
        };

        worker.postMessage({ type: "test", code, tests });
      });
    },
    [getWorker]
  );

  return { run, runTests, loading };
}
