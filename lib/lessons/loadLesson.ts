import fs from "fs";
import path from "path";

const classesDir = path.join(process.cwd(), "content", "classes");

// ---------------------------------------------------------------------------
// Class-aware API
// ---------------------------------------------------------------------------

/** Return sorted lesson-directory names for a given class. */
export function getLessonSlugs(classSlug: string): string[] {
  const dir = path.join(classesDir, classSlug);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => {
      const full = path.join(dir, name);
      return fs.statSync(full).isDirectory();
    })
    .sort();
}

/** Load all content files for one lesson inside a class. */
export function loadLessonContent(
  classSlug: string,
  lessonSlug: string
): LessonContent {
  const lessonDir = path.join(classesDir, classSlug, lessonSlug);

  const lessonSource = fs.readFileSync(
    path.join(lessonDir, "lesson.mdx"),
    "utf-8"
  );
  const exercisesSource = fs.readFileSync(
    path.join(lessonDir, "exercises.mdx"),
    "utf-8"
  );

  const testsPath = path.join(lessonDir, "tests.json");
  const tests: TestEntry[] = fs.existsSync(testsPath)
    ? JSON.parse(fs.readFileSync(testsPath, "utf-8"))
    : [];

  const rubricPath = path.join(lessonDir, "rubric.json");
  const rubric: RubricItem[] = fs.existsSync(rubricPath)
    ? JSON.parse(fs.readFileSync(rubricPath, "utf-8"))
    : [];

  const starterPath = path.join(lessonDir, "starter.py");
  const starterCode: string | undefined = fs.existsSync(starterPath)
    ? fs.readFileSync(starterPath, "utf-8")
    : undefined;

  const vizPath = path.join(lessonDir, "viz.json");
  const vizConfig: VizConfig | undefined = fs.existsSync(vizPath)
    ? JSON.parse(fs.readFileSync(vizPath, "utf-8"))
    : undefined;

  return {
    slug: lessonSlug,
    lessonSource,
    exercisesSource,
    tests,
    rubric,
    starterCode,
    vizConfig,
  };
}

// ---------------------------------------------------------------------------
// Backward-compat wrappers (Leo-specific, used until all callers migrate)
// ---------------------------------------------------------------------------

export function getWeekSlugs(): string[] {
  return getLessonSlugs("leo");
}

export function loadWeekContent(slug: string): WeekContent {
  const content = loadLessonContent("leo", slug);
  return {
    slug: content.slug,
    lessonSource: content.lessonSource,
    exercisesSource: content.exercisesSource,
    tests: content.tests,
    rubric: content.rubric,
  };
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TestCase {
  name: string;
  args: unknown[];
  expected: unknown;
  /** Absolute tolerance for numeric comparison (overrides the entry-level tol). */
  tol?: number;
}

export interface TestEntry {
  entry: string;
  timeoutMs?: number;
  cases: TestCase[];
  constraints?: { forbidTokens?: string[] };
  /** Absolute tolerance for numeric comparison, applied to all cases unless a
   *  case sets its own. Needed for float/physics exercises. */
  tol?: number;
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

/** Bio-class CRISPR simulator visualization. */
export interface CrisprVizConfig {
  type: "crispr";
  scenario: {
    title: string;
    mission: string;
    dna: string;
    target: string;
    replacement: string;
    traitsBefore?: Record<string, string>;
    traitsAfter?: Record<string, string>;
  };
  /** The function name whose return value drives the visualization */
  resultFn: string;
  /** Args to pass to resultFn for the demo */
  demoArgs: unknown[];
}

/**
 * Generic line/trajectory plot. The `resultFn` must return JSON-serializable
 * plot data — either a single series `[[x, y], ...]` or multiple series
 * `[{ name, points: [[x, y], ...], highlight? }, ...]`.
 */
export interface PlotVizConfig {
  type: "plot";
  /** The function (defined in the student's code or in `setup`) that returns plot data. */
  resultFn: string;
  /** Args to pass to resultFn for the demo. */
  demoArgs: unknown[];
  /** Optional Python prelude appended after the student's code (e.g. plot helpers). */
  setup?: string;
  title?: string;
  xLabel?: string;
  yLabel?: string;
}

export type VizConfig = CrisprVizConfig | PlotVizConfig;

export interface LessonContent extends WeekContent {
  starterCode?: string;
  vizConfig?: VizConfig;
}
