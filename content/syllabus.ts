// Single source of truth for the curriculum structure.
// Import this wherever you need week titles, phase grouping, or status info.

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
  { phase: 1, name: "Digital Logic", weeks: [1, 2] },
  { phase: 2, name: "Arithmetic", weeks: [3, 4] },
  { phase: 3, name: "Memory", weeks: [5, 6] },
  { phase: 4, name: "ALU", weeks: [7, 8] },
  { phase: 5, name: "CPU", weeks: [9, 10] },
];

export const weeks: Week[] = [
  {
    week: 1,
    slug: "week-01",
    title: "Boolean Algebra & Truth Tables",
    summary: "AND, OR, NOT, XOR — the building blocks of everything",
    phase: 1,
    status: "published",
  },
  {
    week: 2,
    slug: "week-02",
    title: "Gates as Circuits",
    summary: "MUX, equality, majority — snapping gates together",
    phase: 1,
    status: "published",
  },
  {
    week: 3,
    slug: "week-03",
    title: "Binary Numbers & The Half Adder",
    summary: "Binary counting and your first adding circuit",
    phase: 2,
    status: "published",
  },
  {
    week: 4,
    slug: "week-04",
    title: "Full Adder, Ripple-Carry & Subtraction",
    summary: "Chain adders into a calculator, then subtract",
    phase: 2,
    status: "published",
  },
  {
    week: 5,
    slug: "week-05",
    title: "Latches & Flip-Flops",
    summary: "Circuits that remember — introducing state",
    phase: 3,
    status: "planned",
  },
  {
    week: 6,
    slug: "week-06",
    title: "Registers & Register File",
    summary: "Named storage bins the CPU can read and write",
    phase: 3,
    status: "planned",
  },
  {
    week: 7,
    slug: "week-07",
    title: "ALU Operations",
    summary: "One circuit to rule them all — add, AND, OR by opcode",
    phase: 4,
    status: "planned",
  },
  {
    week: 8,
    slug: "week-08",
    title: "ALU Flags",
    summary: "Zero, carry, overflow — how the CPU knows what happened",
    phase: 4,
    status: "planned",
  },
  {
    week: 9,
    slug: "week-09",
    title: "Fetch-Decode-Execute",
    summary: "The heartbeat of every computer",
    phase: 5,
    status: "planned",
  },
  {
    week: 10,
    slug: "week-10",
    title: "Tiny CPU Capstone",
    summary: "Wire it all together into a working computer",
    phase: 5,
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
