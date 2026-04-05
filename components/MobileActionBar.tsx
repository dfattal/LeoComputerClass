"use client";

import { useAccent } from "./AccentContext";

export default function MobileActionBar({
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
    <div className="shrink-0 border-t border-stone-200 bg-white px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] dark:border-stone-800 dark:bg-stone-950 lg:hidden">
      <div className="flex items-center gap-2">
        <button
          onClick={onRun}
          disabled={loading}
          className={`rounded-md ${accent.bg} px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-colors ${accent.bgHover} disabled:opacity-50`}
        >
          {loading ? "Running..." : "Run"}
        </button>
        <button
          onClick={onRunTests}
          disabled={loading}
          className="rounded-md border border-stone-300 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-stone-100 disabled:opacity-50 dark:border-stone-700 dark:hover:bg-stone-800"
        >
          {loading ? "Testing..." : "Run Tests"}
        </button>
        <button
          onClick={onReset}
          disabled={loading || submitting}
          className="rounded-md border border-stone-300 p-1.5 text-sm transition-colors hover:bg-stone-100 disabled:opacity-50 dark:border-stone-700 dark:hover:bg-stone-800"
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
        </button>
        <button
          onClick={onSubmit}
          disabled={submitting || !hasCode}
          className={`ml-auto rounded-md ${accent.bg} px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-colors ${accent.bgHover} disabled:opacity-50`}
        >
          {submitting
            ? "Submitting..."
            : hasSubmittedBefore
              ? "Resubmit"
              : "Submit"}
        </button>
      </div>
    </div>
  );
}
