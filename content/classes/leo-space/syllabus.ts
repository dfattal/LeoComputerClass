// Single source of truth for Leo's Space School curriculum.
// Each "week" is one lesson. Lesson 1 is published; the rest are planned and
// will be filled in following the Fly-a-Mission arc.

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
  { phase: 1, name: "Falling Forever", weeks: [1, 2] },
  { phase: 2, name: "Real Orbits", weeks: [3, 4] },
  { phase: 3, name: "Flying a Mission", weeks: [5, 6] },
  { phase: 4, name: "To Other Worlds", weeks: [7, 8] },
  { phase: 5, name: "The Big Picture", weeks: [9] },
];

export const weeks: Week[] = [
  {
    week: 1,
    slug: "lesson-01",
    title: "Gravity Gets Weaker",
    summary: "Newton's law of gravity — and why the Moon doesn't fall down",
    phase: 1,
    status: "published",
  },
  {
    week: 2,
    slug: "lesson-02",
    title: "Falling Around the World",
    summary: "An orbit is falling sideways fast enough to keep missing",
    phase: 1,
    status: "published",
  },
  {
    week: 3,
    slug: "lesson-03",
    title: "Ellipses & Kepler",
    summary: "Too much speed and the circle stretches — find perigee and apogee",
    phase: 2,
    status: "published",
  },
  {
    week: 4,
    slug: "lesson-04",
    title: "Escape!",
    summary: "Energy decides: come back, orbit, or leave forever",
    phase: 2,
    status: "published",
  },
  {
    week: 5,
    slug: "lesson-05",
    title: "Off the Pad",
    summary: "Rockets get lighter as they burn — climb to orbital speed",
    phase: 3,
    status: "published",
  },
  {
    week: 6,
    slug: "lesson-06",
    title: "The Lunar Lander",
    summary: "Fire the engine to kill your fall and touch down softly",
    phase: 3,
    status: "published",
  },
  {
    week: 7,
    slug: "lesson-07",
    title: "Transfer to Mars",
    summary: "Two precise burns to hop from one orbit to another",
    phase: 4,
    status: "published",
  },
  {
    week: 8,
    slug: "lesson-08",
    title: "Mission Control (Capstone)",
    summary: "Let your simulator hunt down the one perfect orbit speed — and rediscover the law",
    phase: 4,
    status: "published",
  },
  {
    week: 9,
    slug: "lesson-09",
    title: "The Big Picture: Why the Moon Doesn't Fall",
    summary: "A look back at the whole journey — then explain a big idea in your own words",
    phase: 5,
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
