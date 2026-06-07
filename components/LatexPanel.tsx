"use client";

import CodeEditor from "./CodeEditor";
import EditorGraphSplit from "./EditorGraphSplit";
import LatexPreview from "./LatexPreview";
import SaveStatusBadge from "./SaveStatusBadge";
import { useAccent } from "./AccentContext";
import type { SaveStatus } from "./CourseShell";
import type { LatexLessonConfig } from "@/lib/latex/check.mjs";

/**
 * The right-hand workspace for a "latex" lesson: a LaTeX-highlighted editor on
 * top and the live typeset page beneath it (same split UX as the graph/canvas
 * lessons), with a toolbar of Check / Reset / Submit. There's no "Run" — the
 * page IS the output, re-typesetting as the student writes; "Check" grades the
 * exercises (compile → commands → is-the-math-true) into the Tests drawer.
 * Unlike the Python toolbar this one stays visible on mobile, since latex
 * lessons don't use the mobile action bar.
 */
export default function LatexPanel({
  classSlug,
  lessonSlug,
  config,
  code,
  onCodeChange,
  fallbackCode,
  starterCode,
  resetKey,
  onCheck,
  onSubmit,
  onReset,
  submitting,
  hasCode,
  hasSubmittedBefore,
  saveStatus = "idle",
}: {
  classSlug: string;
  lessonSlug: string;
  config: LatexLessonConfig;
  code: string;
  onCodeChange: (code: string) => void;
  fallbackCode?: string;
  starterCode?: string;
  resetKey?: number;
  onCheck: () => void;
  onSubmit: () => void;
  onReset: () => void;
  submitting: boolean;
  hasCode: boolean;
  hasSubmittedBefore: boolean;
  saveStatus?: SaveStatus;
}) {
  const accent = useAccent();

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex shrink-0 items-center gap-2 border-b border-stone-200 bg-stone-50 px-3 py-1.5 dark:border-stone-800 dark:bg-stone-900">
        <button
          onClick={onCheck}
          className={`inline-flex items-center gap-1.5 rounded-md ${accent.bg} px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-colors ${accent.bgHover}`}
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
          Check my page
        </button>

        <button
          onClick={onReset}
          disabled={submitting}
          className="inline-flex items-center gap-1.5 rounded-md border border-stone-300 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-stone-100 disabled:opacity-50 dark:border-stone-700 dark:hover:bg-stone-800"
          title="Reset to the starter page"
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

        <div className="ml-auto flex items-center gap-3">
          <SaveStatusBadge status={saveStatus} />
          <button
            onClick={onSubmit}
            disabled={submitting || !hasCode}
            className={`inline-flex items-center gap-1.5 rounded-md ${accent.bg} px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-colors ${accent.bgHover} disabled:opacity-50`}
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
      </div>

      {/* Editor on top, live typeset page beneath */}
      <div className="min-h-0 flex-1">
        <EditorGraphSplit
          editor={
            <CodeEditor
              classSlug={classSlug}
              lessonSlug={lessonSlug}
              onChange={onCodeChange}
              fallbackCode={fallbackCode}
              starterCode={starterCode}
              resetKey={resetKey}
              language="latex"
            />
          }
          graph={<LatexPreview source={code} config={config} />}
          label="📜 Your Page"
        />
      </div>
    </div>
  );
}
