// Single source of truth for Data Structures & Algorithms curriculum.
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
  { phase: 1, name: "Count the Cost", weeks: [1, 2, 3] },
  { phase: 2, name: "Hold the Data", weeks: [4, 5] },
  { phase: 3, name: "Sort It", weeks: [6, 7] },
  { phase: 4, name: "Smart Structures", weeks: [8, 9, 10] },
  { phase: 5, name: "The Big Picture", weeks: [11] },
];

export const weeks: Week[] = [
  {
    week: 1,
    slug: "lesson-01",
    title: "How Fast Is Fast?",
    summary:
      "Some jobs take the same time no matter what; others get slower as the pile grows. Count the steps and watch a flat line race a slanted one.",
    phase: 1,
    status: "published",
  },
  {
    week: 2,
    slug: "lesson-02",
    title: "Linear Search",
    summary:
      "Find a number by checking every box in a row. It works — but watch how the step-count climbs in a straight line as the row gets longer.",
    phase: 1,
    status: "published",
  },
  {
    week: 3,
    slug: "lesson-03",
    title: "Binary Search",
    summary:
      "Throw away half the haystack every guess. Plot it against linear search and watch a nearly-flat curve crush the straight line — but only if the list is sorted.",
    phase: 1,
    status: "published",
  },
  {
    week: 4,
    slug: "lesson-04",
    title: "Stacks & Queues",
    summary:
      "Two ways to hold a pile: last-in-first-out (a stack of plates) and first-in-first-out (a line at the door). Watch the cells fill and drain.",
    phase: 2,
    status: "published",
  },
  {
    week: 5,
    slug: "lesson-05",
    title: "Recursion",
    summary:
      "A function that calls itself! Give it a tiny base case and one step toward it, then watch the call stack pile up and unwind.",
    phase: 2,
    status: "published",
  },
  {
    week: 6,
    slug: "lesson-06",
    title: "Sorting I — Bubble Sort",
    summary:
      "Sort by swapping neighbors over and over. Simple to write, but count the swaps and meet the steep N² hill.",
    phase: 3,
    status: "published",
  },
  {
    week: 7,
    slug: "lesson-07",
    title: "Sorting II — Merge Sort",
    summary:
      "Split, sort the halves, merge them back. Plot merge sort against bubble sort and SEE its gentle curve dive under the N² hill.",
    phase: 3,
    status: "published",
  },
  {
    week: 8,
    slug: "lesson-08",
    title: "Hash Tables",
    summary:
      "Turn a key into a bucket number and jump straight to it — no searching. Watch keys land in buckets, see a collision, and learn the trick that fixes it.",
    phase: 4,
    status: "published",
  },
  {
    week: 9,
    slug: "lesson-09",
    title: "Binary Search Trees",
    summary:
      "Store data in a branching tree where smaller goes left and bigger goes right. Search walks just one path down — the shape that makes lookups fast.",
    phase: 4,
    status: "published",
  },
  {
    week: 10,
    slug: "lesson-10",
    title: "Graphs & Shortest Path",
    summary:
      "A map of dots and connections. Explore it layer by layer to find the fewest hops from start to goal — the same idea that routes a packet across the internet.",
    phase: 4,
    status: "published",
  },
  {
    week: 11,
    slug: "lesson-11",
    title: "The Big Picture: Why Speed Matters",
    summary:
      "No code — just you, explaining why the same job can take a blink or an age depending on the tool you pick, and where you've seen Big-O hiding in every other class.",
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
