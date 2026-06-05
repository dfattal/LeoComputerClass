// Single source of truth for Leo's Secret Codes curriculum.
// Each "week" is one lesson. The arc: hide a message → crack a message →
// secrets in bits → share keys safely → build a public-key lock (RSA).

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
  { phase: 1, name: "Hide a Message", weeks: [1, 2] },
  { phase: 2, name: "Scramble & Crack", weeks: [3, 4] },
  { phase: 3, name: "Secrets in Bits", weeks: [5, 6] },
  { phase: 4, name: "Sharing Keys", weeks: [7, 8] },
  { phase: 5, name: "The Big Picture", weeks: [9] },
];

export const weeks: Week[] = [
  {
    week: 1,
    slug: "lesson-01",
    title: "The Caesar Cipher",
    summary: "Shift every letter down the alphabet to hide a message in plain sight",
    phase: 1,
    status: "published",
  },
  {
    week: 2,
    slug: "lesson-02",
    title: "Crack It: Brute Force",
    summary: "Try all 26 shifts and let the computer spot the one that makes real words",
    phase: 1,
    status: "published",
  },
  {
    week: 3,
    slug: "lesson-03",
    title: "The Substitution Cipher",
    summary: "Scramble the whole alphabet into a secret key — billions of times stronger",
    phase: 2,
    status: "published",
  },
  {
    week: 4,
    slug: "lesson-04",
    title: "Frequency Analysis",
    summary: "Count letters to crack a substitution — because 'e' can't hide",
    phase: 2,
    status: "published",
  },
  {
    week: 5,
    slug: "lesson-05",
    title: "The XOR Trick",
    summary: "Hide secrets in bits — and discover the key that undoes itself",
    phase: 3,
    status: "published",
  },
  {
    week: 6,
    slug: "lesson-06",
    title: "The One-Time Pad",
    summary: "The only truly unbreakable code — and why a key can never be reused",
    phase: 3,
    status: "published",
  },
  {
    week: 7,
    slug: "lesson-07",
    title: "Key Exchange by Color-Mixing",
    summary: "Agree on a secret key out loud — paint that's easy to mix, impossible to un-mix",
    phase: 4,
    status: "published",
  },
  {
    week: 8,
    slug: "lesson-08",
    title: "The Public Lock (Capstone)",
    summary: "Build tiny RSA: a lock anyone can snap shut, that only your private key opens",
    phase: 4,
    status: "published",
  },
  {
    week: 9,
    slug: "lesson-09",
    title: "The Big Picture: The History of Secret Codes",
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
