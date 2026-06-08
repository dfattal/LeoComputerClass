// Single source of truth for Leo's Game Studio curriculum.
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
  { phase: 1, name: "Pixels on Screen", weeks: [1, 2] },
  { phase: 2, name: "Things That Move", weeks: [3, 4, 5] },
  { phase: 3, name: "A Real Game", weeks: [6, 7, 8] },
];

export const weeks: Week[] = [
  {
    week: 1,
    slug: "lesson-01",
    title: "The Canvas",
    summary: "Say where things go — draw shapes at (x, y) with your first JavaScript",
    phase: 1,
    status: "published",
  },
  {
    week: 2,
    slug: "lesson-02",
    title: "The Game Loop",
    summary: "60 pictures a second — split your game into update and render",
    phase: 1,
    status: "published",
  },
  {
    week: 3,
    slug: "lesson-03",
    title: "Make It Move",
    summary: "Velocity and bouncing — your ball flies and ricochets off the walls",
    phase: 2,
    status: "published",
  },
  {
    week: 4,
    slug: "lesson-04",
    title: "You're in Control",
    summary: "Read the keyboard and steer your paddle left and right",
    phase: 2,
    status: "published",
  },
  {
    week: 5,
    slug: "lesson-05",
    title: "Crash!",
    summary: "Collision detection — tell exactly when two things touch",
    phase: 2,
    status: "published",
  },
  {
    week: 6,
    slug: "lesson-06",
    title: "Keeping Score",
    summary: "Game state — score, lives, and the dreaded GAME OVER",
    phase: 3,
    status: "published",
  },
  {
    week: 7,
    slug: "lesson-07",
    title: "The Brick Wall",
    summary: "Build the wall, knock out bricks, and make the game get harder",
    phase: 3,
    status: "published",
  },
  {
    week: 8,
    slug: "lesson-08",
    title: "Ship It: Your Arcade Game",
    summary: "Assemble the whole game and publish it online to share with friends",
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
