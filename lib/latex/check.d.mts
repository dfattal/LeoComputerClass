// Type declarations for lib/latex/check.mjs (plain .mjs so the node-side
// validate-class script can import the SAME grader the browser uses).

/** Same shape as a Python TestResult, so the whole submit pipeline reuses it. */
export interface LatexCheckResult {
  entry: string;
  name: string;
  passed: boolean;
  error: string | null;
}

export interface LatexExpect {
  /** Expected numeric value of the final chain segment (real part). */
  value?: number;
  /** Imaginary part of the expected value (for Euler-formula lessons). */
  valueIm?: number;
  /** Reference LaTeX expression the final segment must equal at sampled vars. */
  equivalentTo?: string;
  /** Sample values per free variable (defaults chosen if omitted). */
  vars?: Record<string, number[]>;
  /** Numeric tolerance (default 1e-3). */
  tol?: number;
  /** Variable substituted in evaluation brackets [F]_a^b (default lesson var). */
  bracketVar?: string;
}

export interface LatexExercise {
  /** Matches the `%% id` marker line in the document. */
  id: string;
  title?: string;
  /** Short instruction shown with the exercise status. */
  prompt?: string;
  /** Tokens that must appear in the region (e.g. "\\frac"). */
  requires?: string[];
  /** Tokens that must NOT appear (e.g. "2/3" shortcuts). */
  forbids?: string[];
  /** Minimum number of `=`-joined chain segments (forces showing work). */
  minSegments?: number;
  expect?: LatexExpect;
}

/** The lesson's latex.json. */
export interface LatexLessonConfig {
  title?: string;
  /** Main variable for sampling + evaluation brackets (default "x"). */
  var?: string;
  exercises: LatexExercise[];
}

export type LatexBlock =
  | { kind: "marker"; id: string }
  | { kind: "section"; text: string }
  | { kind: "subsection"; text: string }
  | { kind: "math"; latex: string }
  | { kind: "text"; text: string };

export function parseDoc(source: string): {
  blocks: LatexBlock[];
  regions: Record<string, { source: string; mathBlocks: string[] }>;
};

export function checkDocument(
  source: string,
  config: LatexLessonConfig
): {
  results: LatexCheckResult[];
  statuses: Record<string, "pass" | "wip" | "todo">;
};
