// Single source of truth for DNA Decoders curriculum.
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
  { phase: 1, name: "Read the Code", weeks: [1, 2, 3, 4] },
  { phase: 2, name: "Crack the Code", weeks: [5, 6, 7] },
];

export const weeks: Week[] = [
  {
    week: 1,
    slug: "lesson-01",
    title: "DNA is a String of Letters",
    summary: "Grab any base in a strand by its spot — meet your first colored DNA",
    phase: 1,
    status: "published",
  },
  {
    week: 2,
    slug: "lesson-02",
    title: "Slicing the Strand",
    summary: "Snip out a piece of DNA — or flip the whole strand backwards",
    phase: 1,
    status: "planned",
  },
  {
    week: 3,
    slug: "lesson-03",
    title: "Counting & Swapping Bases",
    summary: "Tally bases in one line, and turn DNA into RNA all at once",
    phase: 1,
    status: "planned",
  },
  {
    week: 4,
    slug: "lesson-04",
    title: "Lists: a Backpack of Bases",
    summary: "Hold many bases in one backpack instead of a jar for each",
    phase: 1,
    status: "planned",
  },
  {
    week: 5,
    slug: "lesson-05",
    title: "Loops: Do It to Every Base",
    summary: "Build the matching strand by visiting every base with a loop",
    phase: 2,
    status: "planned",
  },
  {
    week: 6,
    slug: "lesson-06",
    title: "Dictionaries: the Lookup Table",
    summary: "Look up answers instantly — the trick behind the genetic code",
    phase: 2,
    status: "planned",
  },
  {
    week: 7,
    slug: "lesson-07",
    title: "Chunk the Genome → Decode a Creature",
    summary: "Read DNA three letters at a time and hatch a living creature",
    phase: 2,
    status: "planned",
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
