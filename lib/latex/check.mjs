// Document parser + tiered checker for "latex" lessons.
//
// A latex lesson's working file is one small math document (starter.tex). The
// student writes LaTeX; exercises are regions delimited by `%% exercise-id`
// marker lines (a legal LaTeX comment, so the doc stays valid TeX). The lesson's
// latex.json lists the exercises and what to verify in each region.
//
// Three check tiers per exercise, friendliest failure first:
//   1. compiles  — KaTeX parses every math block (the "compiler")
//   2. commands  — required tokens present, shortcut tokens absent
//   3. the math  — every `=`-separated segment of the equation chain must
//                  AGREE NUMERICALLY at sampled variable values; indefinite
//                  integrals are verified by differentiating the other
//                  segments back to the integrand (the FTC, literally).
//
// Shared verbatim by the browser (CourseShell/LatexPreview) and the authoring
// validator (scripts/validate-class.mjs), so reference.tex is proven against
// the exact grader students face. Results use the same shape as Python test
// results, so TestResults, /api/submit completion gating, and the AI-review
// payload all work unchanged.

import katex from "katex";
import {
  tokenize,
  splitChainTopLevel,
  parse,
  evaluate,
  freeVars,
  asIndefiniteIntegral,
  derivativeAt,
  approxEqual,
  C,
} from "./evaluate.mjs";

const DEFAULT_TOL = 1e-3; // numeric structures (Simpson, limits) are ~1e-5 accurate
const MAIN_VAR_SAMPLES = [0.4, 1.3, 2.7]; // positive, dodges /0, ln(≤0), √(<0)
const OTHER_VAR_SAMPLE = 0.6180339887; // any fixed, "unguessable" constant

// ---------------------------------------------------------------------------
// Document parsing (also used by LatexPreview to render the live page)
// ---------------------------------------------------------------------------

/**
 * Parse a lesson .tex document into renderable blocks + per-exercise regions.
 *
 * Returns { blocks, regions }:
 *   blocks  — ordered render list:
 *     { kind:"marker", id }                       — `%% exercise-id` line
 *     { kind:"section"|"subsection", text }       — \section{...} headings
 *     { kind:"math", latex }                      — $$ ... $$ display block
 *     { kind:"text", text }                       — paragraph (may hold $inline$)
 *   regions — { [exerciseId]: { source, mathBlocks: string[] } }
 *     source holds the region's comment-stripped text (for token checks);
 *     mathBlocks holds each display block's LaTeX in order.
 */
export function parseDoc(source) {
  const blocks = [];
  const regions = {};
  let currentId = null;
  let paragraph = [];
  let mathBuffer = null; // non-null while inside a $$ ... $$ block

  const flushParagraph = () => {
    const text = paragraph.join(" ").trim();
    paragraph = [];
    if (text) {
      blocks.push({ kind: "text", text });
      if (currentId) regions[currentId].source += text + "\n";
    }
  };

  const pushMath = (latex) => {
    const trimmed = latex.trim();
    blocks.push({ kind: "math", latex: trimmed });
    if (currentId) {
      regions[currentId].source += `$$${trimmed}$$\n`;
      regions[currentId].mathBlocks.push(trimmed);
    }
  };

  for (const rawLine of source.split("\n")) {
    // Exercise marker: `%% id` (must start the line).
    const marker = rawLine.match(/^\s*%%\s*(\S+)/);
    if (marker && mathBuffer === null) {
      flushParagraph();
      currentId = marker[1];
      if (!regions[currentId]) regions[currentId] = { source: "", mathBlocks: [] };
      blocks.push({ kind: "marker", id: currentId });
      continue;
    }

    // Strip a trailing LaTeX comment (unescaped %), inside or outside math.
    let line = rawLine;
    const cut = line.search(/(?<!\\)%/);
    if (cut !== -1) line = line.slice(0, cut);

    // Walk the line for $$ toggles so display math can span lines.
    let rest = line;
    while (rest.length > 0) {
      const idx = rest.indexOf("$$");
      if (idx === -1) {
        if (mathBuffer !== null) mathBuffer.push(rest);
        else if (rest.trim()) paragraph.push(rest.trim());
        break;
      }
      const before = rest.slice(0, idx);
      if (mathBuffer !== null) {
        mathBuffer.push(before);
        pushMath(mathBuffer.join("\n"));
        mathBuffer = null;
      } else {
        if (before.trim()) paragraph.push(before.trim());
        flushParagraph();
        mathBuffer = [];
      }
      rest = rest.slice(idx + 2);
    }

    if (mathBuffer === null && rest.length === 0 && line.trim() === "") {
      flushParagraph();
      continue;
    }

    // Headings (only outside math, on their own line).
    if (mathBuffer === null) {
      const last = paragraph[paragraph.length - 1] ?? "";
      const heading = last.match(/^\\(section|subsection)\{(.*)\}$/);
      if (heading) {
        paragraph.pop();
        flushParagraph();
        blocks.push({ kind: heading[1], text: heading[2] });
      }
    }
  }
  if (mathBuffer !== null) pushMath(mathBuffer.join("\n")); // unclosed $$ — render what's there
  flushParagraph();

  return { blocks, regions };
}

