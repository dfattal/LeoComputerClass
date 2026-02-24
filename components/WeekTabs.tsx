"use client";

import { useState, type ReactNode } from "react";

const tabs = ["Lesson", "Exercises", "Code"] as const;
type Tab = (typeof tabs)[number];

export default function WeekTabs({
  lessonContent,
  exercisesContent,
  codeWorkspace,
}: {
  lessonContent: ReactNode;
  exercisesContent: ReactNode;
  codeWorkspace: ReactNode;
}) {
  const [active, setActive] = useState<Tab>("Lesson");

  return (
    <div className="min-w-0 flex-1">
      <div className="mb-6 flex gap-1 border-b border-zinc-200 dark:border-zinc-800">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              active === tab
                ? "border-b-2 border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100"
                : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div>
        {active === "Lesson" && (
          <article className="prose-custom">{lessonContent}</article>
        )}
        {active === "Exercises" && (
          <article className="prose-custom">{exercisesContent}</article>
        )}
        {active === "Code" && codeWorkspace}
      </div>
    </div>
  );
}
