"use client";

import { useEffect, useState } from "react";
import { useAccent } from "./AccentContext";
import SaveStatusBadge from "./SaveStatusBadge";
import type { SaveStatus } from "./CourseShell";

/**
 * The right-hand panel for a "reflection" lesson — the no-Python capstone where
 * the student re-explains a core idea in their own words. Shows the question (+
 * optional hint) above a plain prose textarea (no line numbers / mono font) and
 * a single Submit button. It drives the SAME `code` state the editor uses, so
 * the existing debounced draft auto-save and restore plumbing in CourseShell
 * work unchanged. Mirrors CodeEditor's localStorage restore so an in-progress
 * answer survives a reload.
 */
export default function ReflectionPanel({
  classSlug,
  lessonSlug,
  question,
  guidance,
  onCodeChange,
  fallbackCode,
  onSubmit,
  submitting,
  hasText,
  hasSubmittedBefore,
  saveStatus = "idle",
}: {
  classSlug: string;
  lessonSlug: string;
  question: string;
  guidance?: string;
  onCodeChange: (text: string) => void;
  fallbackCode?: string;
  onSubmit: () => void;
  submitting: boolean;
  hasText: boolean;
  hasSubmittedBefore: boolean;
  saveStatus?: SaveStatus;
}) {
  const accent = useAccent();
  // Same key the code editor uses, so the draft restores the same way.
  const storageKey = `code-draft-${classSlug}-${lessonSlug}`;
  const [text, setText] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    const initial = saved ?? fallbackCode ?? "";
    setText(initial);
    onCodeChange(initial);
    setMounted(true);
  }, [storageKey, onCodeChange, fallbackCode]);

  function handleChange(value: string) {
    setText(value);
    localStorage.setItem(storageKey, value);
    onCodeChange(value);
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white dark:bg-stone-950">
      {/* The question */}
      <div className="shrink-0 border-b border-stone-200 px-5 py-4 dark:border-stone-800">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-stone-400">
          One last question — in your own words
        </p>
        <p className="text-base font-medium leading-relaxed text-stone-800 dark:text-stone-100">
          {question}
        </p>
        {guidance && (
          <p
            className={`mt-2 rounded-md border ${accent.feedback.border} ${accent.feedback.bg} px-3 py-2 text-sm leading-relaxed ${accent.feedback.body}`}
          >
            💡 {guidance}
          </p>
        )}
      </div>

      {/* The answer box */}
      <div className="min-h-0 flex-1 p-4">
        <label htmlFor="reflection-answer" className="sr-only">
          Your answer
        </label>
        {mounted ? (
          <textarea
            id="reflection-answer"
            value={text}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Write your answer here in a few sentences. There's no single right wording — just explain it the way it makes sense to you."
            spellCheck
            className="h-full w-full resize-none rounded-lg border border-stone-300 bg-stone-50 p-4 text-base leading-relaxed text-stone-800 shadow-inner outline-none transition-colors placeholder:text-stone-400 focus:border-stone-400 focus:bg-white dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:focus:bg-stone-900"
          />
        ) : (
          <div className="flex h-full items-center justify-center rounded-lg border border-stone-200 bg-stone-50 dark:border-stone-800 dark:bg-stone-900">
            <span className="text-sm text-stone-500">Loading…</span>
          </div>
        )}
      </div>

      {/* Submit bar */}
      <div className="flex shrink-0 items-center gap-3 border-t border-stone-200 px-4 py-2.5 dark:border-stone-800">
        <SaveStatusBadge status={saveStatus} />
        <div className="flex-1" />
        <button
          onClick={onSubmit}
          disabled={submitting || !hasText}
          className={`inline-flex items-center gap-1.5 rounded-md ${accent.bg} px-4 py-1.5 text-sm font-medium text-white shadow-sm transition-colors ${accent.bgHover} disabled:opacity-50`}
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
              ? "Submit again"
              : "Submit answer"}
        </button>
      </div>
    </div>
  );
}
