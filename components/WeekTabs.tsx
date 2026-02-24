"use client";

import { useState, type ReactNode } from "react";

const tabs = [
  { key: "Lesson", icon: "📖" },
  { key: "Exercises", icon: "✏️" },
  { key: "Code", icon: "💻" },
] as const;
type Tab = (typeof tabs)[number]["key"];

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
      {/* Sticky tab bar */}
      <div className="sticky top-14 z-40 -mx-4 mb-6 px-4 pb-px" style={{ background: 'var(--background)' }}>
        <div className="flex gap-1 rounded-lg border border-stone-200 bg-stone-100 p-1 dark:border-stone-800 dark:bg-stone-900">
          {tabs.map(({ key, icon }) => (
            <button
              key={key}
              onClick={() => setActive(key)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                active === key
                  ? "bg-white text-indigo-700 shadow-sm dark:bg-stone-800 dark:text-indigo-300"
                  : "text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
              }`}
            >
              <span className="text-base leading-none">{icon}</span>
              {key}
            </button>
          ))}
        </div>
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
