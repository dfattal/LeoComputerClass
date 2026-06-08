"use client";

import { useAccent } from "./AccentContext";
import SaveStatusBadge from "./SaveStatusBadge";
import type { SaveStatus } from "./CourseShell";

export default function MobileActionBar({
  onRun,
  onRunTests,
  onSubmit,
  onReset,
  onShare,
  loading,
  submitting,
  sharing,
  hasCode,
  hasSubmittedBefore,
  saveStatus = "idle",
}: {
  onRun: () => void;
  onRunTests: () => void;
  onSubmit: () => void;
  onReset: () => void;
  /** Game Studio only: publish the game to a public /arcade link. */
  onShare?: () => void;
  loading: boolean;
  submitting: boolean;
  sharing?: boolean;
  hasCode: boolean;
  hasSubmittedBefore: boolean;
  saveStatus?: SaveStatus;
}) {
  const accent = useAccent();

  return (
    <div className="shrink-0 border-t border-stone-200 bg-white px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] dark:border-stone-800 dark:bg-stone-950 lg:hidden">
      {saveStatus !== "idle" && (
        <div className="mb-1.5 flex justify-end">
          <SaveStatusBadge status={saveStatus} />
        </div>
      )}
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
        {onShare && (
          <button
            onClick={onShare}
            disabled={sharing || !hasCode}
            className="ml-auto rounded-md border border-stone-300 p-1.5 text-sm transition-colors hover:bg-stone-100 disabled:opacity-50 dark:border-stone-700 dark:hover:bg-stone-800"
            title="Publish your game to a public link"
            aria-label={sharing ? "Publishing game" : "Share game"}
          >
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              className="h-3.5 w-3.5"
              aria-hidden="true"
            >
              <circle cx="12" cy="3.5" r="1.8" />
              <circle cx="4" cy="8" r="1.8" />
              <circle cx="12" cy="12.5" r="1.8" />
              <path d="M5.6 7l4.8-2.6M5.6 9l4.8 2.6" />
            </svg>
          </button>
        )}
        <button
          onClick={onSubmit}
          disabled={submitting || !hasCode}
          className={`${onShare ? "" : "ml-auto "}rounded-md ${accent.bg} px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-colors ${accent.bgHover} disabled:opacity-50`}
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
