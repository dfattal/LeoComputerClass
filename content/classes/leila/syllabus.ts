// Single source of truth for Leila's Bio Lab curriculum.

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
  { phase: 1, name: "DNA Basics", weeks: [1, 2, 3] },
  { phase: 2, name: "Decode Biology", weeks: [4, 5] },
  { phase: 3, name: "Edit DNA", weeks: [6, 7, 8] },
  { phase: 4, name: "Compare Living Things", weeks: [9, 10] },
];

export const weeks: Week[] = [
  {
    week: 1,
    slug: "lesson-01",
    title: "Count the DNA Bases",
    summary: "A, T, C, G — the four letters that spell out every living thing",
    phase: 1,
    status: "published",
  },
  {
    week: 2,
    slug: "lesson-02",
    title: "Complementary DNA",
    summary: "Every base has a partner — A pairs with T, C pairs with G",
    phase: 1,
    status: "published",
  },
  {
    week: 3,
    slug: "lesson-03",
    title: "Reverse Complement",
    summary: "Read the other strand of DNA backward",
    phase: 1,
    status: "published",
  },
  {
    week: 4,
    slug: "lesson-04",
    title: "DNA to RNA",
    summary: "Transcribe DNA into messenger RNA",
    phase: 2,
    status: "published",
  },
  {
    week: 5,
    slug: "lesson-05",
    title: "RNA to Protein",
    summary: "Translate three-letter codes into amino acids",
    phase: 2,
    status: "published",
  },
  {
    week: 6,
    slug: "lesson-06",
    title: "Mutations",
    summary: "What happens when a letter in DNA gets changed, added, or removed",
    phase: 3,
    status: "published",
  },
  {
    week: 7,
    slug: "lesson-07",
    title: "Decode Creature Traits",
    summary: "Read a toy genome and figure out what the creature looks like",
    phase: 3,
    status: "published",
  },
  {
    week: 8,
    slug: "lesson-08",
    title: "CRISPR Gene Editing",
    summary: "Find a target in DNA and replace it — like find-and-replace for genes",
    phase: 3,
    status: "published",
  },
  {
    week: 9,
    slug: "lesson-09",
    title: "Compare Two Sequences",
    summary: "How similar are two DNA strands? Count the differences",
    phase: 4,
    status: "planned",
  },
  {
    week: 10,
    slug: "lesson-10",
    title: "Species Distance",
    summary: "Use DNA differences to figure out which creatures are related",
    phase: 4,
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
