// Single source of truth for Leo's Proof Press curriculum.
//
// The arc mirrors the "Building the Universe from First Principles" math
// curriculum Leo has already worked through on paper: each lesson teaches the
// LaTeX needed to TYPESET one chapter of math he already understands, and the
// capstone assembles his own math book ending at e^{iπ} = −1. The grader
// doesn't just check syntax — it verifies the math is numerically true.

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
  { phase: 1, name: "First Marks", weeks: [1, 2] },
  { phase: 2, name: "Counting & Infinite Towers", weeks: [3, 4] },
  { phase: 3, name: "New Numbers", weeks: [5, 6] },
  { phase: 4, name: "The Summit", weeks: [7, 8] },
];

export const weeks: Week[] = [
  {
    week: 1,
    slug: "lesson-01",
    title: "Your First Typeset Page",
    summary:
      "Fractions, limits, and integrals — publish your first page of real mathematics",
    phase: 1,
    status: "published",
  },
  {
    week: 2,
    slug: "lesson-02",
    title: "The Rules of the Machine",
    summary:
      "Primes, products, and nested functions — typeset the product and chain rules",
    phase: 1,
    status: "published",
  },
  {
    week: 3,
    slug: "lesson-03",
    title: "The Art of Counting",
    summary:
      "Factorials, \\binom, and Pascal's Triangle — the notation of counting",
    phase: 2,
    status: "published",
  },
  {
    week: 4,
    slug: "lesson-04",
    title: "The Infinite Tower",
    summary:
      "\\sum and \\infty — build the exponential series, the self-replicating machine",
    phase: 2,
    status: "published",
  },
  {
    week: 5,
    slug: "lesson-05",
    title: "The Mirror Universe",
    summary: "Logarithms and inverses — typeset the proof that ln'(x) = 1/x",
    phase: 3,
    status: "published",
  },
  {
    week: 6,
    slug: "lesson-06",
    title: "A New Dimension",
    summary: "i, rotations, and the complex plane — numbers become coordinates",
    phase: 3,
    status: "published",
  },
  {
    week: 7,
    slug: "lesson-07",
    title: "The Great Split",
    summary:
      "Multi-line derivations with align — split e^{ix} into cosine and sine",
    phase: 4,
    status: "published",
  },
  {
    week: 8,
    slug: "lesson-08",
    title: "The Summit: Your Math Book",
    summary:
      "Assemble the whole journey into one beautiful document ending at e^{iπ} = −1",
    phase: 4,
    status: "published",
  },
];
