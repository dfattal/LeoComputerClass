"use client";

import { useState, type ReactNode } from "react";

const tabs = ["Lesson", "Exercises"] as const;
type Tab = (typeof tabs)[number];

export default function ContentPanel({
  lessonContent,
  exercisesContent,
}: {
  lessonContent: ReactNode;
  exercisesContent: ReactNode;
}) {
  const [active, setActive] = useState<Tab>("Lesson");

  return (
    <div className="flex h-full flex-col">
      {/* Compact underline tab bar */}
      <div className="shrink-0 border-b border-stone-200 px-4 dark:border-stone-800">
        <div className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActive(tab)}
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
      <div className="flex-1 overflow-y-auto p-4">
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
