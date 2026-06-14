// Single source of truth for Operating Systems curriculum.
// Each "week" is one lesson. Built the proven way: every lesson opens with a PAIN
// the kid feels on the canvas, then hands them the OS idea that fixes it.
// Add lessons with scripts/scaffold-lesson.mjs and flip status to "published".

export interface Phase {
  phase: number;
  name: string;
  weeks: number[];
}

export interface Week {
  week: number;
  slug: string;
  title: string;
  summary: string;
  phase: number;
  status: "published" | "planned";
}

export const phases: Phase[] = [
  { phase: 1, name: "Sharing the CPU", weeks: [1, 2, 3] },
  { phase: 2, name: "Handing Out Memory", weeks: [4, 5] },
  { phase: 3, name: "Remembering & Speeding Up", weeks: [6, 7] },
  { phase: 4, name: "The Big Picture", weeks: [8] },
];

export const weeks: Week[] = [
  {
    week: 1,
    slug: "lesson-01",
    title: "The Frozen Computer",
    summary:
      "One program with a forever-loop hogs the CPU and the whole computer freezes. Meet the boss whose job is to never let that happen.",
    phase: 1,
    status: "published",
  },
  {
    week: 2,
    slug: "lesson-02",
    title: "Taking Turns",
    summary:
      "A tiny job is stuck forever behind a giant one. Build a round-robin scheduler that gives every program a fair slice of the CPU.",
    phase: 1,
    status: "published",
  },
  {
    week: 3,
    slug: "lesson-03",
    title: "Fair vs. Fast",
    summary:
      "Round-robin is fair, but urgent jobs feel laggy. Add priorities so the important program can cut the line.",
    phase: 1,
    status: "published",
  },
  {
    week: 4,
    slug: "lesson-04",
    title: "Whose Memory Is This?",
    summary:
      "Two programs scribble on the same RAM and corrupt each other. Build an allocator that hands each one its own block.",
    phase: 2,
    status: "published",
  },
  {
    week: 5,
    slug: "lesson-05",
    title: "Swiss-Cheese Memory",
    summary:
      "There's plenty of free memory — just not in one piece. Fight fragmentation with best-fit and compaction.",
    phase: 2,
    status: "published",
  },
  {
    week: 6,
    slug: "lesson-06",
    title: "Saving for Keeps",
    summary:
      "Turn the computer off and RAM forgets everything. Build a file system that saves data to disk blocks and finds it again by name.",
    phase: 3,
    status: "published",
  },
  {
    week: 7,
    slug: "lesson-07",
    title: "The Need for Speed",
    summary:
      "Reading the same file over and over is painfully slow. Add a cache with LRU eviction and watch the cost counter plummet.",
    phase: 3,
    status: "published",
  },
  {
    week: 8,
    slug: "lesson-08",
    title: "The Big Picture",
    summary:
      "Look back at everything the boss does. Re-explain in your own words what an operating system really is.",
    phase: 4,
    status: "published",
  },
];

export function getPhaseForWeek(weekNum: number): Phase | undefined {
  return phases.find((p) => p.weeks.includes(weekNum));
}

export function getWeeksForPhase(phaseNum: number): Week[] {
  return weeks.filter((w) => w.phase === phaseNum);
}

export function getWeekBySlug(slug: string): Week | undefined {
  return weeks.find((w) => w.slug === slug);
}
