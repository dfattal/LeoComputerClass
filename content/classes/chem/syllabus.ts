// Single source of truth for Kitchen Chemistry curriculum.
// Each "week" is one lesson. Fill in the arc, then add lessons with
// scripts/scaffold-lesson.mjs and flip status to "published" when each is done.

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
  { phase: 1, name: "What Everything Is Made Of", weeks: [1, 2, 3, 4] },
  { phase: 2, name: "Reactions You Can See", weeks: [5, 6, 7, 8] },
  { phase: 3, name: "The Big Picture", weeks: [9] },
];

export const weeks: Week[] = [
  {
    week: 1,
    slug: "lesson-01",
    title: "Atom Builder",
    summary: "Draw your very first atom — a nucleus with rings of electrons spinning around it",
    phase: 1,
    status: "published",
  },
  {
    week: 2,
    slug: "lesson-02",
    title: "The Element Family",
    summary: "Fill up electron shells and discover why the elements line up in a table",
    phase: 1,
    status: "published",
  },
  {
    week: 3,
    slug: "lesson-03",
    title: "Sticking Atoms Together",
    summary: "Snap atoms into molecules — build water, air, and the fizz in soda",
    phase: 1,
    status: "published",
  },
  {
    week: 4,
    slug: "lesson-04",
    title: "Solid, Liquid, Gas",
    summary: "Heat it up and watch the same stuff go from packed, to loose, to flying free",
    phase: 1,
    status: "published",
  },
  {
    week: 5,
    slug: "lesson-05",
    title: "Reactions = Rearranging",
    summary: "Smash molecules apart and build new ones — and prove nothing ever disappears",
    phase: 2,
    status: "published",
  },
  {
    week: 6,
    slug: "lesson-06",
    title: "Acids, Bases & the Color Spy",
    summary: "Use cabbage-juice magic to turn secret acids and bases into rainbow colors",
    phase: 2,
    status: "published",
  },
  {
    week: 7,
    slug: "lesson-07",
    title: "Mixing Colors & Chromatography",
    summary: "Split one marker into its hidden colors as they race up the paper",
    phase: 2,
    status: "published",
  },
  {
    week: 8,
    slug: "lesson-08",
    title: "Grow a Crystal",
    summary: "Let atoms line up into a sparkling, perfectly patterned crystal",
    phase: 2,
    status: "published",
  },
  {
    week: 9,
    slug: "lesson-09",
    title: "The Big Picture: From Atoms to Everything",
    summary: "Look back at the whole journey — then explain a big idea in your own words",
    phase: 3,
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
