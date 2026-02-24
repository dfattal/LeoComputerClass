"use client";

import { useRef, useState, useCallback } from "react";

export interface RunResult {
  stdout: string;
  stderr: string;
  error: string | null;
}

export interface TestResult {
  entry: string;
  passed: boolean;
  name: string;
  expected?: unknown;
  actual?: unknown;
  error: string | null;
}

export interface TestRunResult {
  testResults: TestResult[];
  error: string | null;
}

export function usePyodide() {
  const workerRef = useRef<Worker | null>(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  const getWorker = useCallback(() => {
    if (!workerRef.current) {
      workerRef.current = new Worker("/pyodide-worker.js");
      setReady(true);
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
          setReady(false);
          setLoading(false);
          resolve({
            stdout: "",
            stderr: "Execution timed out (10s limit)",
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
          setReady(false);
          setLoading(false);
          resolve({ testResults: [], error: "timeout" });
        }, 15000);

        worker.onmessage = (e) => {
          if (e.data.type === "test-result") {
            clearTimeout(timeout);
            setLoading(false);
            resolve({
              testResults: e.data.testResults || [],
              error: e.data.error,
            });
          }
        };

        worker.postMessage({ type: "test", code, tests });
      });
    },
    [getWorker]
  );

  return { run, runTests, loading, ready };
}
