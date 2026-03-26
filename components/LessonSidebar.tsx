"use client";

import { useState } from "react";
import Link from "next/link";

export interface SidebarPhase {
  phase: number;
  name: string;
  weeks: number[];
}

export interface SidebarWeek {
  week: number;
  slug: string;
  title: string;
  status: "published" | "planned";
  phase: number;
}

function SidebarNav({
  phases,
  weeks,
  classSlug,
  currentLesson,
  onSelect,
}: {
  phases: SidebarPhase[];
  weeks: SidebarWeek[];
  classSlug: string;
  currentLesson: string;
  onSelect?: () => void;
}) {
  return (
    <nav className="space-y-4 p-4">
      {phases.map((phase) => {
        const phaseWeeks = weeks.filter((w) => w.phase === phase.phase);
        return (
          <div key={phase.phase}>
            {/* Phase header */}
            <h2 className="mb-1.5 px-1 text-[11px] font-semibold uppercase tracking-wider text-stone-400">
              Phase {phase.phase}: {phase.name}
            </h2>

            <div className="space-y-0.5">
              {phaseWeeks.map((w) => {
                const isActive = w.slug === currentLesson;
                const isPlanned = w.status === "planned";

                if (isPlanned) {
                  return (
                    <div
                      key={w.slug}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-stone-400 dark:text-stone-500"
                      title={w.title}
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-stone-100 text-xs font-bold text-stone-400 dark:bg-stone-800 dark:text-stone-500">
                        {w.week}
                      </span>
                      <span className="truncate">{w.title}</span>
                    </div>
                  );
                }

                return (
                  <Link
                    key={w.slug}
                    href={`/classes/${classSlug}/${w.slug}`}
                    onClick={onSelect}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all ${
                      isActive
                        ? "bg-indigo-600 font-medium text-white shadow-sm shadow-indigo-600/25"
                        : "text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
                    }`}
                    title={w.title}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400"
                      }`}
                    >
                      {w.week}
                    </span>
                    <span className="truncate">{w.title}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );
}

export default function LessonSidebar({
  phases,
  weeks,
  classSlug,
  currentLesson,
}: {
  phases: SidebarPhase[];
  weeks: SidebarWeek[];
  classSlug: string;
  currentLesson: string;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Hamburger button — mobile only */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-3 top-16 z-30 rounded-md bg-white p-2 shadow-md dark:bg-stone-900 lg:hidden"
        aria-label="Open sidebar"
      >
        <svg
          className="h-5 w-5 text-stone-600 dark:text-stone-300"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"
          />
        </svg>
      </button>

      {/* Desktop sidebar — always visible on lg+ */}
      <aside className="hidden w-56 shrink-0 overflow-y-auto border-r border-stone-200 dark:border-stone-800 lg:block">
        <SidebarNav
          phases={phases}
          weeks={weeks}
          classSlug={classSlug}
          currentLesson={currentLesson}
        />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          {/* Slide-over sidebar */}
          <aside className="fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto bg-white shadow-xl dark:bg-stone-950 lg:hidden">
            <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3 dark:border-stone-800">
              <span className="text-sm font-semibold text-stone-700 dark:text-stone-200">
                Navigation
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-md p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                aria-label="Close sidebar"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <SidebarNav
              phases={phases}
              weeks={weeks}
              classSlug={classSlug}
              currentLesson={currentLesson}
              onSelect={() => setMobileOpen(false)}
            />
          </aside>
        </>
      )}
    </>
  );
}
