// Single source of truth for Pixel Wizards curriculum.

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
  { phase: 1, name: "First Pictures", weeks: [1, 2, 3] },
  { phase: 2, name: "Spells & Choices", weeks: [4, 5, 6] },
  { phase: 3, name: "Loops", weeks: [7] },
  { phase: 4, name: "The Big Picture", weeks: [8] },
];

export const weeks: Week[] = [
  {
    week: 1,
    slug: "lesson-01",
    title: "Hello, Pixels!",
    summary: "Your very first code makes a colored square appear",
    phase: 1,
    status: "published",
  },
  {
    week: 2,
    slug: "lesson-02",
    title: "Boxes That Remember",
    summary: "Variables: name a color once, change it everywhere",
    phase: 1,
    status: "published",
  },
  {
    week: 3,
    slug: "lesson-03",
    title: "Numbers & Counting",
    summary: "Use numbers to size and place your blocks",
    phase: 1,
    status: "published",
  },
  {
    week: 4,
    slug: "lesson-04",
    title: "Magic Spells",
    summary: "Functions: write a drawing once, name it, reuse it",
    phase: 2,
    status: "published",
  },
  {
    week: 5,
    slug: "lesson-05",
    title: "Spells with Inputs",
    summary: "Parameters: one spell, endless pictures",
    phase: 2,
    status: "published",
  },
  {
    week: 6,
    slug: "lesson-06",
    title: "Making Choices",
    summary: "if/else lets the computer decide each square",
    phase: 2,
    status: "published",
  },
  {
    week: 7,
    slug: "lesson-07",
    title: "Do It Again",
    summary: "Loops fill a whole grid from just a few lines",
    phase: 3,
    status: "published",
  },
  {
    week: 8,
    slug: "lesson-08",
    title: "The Big Picture: Where Pixels Came From",
    summary: "A look back at the whole journey — then explain a big idea in your own words",
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
