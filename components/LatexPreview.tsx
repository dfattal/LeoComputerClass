"use client";

import { useEffect, useMemo, useState } from "react";
import katex from "katex";
import { parseDoc, checkDocument } from "@/lib/latex/check.mjs";
import type { LatexLessonConfig } from "@/lib/latex/check.mjs";

/**
 * The live "typeset page" for a latex lesson — re-renders the student's
 * document (debounced) as they type, the way Pixel Wizards repaints the
 * canvas. Each `%% exercise` marker renders as a status chip that flips to ✓
 * the moment that exercise's checks all pass, so progress is visible right on
 * the page being written.
 */

const DEBOUNCE_MS = 300;

function MathHTML({ latex, display }: { latex: string; display: boolean }) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(latex, {
        displayMode: display,
        throwOnError: false,
        errorColor: "#dc2626",
      });
    } catch (e) {
      return `<span style="color:#dc2626">${String(e instanceof Error ? e.message : e)}</span>`;
    }
  }, [latex, display]);
  return display ? (
    <div
      className="my-2 overflow-x-auto py-1 text-center"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  ) : (
    <span dangerouslySetInnerHTML={{ __html: html }} />
  );
}

/** A paragraph that may contain $inline math$. */
function TextWithMath({ text }: { text: string }) {
  const parts = text.split(/(\$[^$]+\$)/g);
  return (
    <p className="my-1.5 leading-relaxed">
      {parts.map((p, i) =>
        p.length > 2 && p.startsWith("$") && p.endsWith("$") ? (
          <MathHTML key={i} latex={p.slice(1, -1)} display={false} />
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </p>
  );
}

const STATUS_STYLE: Record<string, { icon: string; cls: string }> = {
  pass: {
    icon: "✓",
    cls: "border-green-300 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200",
  },
  wip: {
    icon: "…",
    cls: "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200",
  },
  todo: {
    icon: "○",
    cls: "border-stone-300 bg-stone-50 text-stone-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-400",
  },
};

export default function LatexPreview({
  source,
  config,
}: {
  source: string;
  config: LatexLessonConfig;
}) {
  // Debounce so the page re-typesets shortly after the kid stops typing.
  const [debounced, setDebounced] = useState(source);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(source), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [source]);

  const blocks = useMemo(() => parseDoc(debounced).blocks, [debounced]);
  const statuses = useMemo(() => {
    try {
      return checkDocument(debounced, config).statuses;
    } catch {
      return {} as Record<string, string>;
    }
  }, [debounced, config]);

  const titleById = useMemo(() => {
    const m: Record<string, string> = {};
    for (const ex of config.exercises) m[ex.id] = ex.title ?? ex.id;
    return m;
  }, [config]);

  return (
    <div className="mx-auto max-w-2xl">
      {/* The "paper" */}
      <div className="rounded-md border border-stone-200 bg-white px-6 py-5 font-serif text-[15px] text-stone-900 shadow-sm dark:border-stone-700 dark:bg-stone-100 dark:text-stone-900">
        {blocks.length === 0 && (
          <p className="text-center text-sm italic text-stone-400">
            Your typeset page will appear here as you write…
          </p>
        )}
        {blocks.map((b, i) => {
          switch (b.kind) {
            case "section":
              return (
                <h2 key={i} className="mb-2 mt-4 text-center text-xl font-bold first:mt-0">
                  {b.text}
                </h2>
              );
            case "subsection":
              return (
                <h3 key={i} className="mb-1.5 mt-3 text-lg font-semibold">
                  {b.text}
                </h3>
              );
            case "math":
              return <MathHTML key={i} latex={b.latex} display />;
            case "marker": {
              const status = STATUS_STYLE[statuses[b.id] ?? "todo"];
              return (
                <div key={i} className="mt-4 flex items-center gap-2 font-sans first:mt-0">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${status.cls}`}
                  >
                    <span aria-hidden="true">{status.icon}</span>
                    {titleById[b.id] ?? b.id}
                  </span>
                  <div className="h-px flex-1 bg-stone-200 dark:bg-stone-300" />
                </div>
              );
            }
            default:
              return <TextWithMath key={i} text={b.text} />;
          }
        })}
      </div>
      <p className="mt-1.5 text-center text-[11px] text-stone-400">
        Your page, typeset live — exactly how a real math paper is made.
      </p>
    </div>
  );
}