// ---------------------------------------------------------------------------
// Checking
// ---------------------------------------------------------------------------

/** KaTeX compile (throws with a cleaned-up message on bad LaTeX). */
function katexCompile(latex) {
  katex.renderToString(latex, { displayMode: true, throwOnError: true });
}

const cleanKatexMessage = (msg) =>
  String(msg).replace(/^KaTeX parse error:\s*/, "");

/** Build the sampled environments for a set of free variables. */
function sampleEnvs(vars, config, mainVar) {
  const samples = {};
  for (const v of vars) {
    if (config?.vars && Array.isArray(config.vars[v])) samples[v] = config.vars[v];
    else if (v === mainVar) samples[v] = MAIN_VAR_SAMPLES;
    else samples[v] = [OTHER_VAR_SAMPLE];
  }
  const count = Math.max(1, ...Object.values(samples).map((s) => s.length));
  const envs = [];
  for (let k = 0; k < count; k++) {
    const env = {};
    for (const v of vars) env[v] = C(samples[v][k % samples[v].length]);
    envs.push(env);
  }
  return envs;
}

const fmt = (z) =>
  Math.abs(z.im) > 1e-9
    ? `${z.re.toFixed(4)} + ${z.im.toFixed(4)}i`
    : `${+z.re.toFixed(4)}`;

/**
 * Run every exercise's checks against the document.
 *
 * config — the lesson's latex.json: { var?, exercises: [{ id, title,
 *   requires?, forbids?, minSegments?, expect?: { value?, valueIm?,
 *   equivalentTo?, vars?, tol? } }] }
 *
 * Returns results in the Python-test shape ({entry, name, passed, error}) so
 * the whole submit/review pipeline works unchanged, plus a per-exercise
 * status map for the live preview pills.
 */
export function checkDocument(source, config) {
  const { regions } = parseDoc(source);
  const results = [];
  const statuses = {};
  const mainVar = config.var ?? "x";

  for (const ex of config.exercises ?? []) {
    const exResults = checkExercise(ex, regions[ex.id], mainVar);
    results.push(...exResults);
    statuses[ex.id] = exResults.every((r) => r.passed)
      ? "pass"
      : exResults.some((r) => r.passed)
        ? "wip"
        : "todo";
  }
  return { results, statuses };
}

