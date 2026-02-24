import fs from "fs";
import path from "path";

const contentDir = path.join(process.cwd(), "content");

export function getWeekSlugs(): string[] {
  if (!fs.existsSync(contentDir)) return [];
  return fs
    .readdirSync(contentDir)
    .filter((name) => name.startsWith("week-"))
    .sort();
}

export interface TestCase {
  name: string;
  args: unknown[];
  expected: unknown;
}

export interface TestEntry {
  entry: string;
  timeoutMs?: number;
  cases: TestCase[];
  constraints?: { forbidTokens?: string[] };
}

export interface RubricItem {
  criterion: string;
  weight: number;
  description: string;
}

export interface WeekContent {
  slug: string;
  lessonSource: string;
  exercisesSource: string;
  tests: TestEntry[];
  rubric: RubricItem[];
}

export function loadWeekContent(slug: string): WeekContent {
  const weekDir = path.join(contentDir, slug);

  const lessonSource = fs.readFileSync(
    path.join(weekDir, "lesson.mdx"),
    "utf-8"
  );
  const exercisesSource = fs.readFileSync(
    path.join(weekDir, "exercises.mdx"),
    "utf-8"
  );

  const testsPath = path.join(weekDir, "tests.json");
  const tests: TestEntry[] = fs.existsSync(testsPath)
    ? JSON.parse(fs.readFileSync(testsPath, "utf-8"))
    : [];

  const rubricPath = path.join(weekDir, "rubric.json");
  const rubric: RubricItem[] = fs.existsSync(rubricPath)
    ? JSON.parse(fs.readFileSync(rubricPath, "utf-8"))
    : [];

  return { slug, lessonSource, exercisesSource, tests, rubric };
}
