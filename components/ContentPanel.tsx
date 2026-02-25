"use client";

import { useState, useRef, useCallback, type ReactNode } from "react";

const tabs = ["Lesson", "Exercises"] as const;
type Tab = (typeof tabs)[number];

const tabId = (tab: Tab) => `tab-${tab.toLowerCase()}`;
const panelId = (tab: Tab) => `tabpanel-${tab.toLowerCase()}`;

export default function ContentPanel({
  lessonContent,
  exercisesContent,
}: {
  lessonContent: ReactNode;
  exercisesContent: ReactNode;
}) {
  const [active, setActive] = useState<Tab>("Lesson");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const idx = tabs.indexOf(active);
      let newIdx = idx;
      if (e.key === "ArrowLeft") {
        newIdx = idx > 0 ? idx - 1 : tabs.length - 1;
      } else if (e.key === "ArrowRight") {
        newIdx = idx < tabs.length - 1 ? idx + 1 : 0;
      } else {
        return;
      }
      e.preventDefault();
      setActive(tabs[newIdx]);
      tabRefs.current[newIdx]?.focus();
    },
    [active]
  );

  return (
    <div className="flex h-full flex-col">
      {/* Compact underline tab bar */}
      <div className="shrink-0 border-b border-stone-200 px-4 dark:border-stone-800">
        <div className="flex gap-4" role="tablist" onKeyDown={handleKeyDown}>
          {tabs.map((tab, i) => (
            <button
              key={tab}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              onClick={() => setActive(tab)}
              role="tab"
              id={tabId(tab)}
              aria-selected={active === tab}
              aria-controls={panelId(tab)}
              tabIndex={active === tab ? 0 : -1}
              className={`relative py-2.5 text-sm font-medium transition-colors ${
                active === tab
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
              }`}
            >
              {tab}
              {active === tab && (
                <span className="absolute inset-x-0 -bottom-px h-0.5 bg-indigo-600 dark:bg-indigo-400" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable content */}
      <div
        className="flex-1 overflow-y-auto p-4"
        role="tabpanel"
        id={panelId(active)}
        aria-labelledby={tabId(active)}
      >
        {active === "Lesson" && (
          <article className="prose-custom">{lessonContent}</article>
        )}
        {active === "Exercises" && (
          <article className="prose-custom">{exercisesContent}</article>
        )}
      </div>
    </div>
  );
}
