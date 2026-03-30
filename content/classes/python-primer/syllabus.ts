// Single source of truth for Python Primer curriculum.

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
  { phase: 1, name: "Python Basics", weeks: [1, 2, 3] },
  { phase: 2, name: "Power Tools", weeks: [4, 5] },
];

export const weeks: Week[] = [
  {
    week: 1,
    slug: "lesson-01",
    title: "Say Hello to Python",
    summary: "Your first functions — print, variables, and math",
    phase: 1,
    status: "published",
  },
  {
    week: 2,
    slug: "lesson-02",
    title: "Strings Are Superpowers",
    summary: "Slice, search, reverse, and transform text",
    phase: 1,
    status: "published",
  },
  {
    week: 3,
    slug: "lesson-03",
    title: "Containers: Tuples, Lists & Dicts",
    summary: "Store and organize data in Python's three containers",
    phase: 1,
    status: "published",
  },
  {
    week: 4,
    slug: "lesson-04",
    title: "Making Decisions & Repeating Things",
    summary: "If/else choices and for loops with range",
    phase: 2,
    status: "published",
  },
  {
    week: 5,
    slug: "lesson-05",
    title: "While Loops & Bit Magic",
    summary: "While loops, break, and the binary language of computers",
    phase: 2,
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
