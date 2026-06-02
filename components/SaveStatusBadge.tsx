"use client";

import { useAccent } from "./AccentContext";
import type { SaveStatus } from "./CourseShell";

// Subtle "Saving… / Saved ✓" indicator shown by the editor toolbar so the
// student can see their in-progress code is being kept. Renders nothing when idle.
export default function SaveStatusBadge({ status }: { status: SaveStatus }) {
  const accent = useAccent();

  if (status === "idle") return null;

  if (status === "saving") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
        <svg
          className="h-3 w-3 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        Saving…
      </span>
    );
  }

  // "saved"
  return (
    <span className={`flex items-center gap-1 text-xs ${accent.feedback.title}`}>
      <svg
        className="h-3.5 w-3.5"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path d="M3 8.5l3.5 3.5L13 4" />
      </svg>
      Saved
    </span>
  );
}