function checkExercise(ex, region, mainVar) {
  const title = ex.title ?? ex.id;
  const out = [];
  const add = (name, passed, error) =>
    out.push({ entry: ex.id, name: `${title} — ${name}`, passed, error: error ?? null });

  // 0. Written at all?
  if (!region || region.mathBlocks.length === 0) {
    add(
      "is written",
      false,
      `Nothing here yet — write your math between $$ … $$ under the "%% ${ex.id}" line.`
    );
    return out;
  }

  // 1. Compiles (every display block).
  try {
    for (const block of region.mathBlocks) katexCompile(block);
    add("LaTeX compiles", true);
  } catch (e) {
    add("LaTeX compiles", false, cleanKatexMessage(e.message));
    return out; // nothing below can be trusted on a compile error
  }

  // 2. Required / forbidden commands (checked on the region's raw source).
  if (ex.requires?.length) {
    const missing = ex.requires.filter((t) => !region.source.includes(t));
    add(
      "uses the right commands",
      missing.length === 0,
      missing.length ? `Still missing: ${missing.join("  ")}` : undefined
    );
  }
  if (ex.forbids?.length) {
    const found = ex.forbids.filter((t) => region.source.includes(t));
    add(
      "no shortcuts",
      found.length === 0,
      found.length
        ? `Don't use ${found.join(" or ")} here — typeset it the LaTeX way.`
        : undefined
    );
  }

  // 3. The math itself.
  const expect = ex.expect;
  const tol = expect?.tol ?? DEFAULT_TOL;
  let segments;
  try {
    // Consecutive $$ blocks read as one derivation: join with "=" then split
    // on every top-level "=" (this also flattens align-style line breaks).
    const chainSource = region.mathBlocks.join(" = ");
    segments = splitChainTopLevel(tokenize(chainSource)).map((toks) =>
      parse(toks, { evalVar: expect?.bracketVar ?? mainVar })
    );
  } catch (e) {
    add("the math reads", false, e.message);
    return out;
  }

  if (ex.minSegments) {
    add(
      "shows the steps",
      segments.length >= ex.minSegments,
      segments.length < ex.minSegments
        ? `Show your work — I want at least ${ex.minSegments} parts joined by = (you have ${segments.length}).`
        : undefined
    );
  }

  if (!expect) return out;

  // Split segments into indefinite integrals vs. directly evaluable ones.
  const indefinites = [];
  const evaluable = [];
  segments.forEach((ast, i) => {
    const ind = asIndefiniteIntegral(ast);
    if (ind) indefinites.push({ ...ind, index: i });
    else evaluable.push({ ast, index: i });
  });

  // Free variables across everything → sampled environments.
  const vars = new Set();
  for (const { ast } of evaluable) freeVars(ast, new Set(), vars);
  for (const { body, v } of indefinites) freeVars(body, new Set([v]), vars);
  let refAst = null;
  if (expect.equivalentTo) {
    refAst = parse(tokenize(expect.equivalentTo), {
      evalVar: expect.bracketVar ?? mainVar,
    });
    freeVars(refAst, new Set(), vars);
  }
  const envs = sampleEnvs(vars, expect, indefinites[0]?.v ?? mainVar);

  try {
    // 3a. Chain consistency: consecutive evaluable segments agree everywhere.
    for (let k = 1; k < evaluable.length; k++) {
      const a = evaluable[k - 1];
      const b = evaluable[k];
      for (const env of envs) {
        const va = evaluate(a.ast, env);
        const vb = evaluate(b.ast, env);
        if (!approxEqual(va, vb, tol)) {
          const at = vars.size
            ? ` (at ${[...vars].map((v) => `${v}=${fmt(env[v])}`).join(", ")})`
            : "";
          add(
            "the math is true",
            false,
            `Parts ${a.index + 1} and ${b.index + 1} of your chain aren't equal${at}: I get ${fmt(va)} vs ${fmt(vb)}.`
          );
          return out;
        }
      }
    }

    // 3b. Indefinite integrals: differentiate every other segment back to the
    // integrand — the Fundamental Theorem of Calculus as a grader.
    for (const ind of indefinites) {
      for (const seg of evaluable) {
        for (const env of envs) {
          const x0 = (env[ind.v] ?? C(MAIN_VAR_SAMPLES[0])).re;
          const dF = derivativeAt(seg.ast, ind.v, x0, env);
          const f = evaluate(ind.body, { ...env, [ind.v]: C(x0) });
          const scaled = { re: ind.sign * f.re, im: ind.sign * f.im };
          if (!approxEqual(dF, scaled, Math.max(tol, 1e-3))) {
            add(
              "the math is true",
              false,
              `If part ${seg.index + 1} really were this integral, its derivative would be the integrand — but at ${ind.v}=${fmt(env[ind.v] ?? C(x0))} I get ${fmt(dF)} instead of ${fmt(scaled)}.`
            );
            return out;
          }
        }
      }
      if (evaluable.length === 0) {
        add(
          "the math is true",
          false,
          "You wrote the integral — now finish the equation with what it equals."
        );
        return out;
      }
    }

    // 3c. Final answer matches the expected value / reference expression.
    const last = evaluable[evaluable.length - 1];
    if (last && expect.value !== undefined) {
      const want = C(expect.value, expect.valueIm ?? 0);
      for (const env of envs) {
        const got = evaluate(last.ast, env);
        if (!approxEqual(got, want, tol)) {
          add(
            "the math is true",
            false,
            `Your final answer comes out to ${fmt(got)}, but it should be ${fmt(want)}. Check your steps!`
          );
          return out;
        }
      }
    }
    if (last && refAst) {
      for (const env of envs) {
        const got = evaluate(last.ast, env);
        const want = evaluate(refAst, env);
        if (!approxEqual(got, want, tol)) {
          const at = vars.size
            ? ` at ${[...vars].map((v) => `${v}=${fmt(env[v])}`).join(", ")}`
            : "";
          add(
            "the math is true",
            false,
            `Your final expression gives ${fmt(got)}${at}, but the right answer gives ${fmt(want)}. So close — check it again!`
          );
          return out;
        }
      }
    }

    add("the math is true", true);
  } catch (e) {
    add(
      "the math is true",
      false,
      e.kind === "indefinite"
        ? "I can't compute a bare \\int without bounds — pair it with an antiderivative I can differentiate."
        : e.message
    );
  }
  return out;
}
