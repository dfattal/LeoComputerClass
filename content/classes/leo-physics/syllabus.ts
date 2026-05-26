// Single source of truth for Leo's Motion Lab curriculum.
// Each "week" is one lesson. Lesson 1 is published; the rest are planned and
// will be filled in following the Build-a-Blaster arc.

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
  { phase: 1, name: "Motion as Code", weeks: [1, 2] },
  { phase: 2, name: "The Real World Fights Back", weeks: [3, 4] },
  { phase: 3, name: "Powering the Shot", weeks: [5, 6] },
  { phase: 4, name: "Engineering the Blaster", weeks: [7, 8] },
];

export const weeks: Week[] = [
  {
    week: 1,
    slug: "lesson-01",
    title: "From Calculus to Simulation",
    summary: "Turn x, v, a into a stepping loop — and watch a ball fall",
    phase: 1,
    status: "published",
  },
  {
    week: 2,
    slug: "lesson-02",
    title: "Launch! Projectiles in 2D",
    summary: "Angle, gravity, and the perfect parabola — in a vacuum",
    phase: 1,
    status: "published",
  },
  {
    week: 3,
    slug: "lesson-03",
    title: "Air Resistance",
    summary: "Add drag — now there's no formula, only simulation",
    phase: 2,
    status: "published",
  },
  {
    week: 4,
    slug: "lesson-04",
    title: "Range, Height & Hang Time",
    summary: "Measure a shot, then hunt for the best launch angle",
    phase: 2,
    status: "published",
  },
  {
    week: 5,
    slug: "lesson-05",
    title: "Spring-Powered Blasters",
    summary: "Stored energy, a fading push, and muzzle velocity",
    phase: 3,
    status: "published",
  },
  {
    week: 6,
    slug: "lesson-06",
    title: "Compressed-Air Blasters",
    summary: "Gas pushes as it expands — why barrel length matters",
    phase: 3,
    status: "published",
  },
  {
    week: 7,
    slug: "lesson-07",
    title: "The Whole Blaster",
    summary: "Chain the inside and the outside into one shot predictor",
    phase: 4,
    status: "published",
  },
  {
    week: 8,
    slug: "lesson-08",
    title: "Design Optimizer (Capstone)",
    summary: "Sweep the settings and find the dart that flies the farthest",
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
