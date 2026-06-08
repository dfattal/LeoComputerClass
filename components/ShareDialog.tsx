"use client";

import { useState } from "react";
import { useAccent } from "./AccentContext";

/**
 * Shows the public URL of a just-published game, with copy + open. Rendered by
 * CourseShell after a successful POST /api/share (Game Studio lessons).
 */
export default function ShareDialog({
  url,
  onClose,
}: {
  url: string;
  onClose: () => void;
}) {
  const accent = useAccent();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked — the input is selectable as a fallback.
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md rounded-xl border border-stone-200 bg-white p-5 shadow-xl dark:border-stone-700 dark:bg-stone-900"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
          🎉 Your game is live!
        </h2>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
          Anyone with this link can play it — no sign-in needed. Send it to a friend!
        </p>

        <div className="mt-4 flex items-center gap-2">
          <input
            readOnly
            value={url}
            onFocus={(e) => e.currentTarget.select()}
            className="min-w-0 flex-1 rounded-md border border-stone-300 bg-stone-50 px-3 py-2 text-sm text-stone-800 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"
          />
          <button
            onClick={copy}
            className={`shrink-0 rounded-md ${accent.bg} px-3 py-2 text-sm font-medium text-white ${accent.bgHover}`}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-sm font-medium ${accent.text} hover:underline`}
          >
            Open in a new tab ↗
          </a>
          <button
            onClick={onClose}
            className="rounded-md border border-stone-300 px-3 py-1.5 text-sm font-medium hover:bg-stone-100 dark:border-stone-700 dark:hover:bg-stone-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
