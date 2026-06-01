#!/usr/bin/env node
// Scaffold a new class shell: the class directory (syllabus.ts + ai-prompt.ts)
// plus a registry entry in content/classes.ts. Fill in the blanks afterward
// (use the /new-class skill for the guided workflow).
//
// Usage:
//   node scripts/scaffold-class.mjs <slug> "<Name>" "<tagline>" <accentColor>
//   node scripts/scaffold-class.mjs leo-music "Leo's Music Machine" "Make Songs with Code" sky

import { writeFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const [slug, name, tagline, accentColor] = process.argv.slice(2);
if (!slug || !name || !tagline || !accentColor) {
  console.error(
    'Usage: node scripts/scaffold-class.mjs <slug> "<Name>" "<tagline>" <accentColor>'
  );
  process.exit(2);
}
if (!/^[a-z0-9-]+$/.test(slug)) {
  console.error(`Slug must be kebab-case (a-z, 0-9, -). Got: ${slug}`);
  process.exit(2);
}

const classDir = join(ROOT, "content", "classes", slug);
if (existsSync(classDir)) {
  console.error(`Class dir already exists: ${classDir} — refusing to overwrite.`);
  process.exit(2);
}

// --- Check the accent color against lib/accents.ts (single source of truth) ---
const accentsSrc = readFileSync(join(ROOT, "lib", "accents.ts"), "utf-8");
const accentKnown = new RegExp(`^\\s{2}${accentColor}:\\s*{`, "m").test(accentsSrc);

mkdirSync(classDir, { recursive: true });

// --- syllabus.ts ---
const syllabus = `// Single source of truth for ${name} curriculum.
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
  // { phase: 1, name: "PHASE NAME", weeks: [1, 2] },
];

export const weeks: Week[] = [
  // {
  //   week: 1,
  //   slug: "lesson-01",
  //   title: "LESSON TITLE",
  //   summary: "One-line summary a 10-year-old would find exciting",
  //   phase: 1,
  //   status: "planned",
  // },
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
`;
writeFileSync(join(classDir, "syllabus.ts"), syllabus);

// --- ai-prompt.ts ---
const aiPrompt = `// ${name} AI coaching system prompt for code review.

export const systemPrompt = \`You are a warm, sharp coach talking to a curious kid who is learning [SUBJECT] through Python. Be playful, encouraging, and genuinely excited when their code works.

WHO THE STUDENT IS:
- [What they already know — assume real Python ability; don't dumb the code down.]
- [Any prior classes to build on.]
- The whole class is one story: "[THE THROUGH-LINE]". Tie feedback back to that mission whenever you can.

THE BIG IDEAS THIS CLASS TEACHES, with the picture each one hangs on:
- [IDEA]: [a concrete analogy a 10-year-old can see.]
- [IDEA]: [analogy.]

VALUES & CONVENTIONS USED IN THE CLASS:
- [e.g. functions return str/int/bool/list, never dict, for JSON robustness.]
- [domain rules — units, ranges, edge cases that trip students up.]

VOICE & TONE:
- Be genuinely excited and warm; treat the student as capable, no baby talk.
- Frame improvements as the next challenge, not a correction.
- Celebrate good habits: reusing helpers, clear names, sanity-checks.
\`;
`;
writeFileSync(join(classDir, "ai-prompt.ts"), aiPrompt);

// --- Append registry entry to content/classes.ts ---
const registryPath = join(ROOT, "content", "classes.ts");
let registry = readFileSync(registryPath, "utf-8");
const entry = `  {
    slug: "${slug}",
    name: "${name}",
    tagline: "${tagline}",
    description:
      "TODO: one-paragraph description for the class card and landing page.",
    accentColor: "${accentColor}",
    heroImage: "/hero-${slug}.webp",
    studentName: "Student",
    contentDir: "${slug}",
    language: "python",
    comingSoon: true,
  },
`;
// Insert before the closing "];" of the `classes` array.
const arrStart = registry.indexOf("export const classes");
const closeIdx = registry.indexOf("\n];", arrStart);
if (arrStart === -1 || closeIdx === -1) {
  console.error("Could not locate the `classes` array in content/classes.ts — add the entry by hand:");
  console.error(entry);
} else {
  registry = registry.slice(0, closeIdx + 1) + entry + registry.slice(closeIdx + 1);
  writeFileSync(registryPath, registry);
}

// --- Report ---
console.log(`✓ Created ${classDir}/syllabus.ts`);
console.log(`✓ Created ${classDir}/ai-prompt.ts`);
console.log(`✓ Added "${slug}" to content/classes.ts (comingSoon: true, hero /hero-${slug}.webp)`);
console.log("");
console.log("Next:");
console.log(`  1. Fill the description in content/classes.ts and the ai-prompt.ts blanks.`);
console.log(`  2. Plan phases/weeks in content/classes/${slug}/syllabus.ts.`);
console.log(`  3. Add a hero image at public/hero-${slug}.webp.`);
console.log(`  4. Build lessons: node scripts/scaffold-lesson.mjs ${slug} 1 "Lesson Title"`);
console.log(`  5. Remove comingSoon once the first lesson is published.`);
if (!accentKnown) {
  console.log("");
  console.log("⚠️  ACCENT COLOR NOT FOUND in lib/accents.ts!");
  console.log(`    "${accentColor}" is not one of the known accents. Add a full block for it to`);
  console.log(`    lib/accents.ts (copy an existing color, swap the name on every line) or the`);
  console.log(`    class will silently fall back to indigo everywhere.`);
}
