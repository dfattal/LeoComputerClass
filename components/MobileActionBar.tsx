"use client";

export default function MobileActionBar({
  onRun,
  onRunTests,
  onSubmit,
  loading,
  submitting,
  hasCode,
  hasSubmittedBefore,
}: {
  onRun: () => void;
  onRunTests: () => void;
  onSubmit: () => void;
  loading: boolean;
  submitting: boolean;
  hasCode: boolean;
  hasSubmittedBefore: boolean;
}) {
  return (
    <div className="shrink-0 border-t border-stone-200 bg-white px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] dark:border-stone-800 dark:bg-stone-950 lg:hidden">
      <div className="flex items-center gap-2">
        <button
          onClick={onRun}
          disabled={loading}
          className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-50"
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
          onClick={onSubmit}
          disabled={submitting || !hasCode}
          className="ml-auto rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-50"
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
