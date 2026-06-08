import fs from "fs";
import path from "path";
import type { LatexLessonConfig } from "@/lib/latex/check.mjs";

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

  // The working file: starter.py for Python lessons, starter.tex for latex
  // lessons, starter.js for javascript lessons. All land in the same
  // `starterCode` field — the editor doesn't care, only the language/checker
  // wiring does.
  const starterPath = path.join(lessonDir, "starter.py");
  const starterTexPath = path.join(lessonDir, "starter.tex");
  const starterJsPath = path.join(lessonDir, "starter.js");
  const starterCode: string | undefined = fs.existsSync(starterPath)
    ? fs.readFileSync(starterPath, "utf-8")
    : fs.existsSync(starterTexPath)
      ? fs.readFileSync(starterTexPath, "utf-8")
      : fs.existsSync(starterJsPath)
        ? fs.readFileSync(starterJsPath, "utf-8")
        : undefined;

  const vizPath = path.join(lessonDir, "viz.json");
  const vizConfig: VizConfig | undefined = fs.existsSync(vizPath)
    ? JSON.parse(fs.readFileSync(vizPath, "utf-8"))
    : undefined;

  const reflectionPath = path.join(lessonDir, "reflection.json");
  const reflectionConfig: ReflectionConfig | undefined = fs.existsSync(
    reflectionPath
  )
    ? JSON.parse(fs.readFileSync(reflectionPath, "utf-8"))
    : undefined;

  // A "latex" lesson (typesetting class): the student writes a LaTeX math
  // document instead of Python. Signalled by latex.json (like reflection.json
  // signals a reflection lesson). reference.tex stays inert, exactly like
  // reference.py — only validate-class reads it.
  const latexPath = path.join(lessonDir, "latex.json");
  const latexConfig: LatexLessonConfig | undefined = fs.existsSync(latexPath)
    ? JSON.parse(fs.readFileSync(latexPath, "utf-8"))
    : undefined;

  // A "javascript" lesson (Game Studio): the student writes JS instead of
  // Python. Signalled by js.json (like latex.json signals a latex lesson). It
  // carries the optional live game-preview config; tests.json still grades, and
  // reference.js stays inert (only validate-class reads it), like reference.py.
  const jsPath = path.join(lessonDir, "js.json");
  const jsConfig: JsLessonConfig | undefined = fs.existsSync(jsPath)
    ? JSON.parse(fs.readFileSync(jsPath, "utf-8"))
    : undefined;

  return {
    slug: lessonSlug,
    lessonSource,
    exercisesSource,
    tests,
    rubric,
    starterCode,
    vizConfig,
    reflectionConfig,
    latexConfig,
    jsConfig,
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
 * One tolerance-aware check of a curve-driving student function: call `fn(*args)`
 * and compare to `expected` within `tol`. Used by the progress-aware plot caption
 * (below) the same way `DrawStage` is used by progressive draw lessons — the
 * caption can't be inferred from the rendered series (the panel falls back to a
 * reference curve so it's never blank), so we check the student's functions
 * directly. `expected`/`tol` come from a representative `tests.json` case and are
 * cross-checked against `reference.py` by `npm run validate-class`.
 */
export interface PlotCaptionCheck {
  fn: string;
  args: unknown[];
  expected: unknown;
  tol?: number;
}

/**
 * Optional progress-aware caption for a plot lesson. Renders one line under the
 * graph reflecting where the student is: `todo` while a check fn is missing /
 * errors / returns None, `tuning` while the checks run but don't all match, and
 * `match` once every check matches within tol. Gate on the curve-driving fn(s)
 * only, so the caption always agrees with the visible curve.
 */
export interface PlotCaptionConfig {
  todo: string;
  tuning: string;
  match: string;
  checks: PlotCaptionCheck[];
}

/**
 * One stage of a progressive PLOT lesson — the plot analog of `DrawStage`. Each
 * stage owns a `resultFn` that builds its own series list (it may include muted
 * comparison curves), and a `check` that gates the stage's status. The engine
 * runs every stage each Run; by default LinePlot shows the furthest stage in the
 * leading run of correct steps (`auto`), but the student can pin an earlier one
 * via the chip row to experiment with that function's curve live.
 *
 * Use this ONLY when a lesson has two-or-more functions that each draw a
 * genuinely separate curve (e.g. RSA "lock" = encrypt(m) vs "unlock" =
 * decrypt(encrypt(m))). When the functions compose into one curve, or the plot
 * shows intentional comparison series, keep the single `caption` form instead.
 */
export interface PlotStage {
  /** Builds this stage's series (defined in the student's code or `setup`). */
  resultFn: string;
  /** Args to pass to this stage's resultFn. */
  demoArgs: unknown[];
  /** Gates this stage's status (match / wip / todo) by checking a student fn. */
  check: PlotCaptionCheck;
  /** Shown under the graph once this stage is the furthest correct one. */
  caption: string;
  /** Optional short chip label (defaults to "Step N"). */
  label?: string;
}

/**
 * Generic line/trajectory plot. The `resultFn` must return JSON-serializable
 * plot data — either a single series `[[x, y], ...]` or multiple series
 * `[{ name, points: [[x, y], ...], highlight? }, ...]`.
 */
export interface PlotVizConfig {
  type: "plot";
  /**
   * The function (defined in the student's code or in `setup`) that returns plot
   * data. Required for single/simple plots; omit when using `stages` (each stage
   * carries its own resultFn).
   */
  resultFn?: string;
  /** Args to pass to resultFn for the demo. */
  demoArgs?: unknown[];
  /** Optional Python prelude appended after the student's code (e.g. plot helpers). */
  setup?: string;
  title?: string;
  xLabel?: string;
  yLabel?: string;
  /** Optional progress-aware caption shown under the graph (backward-compatible). */
  caption?: PlotCaptionConfig;
  /**
   * Optional progressive stages (pin-to-play). When present, LinePlot shows a
   * chip row and the student can pin a stage's curve. Mutually exclusive with the
   * single `resultFn`/`caption` form. See `PlotStage`.
   */
  stages?: PlotStage[];
  /** Fallback caption shown while a pinned/auto stage isn't correct yet. */
  todo?: string;
}

/**
 * One step of a progressive drawing lesson: the student function `fn`, the demo
 * `args` to call it with, the `expected` grid a correct solution returns for
 * those args, and the `caption` to show once this is the furthest correct step.
 */
export interface DrawStage {
  fn: string;
  args: unknown[];
  expected: unknown;
  caption: string;
  /** Optional short label for this stage's chip in the canvas (defaults to "Step N"). */
  label?: string;
}

/**
 * Pixel-grid drawing canvas (used by the "Pixel Wizards" beginner class). A cell
 * is a named color ("red", "blue", …), an emoji ("🌸"), or empty (""/"."/null →
 * transparent). Rows may be ragged; the renderer pads to the widest. Driven by
 * the same __VIZ__ stdout channel as plots. Two modes:
 *
 * - Simple: `resultFn` returns the grid directly.
 * - Progressive (`stages`): the engine runs every stage's function each Run and
 *   reports each one's live grid + status. By default the canvas shows the
 *   furthest stage in the leading run of correct steps (so the panel tracks how
 *   far the student has correctly gotten), but the student can pin an earlier
 *   stage via the chip row to experiment with it. In this mode the engine
 *   returns `{ stages: [{fn, label, caption, grid, status}], auto, matchCount,
 *   todo }`; PixelCanvas owns the stage-selection UI.
 */
export interface DrawVizConfig {
  type: "draw";
  /** Simple mode: the function (in the student's code or `setup`) returning the grid. */
  resultFn?: string;
  /** Simple-mode args for resultFn. */
  demoArgs?: unknown[];
  /** Progressive mode: ordered steps, first → last. */
  stages?: DrawStage[];
  /** Progressive-mode caption shown when no step is correct yet. */
  todo?: string;
  /** Optional Python prelude appended after the student's code (grid helpers/palette). */
  setup?: string;
  title?: string;
}

export type VizConfig = CrisprVizConfig | PlotVizConfig | DrawVizConfig;

/**
 * A "reflection" lesson: no Python, no tests. The student answers one open
 * question in their own words and the AI coach assesses whether they truly
 * understand the core idea (formative, not deterministic). Signalled purely by
 * the presence of a `reflection.json` file in the lesson directory — when set,
 * the lesson UI swaps the code editor for a prose answer box.
 *
 * `question` and `guidance` are shown to the student (and run through the
 * {{FIRST_NAME}} personalizer). `lookFor` and `exemplar` are grader-only: they
 * give the AI the key ideas a good answer should touch and an optional model
 * answer, and are never shown to the student.
 */
export interface ReflectionConfig {
  /** The open question the student re-explains in their own words. */
  question: string;
  /** Optional hint shown next to the answer box. */
  guidance?: string;
  /** Key ideas a strong answer should convey (grader context only). */
  lookFor: string[];
  /** Optional model answer, used only as grader context. */
  exemplar?: string;
}

/**
 * Live game-preview config for a "javascript" lesson. The student's code is run
 * on the main thread (canvas needs it) by components/GamePreview.tsx, which drives
 * a requestAnimationFrame loop: each frame it calls the student's `update` then
 * `render`. All fields are optional so a lesson can show a static scene (render
 * only), a moving scene (update + render), or nothing (grading-only lesson).
 */
export interface JsPreviewConfig {
  /** Canvas size in CSS pixels (defaults 480×360). */
  width?: number;
  height?: number;
  /** Target frames per second (default 60). */
  fps?: number;
  /** Optional JS prelude appended AFTER the student's code (helpers / constants). */
  setup?: string;
  /** Name of a `() -> state` fn returning the initial game state. */
  init?: string;
  /** Args passed to the init fn. */
  initArgs?: unknown[];
  /** Name of an `(state, input) -> state` fn called each frame (omit → static). */
  update?: string;
  /** Name of a `(ctx, state) -> void` fn that draws each frame. */
  render?: string;
  /** Keyboard keys to expose in `input.keys` (e.g. ["ArrowLeft","ArrowRight"," "]). */
  keys?: string[];
  /** When true, render once and don't run the loop (a still picture). */
  still?: boolean;
  /** Caption shown under the canvas. */
  caption?: string;
}

/**
 * A "javascript" lesson. Signalled purely by a `js.json` file in the lesson dir
 * (like `latex.json` / `reflection.json`). Grading reuses tests.json (run in the
 * JS sandbox, public/js-worker.js); `preview` drives the live game canvas.
 */
export interface JsLessonConfig {
  preview?: JsPreviewConfig;
}

export interface LessonContent extends WeekContent {
  starterCode?: string;
  vizConfig?: VizConfig;
  reflectionConfig?: ReflectionConfig;
  /** Present only for "latex" lessons — see lib/latex/check.mjs. */
  latexConfig?: LatexLessonConfig;
  /** Present only for "javascript" lessons. */
  jsConfig?: JsLessonConfig;
}
