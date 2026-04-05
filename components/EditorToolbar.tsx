"use client";

import { useAccent } from "./AccentContext";

export default function EditorToolbar({
  onRun,
  onRunTests,
  onSubmit,
  onReset,
  loading,
  submitting,
  hasCode,
  hasSubmittedBefore,
}: {
  onRun: () => void;
  onRunTests: () => void;
  onSubmit: () => void;
  onReset: () => void;
  loading: boolean;
  submitting: boolean;
  hasCode: boolean;
  hasSubmittedBefore: boolean;
}) {
  const accent = useAccent();

  return (
    <div className="hidden shrink-0 items-center gap-2 border-b border-stone-200 bg-stone-50 px-3 py-1.5 dark:border-stone-800 dark:bg-stone-900 lg:flex">
      {/* Run */}
      <button
        onClick={onRun}
        disabled={loading}
        className={`inline-flex items-center gap-1.5 rounded-md ${accent.bg} px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-colors ${accent.bgHover} disabled:opacity-50`}
      >
        <svg
          viewBox="0 0 16 16"
          fill="currentColor"
          className="h-3.5 w-3.5"
          aria-hidden="true"
        >
          <path d="M4 2l10 6-10 6V2z" />
        </svg>
        {loading ? "Running…" : "Run"}
      </button>

      {/* Run Tests */}
      <button
        onClick={onRunTests}
        disabled={loading}
        className="inline-flex items-center gap-1.5 rounded-md border border-stone-300 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-stone-100 disabled:opacity-50 dark:border-stone-700 dark:hover:bg-stone-800"
      >
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-3.5 w-3.5"
          aria-hidden="true"
        >
          <path d="M3 8.5l3.5 3.5L13 4" />
        </svg>
        {loading ? "Testing…" : "Run Tests"}
      </button>

      {/* Reset */}
      <button
        onClick={onReset}
        disabled={loading || submitting}
        className="inline-flex items-center gap-1.5 rounded-md border border-stone-300 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-stone-100 disabled:opacity-50 dark:border-stone-700 dark:hover:bg-stone-800"
        title="Reset to starter code"
      >
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-3.5 w-3.5"
          aria-hidden="true"
        >
          <path d="M2 2v5h5" />
          <path d="M3 8a5.5 5.5 0 1 1 1-3" />
        </svg>
        Reset
      </button>

      {/* Submit — pushed to right */}
      <button
        onClick={onSubmit}
        disabled={submitting || !hasCode}
        className={`ml-auto inline-flex items-center gap-1.5 rounded-md ${accent.bg} px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-colors ${accent.bgHover} disabled:opacity-50`}
      >
        <svg
          viewBox="0 0 16 16"
          fill="currentColor"
          className="h-3.5 w-3.5"
          aria-hidden="true"
        >
          <path d="M8 2l5 5H9v7H7V7H3l5-5z" />
        </svg>
        {submitting
          ? "Submitting…"
          : hasSubmittedBefore
            ? "Resubmit"
            : "Submit"}
      </button>
    </div>
  );
}
