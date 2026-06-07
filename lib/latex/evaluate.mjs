// Numeric evaluator for the LaTeX-math subset taught in the typesetting class.
//
// This is what lets the platform check that a student's LaTeX is not just
// syntactically valid but MATHEMATICALLY TRUE: we parse each `=`-separated
// segment of their equation chain into a small AST and evaluate it numerically
// (over complex numbers, so Euler-formula lessons work) at sampled variable
// values. Calculus structures are evaluated by their numeric meaning:
//
//   \int_a^b f \,dx        → composite-Simpson quadrature
//   \int f \,dx            → "indefinite" marker — the checker verifies other
//                            chain segments by DIFFERENTIATING them back to f
//                            (the Fundamental Theorem of Calculus, literally)
//   \left[ F \right]_a^b   → F(b) − F(a)
//   \sum_{n=a}^{b|\infty}  → partial sum until terms vanish
//   \lim_{h \to c}         → two-sided numeric limit at c ± 1e-6
//   \frac{d}{dx} f         → central difference
//
// Shared by the in-browser checker (lib/latex/check.mjs) AND the authoring-time
// validator (scripts/validate-class.mjs), so the grader can't drift from what
// `npm run validate-class` proves about reference.tex. Plain .mjs (not .ts) so
// the node script can import it directly; types live in lib/latex/latex.d.ts.

// ---------------------------------------------------------------------------
// Complex arithmetic (tiny — just what the evaluator needs)
// ---------------------------------------------------------------------------

export const C = (re, im = 0) => ({ re, im });

const cAdd = (a, b) => C(a.re + b.re, a.im + b.im);
const cSub = (a, b) => C(a.re - b.re, a.im - b.im);
const cMul = (a, b) => C(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
const cDiv = (a, b) => {
  const d = b.re * b.re + b.im * b.im;
  return C((a.re * b.re + a.im * b.im) / d, (a.im * b.re - a.re * b.im) / d);
};
const cNeg = (a) => C(-a.re, -a.im);
export const cAbs = (a) => Math.hypot(a.re, a.im);
const cExp = (a) => {
  const r = Math.exp(a.re);
  return C(r * Math.cos(a.im), r * Math.sin(a.im));
};
// Normalize -0 → +0 in the imaginary part so ln(-1) = +iπ (principal branch):
// negation/multiplication can produce a -0 imaginary part, and atan2(-0, -1)
// would land on the WRONG side of the branch cut (−π instead of π).
const cLn = (a) =>
  C(Math.log(cAbs(a)), Math.atan2(a.im === 0 ? 0 : a.im, a.re));
const cSin = (a) =>
  C(Math.sin(a.re) * Math.cosh(a.im), Math.cos(a.re) * Math.sinh(a.im));
const cCos = (a) =>
  C(Math.cos(a.re) * Math.cosh(a.im), -Math.sin(a.re) * Math.sinh(a.im));
const cTan = (a) => cDiv(cSin(a), cCos(a));
const cSinh = (a) =>
  C(Math.sinh(a.re) * Math.cos(a.im), Math.cosh(a.re) * Math.sin(a.im));
const cCosh = (a) =>
  C(Math.cosh(a.re) * Math.cos(a.im), Math.sinh(a.re) * Math.sin(a.im));
const cTanh = (a) => cDiv(cSinh(a), cCosh(a));
const isRealInt = (a, eps = 1e-9) =>
  Math.abs(a.im) < eps && Math.abs(a.re - Math.round(a.re)) < eps;

function cPow(a, b) {
  // Integer exponents by repeated multiplication: exact for negative bases
  // (complex exp/ln would be fine too, but this keeps (-2)^3 crisp).
  if (isRealInt(b) && Math.abs(b.re) <= 64) {
    let n = Math.round(b.re);
    const inv = n < 0;
    n = Math.abs(n);
    let r = C(1);
    for (let k = 0; k < n; k++) r = cMul(r, a);
    return inv ? cDiv(C(1), r) : r;
  }
  if (a.re === 0 && a.im === 0) return C(0);
  return cExp(cMul(b, cLn(a)));
}

function realFactorial(n) {
  let r = 1;
  for (let k = 2; k <= n; k++) r *= k;
  return r;
}

/** |a - b| within tol, scaled by magnitude (complex-aware). */
export function approxEqual(a, b, tol = 1e-4) {
  if (!isFinite(a.re) || !isFinite(a.im) || !isFinite(b.re) || !isFinite(b.im))
    return false;
  const scale = Math.max(1, cAbs(a), cAbs(b));
  return cAbs(cSub(a, b)) <= tol * scale;
}

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export class LatexMathError extends Error {
  constructor(message, kind = "math") {
    super(message);
    this.name = "LatexMathError";
    this.kind = kind; // "parse" | "math" | "indefinite"
  }
}

const parseErr = (msg) => new LatexMathError(msg, "parse");

// ---------------------------------------------------------------------------
// Tokenizer
// ---------------------------------------------------------------------------

// Commands that are pure spacing/layout — invisible to the math.
const SKIP_CMDS = new Set([
  "\\,", "\\;", "\\:", "\\!", "\\ ", "\\quad", "\\qquad",
  "\\displaystyle", "\\textstyle", "\\limits", "\\nolimits", "\\big",
  "\\Big", "\\bigg", "\\Bigg", "\\bigl", "\\bigr", "\\Bigl", "\\Bigr",
]);

/**
 * Turn a LaTeX math string into tokens:
 *   {type:"num", value:"2.5"} {type:"letter", value:"x"}
 *   {type:"cmd", value:"\\frac"} {type:"sym", value:"^"}
 * `\left`/`\right` vanish (their delimiter survives as a plain sym);
 * alignment marks (& and \\) vanish so `align` chains tokenize like one chain.
 */
export function tokenize(latex) {
  const tokens = [];
  let i = 0;
  const s = latex;
  while (i < s.length) {
    const ch = s[i];
    if (/\s/.test(ch)) { i++; continue; }
    if (ch === "&") { i++; continue; }
    if (ch === "\\") {
      // "\\\\" row break (align) — invisible, like &.
      if (s[i + 1] === "\\") { i += 2; continue; }
      // One-character commands like "\," or "\{"
      if (/[^a-zA-Z]/.test(s[i + 1] ?? "")) {
        const cmd = s.slice(i, i + 2);
        i += 2;
        if (SKIP_CMDS.has(cmd)) continue;
        if (cmd === "\\{") { tokens.push({ type: "sym", value: "(" }); continue; }
        if (cmd === "\\}") { tokens.push({ type: "sym", value: ")" }); continue; }
        if (cmd === "\\|") { tokens.push({ type: "sym", value: "|" }); continue; }
        continue; // other 1-char commands: spacing-like, skip
      }
      let j = i + 1;
      while (j < s.length && /[a-zA-Z]/.test(s[j])) j++;
      const cmd = s.slice(i, j);
      i = j;
      if (SKIP_CMDS.has(cmd)) continue;
      if (cmd === "\\left" || cmd === "\\right") {
        // Keep the delimiter itself; "\left." / "\right." are invisible.
        while (i < s.length && /\s/.test(s[i])) i++;
        const d = s[i];
        if (d === "\\") {
          // \left\{  \left\|  etc — loop re-handles it as a 1-char command.
          continue;
        }
        i++;
        if (d === ".") continue;
        tokens.push({ type: "sym", value: d });
        continue;
      }
      if (cmd === "\\begin" || cmd === "\\end") {
        // \begin{align*} / \end{align*} etc — pure layout; the env name group
        // vanishes. Combined with & and \\ being invisible, a multi-line align
        // derivation tokenizes as one plain equation chain.
        while (i < s.length && /\s/.test(s[i])) i++;
        if (s[i] === "{") {
          let depth = 0, k = i;
          for (; k < s.length; k++) {
            if (s[k] === "{") depth++;
            else if (s[k] === "}") { depth--; if (depth === 0) break; }
          }
          i = k + 1;
        }
        continue;
      }
      if (cmd === "\\text" || cmd === "\\mathrm" || cmd === "\\operatorname") {
        // Read the {...} group raw. A single letter (e.g. \mathrm{d}) survives
        // as that letter; anything else is decoration and vanishes.
        while (i < s.length && /\s/.test(s[i])) i++;
        if (s[i] === "{") {
          let depth = 0, k = i;
          for (; k < s.length; k++) {
            if (s[k] === "{") depth++;
            else if (s[k] === "}") { depth--; if (depth === 0) break; }
          }
          const inner = s.slice(i + 1, k).trim();
          i = k + 1;
          if (/^[a-zA-Z]$/.test(inner)) tokens.push({ type: "letter", value: inner });
        }
        continue;
      }
      tokens.push({ type: "cmd", value: cmd });
      continue;
    }
    if (/[0-9]/.test(ch)) {
      let j = i;
      while (j < s.length && /[0-9]/.test(s[j])) j++;
      if (s[j] === "." && /[0-9]/.test(s[j + 1] ?? "")) {
        j++;
        while (j < s.length && /[0-9]/.test(s[j])) j++;
      }
      tokens.push({ type: "num", value: s.slice(i, j) });
      i = j;
      continue;
    }
    if (/[a-zA-Z]/.test(ch)) {
      tokens.push({ type: "letter", value: ch });
      i++;
      continue;
    }
    if ("^_{}()[]+-*/=!|,<>.'".includes(ch)) {
      tokens.push({ type: "sym", value: ch });
      i++;
      continue;
    }
    throw parseErr(`I don't understand the character "${ch}" here.`);
  }
  return tokens;
}

/** Split a token list on top-level "=" (outside any braces/brackets/parens). */
export function splitChainTopLevel(tokens) {
  const segments = [];
  let depth = 0;
  let current = [];
  for (const t of tokens) {
    if (t.type === "sym" && "{([".includes(t.value)) depth++;
    if (t.type === "sym" && "})]".includes(t.value)) depth--;
    if (t.type === "sym" && t.value === "=" && depth === 0) {
      segments.push(current);
      current = [];
      continue;
    }
    current.push(t);
  }
  segments.push(current);
  return segments.filter((seg) => seg.length > 0);
}

// ---------------------------------------------------------------------------
// Parser  (tokens → AST)
// ---------------------------------------------------------------------------

const FUNCTIONS = {
  "\\sin": cSin, "\\cos": cCos, "\\tan": cTan,
  "\\sinh": cSinh, "\\cosh": cCosh, "\\tanh": cTanh,
  "\\exp": cExp, "\\ln": cLn,
  "\\arcsin": (a) => realOnly(a, Math.asin, "\\arcsin"),
  "\\arccos": (a) => realOnly(a, Math.acos, "\\arccos"),
  "\\arctan": (a) => realOnly(a, Math.atan, "\\arctan"),
};

function realOnly(a, fn, name) {
  if (Math.abs(a.im) > 1e-12)
    throw new LatexMathError(`${name} of a complex number isn't supported here.`);
  return C(fn(a.re));
}

/**
 * Parse one chain segment into an AST.
 * opts.evalVar — the variable substituted in evaluation brackets [F]_a^b
 * (defaults to "x").
 */
export function parse(tokens, opts = {}) {
  const ctx = {
    toks: tokens,
    pos: 0,
    evalVar: opts.evalVar ?? "x",
    // Stack of in-flight \int parses; each records its differential when found.
    ints: [],
    // Grouping depth — an \int's body only stops at the depth the \int lives at
    // (so a dx INSIDE \frac{dx}{x+1} ends the integrand without truncating the
    // denominator's own parse).
    depth: 0,
  };
  const ast = parseExpression(ctx);
  if (ctx.pos < ctx.toks.length) {
    const t = ctx.toks[ctx.pos];
    throw parseErr(
      `I got stuck at "${t.value}" — check your braces and symbols around it.`
    );
  }
  return ast;
}

const peek = (ctx, k = 0) => ctx.toks[ctx.pos + k];
const next = (ctx) => ctx.toks[ctx.pos++];
const atSym = (ctx, v) => {
  const t = peek(ctx);
  return t && t.type === "sym" && t.value === v;
};
const eatSym = (ctx, v) => {
  if (!atSym(ctx, v)) {
    const t = peek(ctx);
    throw parseErr(
      `I expected "${v}" here${t ? ` but found "${t.value}"` : ""}.`
    );
  }
  ctx.pos++;
};

const startsFactor = (t) => {
  if (!t) return false;
  if (t.type === "num" || t.type === "letter") return true;
  if (t.type === "cmd") return true;
  if (t.type === "sym") return "({[|".includes(t.value);
  return false;
};

/** True when the innermost in-flight \int (at this depth) found its dx. */
const intBodyDone = (ctx) => {
  const top = ctx.ints[ctx.ints.length - 1];
  return !!(top && top.varName && ctx.depth === top.depth);
};

function parseExpression(ctx) {
  let node = parseTerm(ctx);
  for (;;) {
    // An \int's body stops once its differential has been consumed.
    if (intBodyDone(ctx)) break;
    if (atSym(ctx, "+")) { ctx.pos++; node = { type: "add", a: node, b: parseTerm(ctx) }; }
    else if (atSym(ctx, "-")) { ctx.pos++; node = { type: "sub", a: node, b: parseTerm(ctx) }; }
    else break;
  }
  return node;
}

function parseTerm(ctx) {
  let node = parseFactor(ctx);
  for (;;) {
    if (intBodyDone(ctx)) break; // differential consumed → integrand complete
    const t = peek(ctx);
    if (!t) break;
    if (t.type === "cmd" && (t.value === "\\cdot" || t.value === "\\times")) {
      ctx.pos++;
      node = { type: "mul", a: node, b: parseFactor(ctx) };
    } else if (t.type === "cmd" && t.value === "\\div") {
      ctx.pos++;
      node = { type: "div", a: node, b: parseFactor(ctx) };
    } else if (t.type === "sym" && (t.value === "*" || t.value === "/")) {
      ctx.pos++;
      node = { type: t.value === "*" ? "mul" : "div", a: node, b: parseFactor(ctx) };
    } else if (startsFactor(t)) {
      node = { type: "mul", a: node, b: parseFactor(ctx) }; // implicit ·
    } else break;
  }
  return node;
}

function parseFactor(ctx) {
  if (atSym(ctx, "-")) { ctx.pos++; return { type: "neg", a: parseFactor(ctx) }; }
  if (atSym(ctx, "+")) { ctx.pos++; return parseFactor(ctx); }
  return parsePostfix(ctx);
}

function parsePostfix(ctx) {
  let node = parseAtom(ctx);
  for (;;) {
    if (atSym(ctx, "^")) {
      ctx.pos++;
      node = { type: "pow", a: node, b: parseScript(ctx) };
    } else if (atSym(ctx, "!")) {
      ctx.pos++;
      node = { type: "factorial", a: node };
    } else break;
  }
  return node;
}

/** A `^`/`_` argument: a {group}, or exactly ONE token (true LaTeX: x^23 = x²·3). */
function parseScript(ctx) {
  if (atSym(ctx, "{")) return parseGroup(ctx);
  const t = next(ctx);
  if (!t) throw parseErr("Something is missing after ^ or _.");
  if (t.type === "num") {
    // One token, one character: push the rest of a multi-digit number back.
    if (t.value.length > 1) {
      ctx.toks.splice(ctx.pos, 0, { type: "num", value: t.value.slice(1) });
      return { type: "num", value: parseFloat(t.value[0]) };
    }
    return { type: "num", value: parseFloat(t.value) };
  }
  if (t.type === "letter") return varNode(ctx, t.value, false);
  if (t.type === "cmd") { ctx.pos--; return parseAtom(ctx); }
  if (t.type === "sym" && t.value === "-") {
    // ^-1 without braces (lenient — KaTeX allows it).
    return { type: "neg", a: parseScript(ctx) };
  }
  throw parseErr(`I can't use "${t.value}" as an exponent — wrap it in braces { }.`);
}

function parseGroup(ctx) {
  eatSym(ctx, "{");
  ctx.depth++;
  const node = parseExpression(ctx);
  ctx.depth--;
  eatSym(ctx, "}");
  return node;
}

function varNode(ctx, name, allowSubscript = true) {
  // x_0 / x_{max} → one named variable "x_0" / "x_max".
  if (allowSubscript && atSym(ctx, "_")) {
    ctx.pos++;
    let sub;
    if (atSym(ctx, "{")) {
      // Read the raw group as a name (digits/letters only).
      let depth = 0, parts = [];
      eatSym(ctx, "{");
      while (!(atSym(ctx, "}") && depth === 0)) {
        const t = next(ctx);
        if (!t) throw parseErr("A { is missing its closing }.");
        if (t.type === "sym" && t.value === "{") depth++;
        if (t.type === "sym" && t.value === "}") depth--;
        parts.push(t.value);
      }
      eatSym(ctx, "}");
      sub = parts.join("");
    } else {
      const t = next(ctx);
      if (!t) throw parseErr("Something is missing after _.");
      sub = t.type === "num" ? t.value[0] : t.value;
      if (t.type === "num" && t.value.length > 1)
        ctx.toks.splice(ctx.pos, 0, { type: "num", value: t.value.slice(1) });
    }
    return { type: "var", name: `${name}_${sub}` };
  }
  return { type: "var", name };
}

/** Parse `_a^b` / `^b_a` bounds (each a group or single token). Returns {lo, hi}. */
function parseBounds(ctx) {
  let lo = null, hi = null;
  for (let k = 0; k < 2; k++) {
    if (atSym(ctx, "_")) { ctx.pos++; lo = parseScript(ctx); }
    else if (atSym(ctx, "^")) { ctx.pos++; hi = parseScript(ctx); }
  }
  return { lo, hi };
}

function parseAtom(ctx) {
  const t = peek(ctx);
  if (!t) throw parseErr("The expression ends too early — something is missing.");

  if (t.type === "num") { ctx.pos++; return { type: "num", value: parseFloat(t.value) }; }

  if (t.type === "letter") {
    // Differential marker: inside an \int, "d" + letter is the dx, not d·x.
    const top = ctx.ints[ctx.ints.length - 1];
    if (top && !top.varName && t.value === "d") {
      const after = peek(ctx, 1);
      if (after && after.type === "letter") {
        ctx.pos += 2;
        top.varName = after.value;
        return { type: "num", value: 1 };
      }
    }
    ctx.pos++;
    return varNode(ctx, t.value);
  }

  if (t.type === "sym") {
    if (t.value === "(") {
      ctx.pos++;
      ctx.depth++;
      const node = parseExpression(ctx);
      ctx.depth--;
      eatSym(ctx, ")");
      return node;
    }
    if (t.value === "{") return parseGroup(ctx);
    if (t.value === "[") {
      ctx.pos++;
      ctx.depth++;
      const body = parseExpression(ctx);
      ctx.depth--;
      eatSym(ctx, "]");
      // Evaluation bracket [F]_a^b — substitute evalVar at the bounds.
      if (atSym(ctx, "_") || atSym(ctx, "^")) {
        const { lo, hi } = parseBounds(ctx);
        if (lo == null || hi == null)
          throw parseErr("An evaluation bracket needs BOTH bounds, like [F]_0^1.");
        return { type: "evalbracket", v: ctx.evalVar, body, lo, hi };
      }
      return body;
    }
    if (t.value === "|") {
      ctx.pos++;
      ctx.depth++;
      const body = parseExpression(ctx);
      ctx.depth--;
      eatSym(ctx, "|");
      return { type: "abs", a: body };
    }
  }

  if (t.type === "cmd") {
    const cmd = t.value;
    ctx.pos++;

    if (cmd === "\\pi") return { type: "const", name: "pi" };
    if (cmd === "\\infty") return { type: "const", name: "infty" };

    if (cmd === "\\frac" || cmd === "\\dfrac" || cmd === "\\tfrac") {
      // d/dx operator written as a fraction?
      const save = ctx.pos;
      const numToks = peekGroupTokens(ctx);
      if (numToks && numToks.length === 1 && numToks[0].type === "letter" && numToks[0].value === "d") {
        skipGroup(ctx);
        const denToks = peekGroupTokens(ctx);
        if (
          denToks && denToks.length === 2 &&
          denToks[0].type === "letter" && denToks[0].value === "d" &&
          denToks[1].type === "letter"
        ) {
          skipGroup(ctx);
          return { type: "deriv", v: denToks[1].value, body: parseTerm(ctx) };
        }
        ctx.pos = save; // numerator was d but not d/dvar — plain fraction
      }
      const a = parseGroup(ctx);
      const b = parseGroup(ctx);
      return { type: "div", a, b };
    }

    if (cmd === "\\sqrt") {
      let n = null;
      if (atSym(ctx, "[")) {
        ctx.pos++;
        n = parseExpression(ctx);
        eatSym(ctx, "]");
      }
      const a = atSym(ctx, "{") ? parseGroup(ctx) : parseFactor(ctx);
      return { type: "pow", a, b: n ? { type: "div", a: { type: "num", value: 1 }, b: n } : { type: "num", value: 0.5 } };
    }

    if (cmd === "\\binom") {
      const n = parseGroup(ctx);
      const k = parseGroup(ctx);
      return { type: "binom", n, k };
    }

    if (cmd === "\\log") {
      let base = { type: "num", value: 10 };
      if (atSym(ctx, "_")) { ctx.pos++; base = parseScript(ctx); }
      const arg = parseFnArg(ctx);
      return { type: "div", a: { type: "call", fn: "\\ln", arg }, b: { type: "call", fn: "\\ln", arg: base } };
    }

    if (FUNCTIONS[cmd]) {
      // \sin^2 x — the power applies to the function's value.
      let power = null;
      if (atSym(ctx, "^")) { ctx.pos++; power = parseScript(ctx); }
      const arg = parseFnArg(ctx);
      const call = { type: "call", fn: cmd, arg };
      return power ? { type: "pow", a: call, b: power } : call;
    }

    if (cmd === "\\int") {
      const { lo, hi } = parseBounds(ctx);
      ctx.ints.push({ varName: null, depth: ctx.depth });
      const body = parseExpression(ctx);
      const rec = ctx.ints.pop();
      if (!rec.varName)
        throw parseErr(
          "Your integral has no differential — every \\int needs a dx (or dt, du…) to say what it integrates over."
        );
      if ((lo == null) !== (hi == null))
        throw parseErr("An integral needs both bounds (\\int_a^b) or neither (\\int).");
      if (lo == null) return { type: "indefint", v: rec.varName, body };
      return { type: "defint", v: rec.varName, lo, hi, body };
    }

    if (cmd === "\\sum") {
      // \sum_{n=a}^{b or \infty} <term>
      if (!atSym(ctx, "_"))
        throw parseErr("A sum needs its range underneath, like \\sum_{n=0}^{10}.");
      ctx.pos++;
      eatSym(ctx, "{");
      const vTok = next(ctx);
      if (!vTok || vTok.type !== "letter")
        throw parseErr("A sum's range starts with its counter, like \\sum_{n=0}.");
      eatSym(ctx, "=");
      const from = parseExpression(ctx);
      eatSym(ctx, "}");
      if (!atSym(ctx, "^"))
        throw parseErr("A sum needs a top bound too, like \\sum_{n=0}^{10} (use \\infty for forever).");
      ctx.pos++;
      const to = parseScript(ctx);
      const body = parseTerm(ctx);
      return { type: "sum", v: vTok.value, from, to, body };
    }

    if (cmd === "\\lim") {
      // \lim_{h \to c} <term>
      if (!atSym(ctx, "_"))
        throw parseErr("A limit needs its approach underneath, like \\lim_{h \\to 0}.");
      ctx.pos++;
      eatSym(ctx, "{");
      const vTok = next(ctx);
      if (!vTok || vTok.type !== "letter")
        throw parseErr("A limit's subscript starts with its variable, like \\lim_{h \\to 0}.");
      const arrow = next(ctx);
      if (!arrow || arrow.type !== "cmd" || arrow.value !== "\\to")
        throw parseErr("Use \\to in a limit, like \\lim_{h \\to 0}.");
      const to = parseExpression(ctx);
      eatSym(ctx, "}");
      const body = parseTerm(ctx);
      return { type: "lim", v: vTok.value, to, body };
    }

    throw parseErr(`I don't know the command ${cmd} yet.`);
  }

  throw parseErr(`I got stuck at "${t.value}".`);
}

/** A function's argument: (expr), {expr}, or one tight factor (\sin x). */
function parseFnArg(ctx) {
  if (atSym(ctx, "(")) {
    ctx.pos++;
    const node = parseExpression(ctx);
    eatSym(ctx, ")");
    return node;
  }
  if (atSym(ctx, "{")) return parseGroup(ctx);
  return parseFactor(ctx);
}

/** Look at the tokens of a {...} group without consuming it (null if no group). */
function peekGroupTokens(ctx) {
  if (!atSym(ctx, "{")) return null;
  let depth = 0;
  const out = [];
  for (let k = ctx.pos; k < ctx.toks.length; k++) {
    const t = ctx.toks[k];
    if (t.type === "sym" && t.value === "{") { depth++; if (depth === 1) continue; }
    if (t.type === "sym" && t.value === "}") { depth--; if (depth === 0) return out; }
    out.push(t);
  }
  return null;
}

function skipGroup(ctx) {
  let depth = 0;
  while (ctx.pos < ctx.toks.length) {
    const t = next(ctx);
    if (t.type === "sym" && t.value === "{") depth++;
    if (t.type === "sym" && t.value === "}") { depth--; if (depth === 0) return; }
  }
  throw parseErr("A { is missing its closing }.");
}

// ---------------------------------------------------------------------------
// Evaluation  (AST → complex number)
// ---------------------------------------------------------------------------

const SIMPSON_PANELS = 2000; // even; plenty for kid-math integrands
const LIM_H = 1e-6;
const DERIV_H = 1e-6;

/**
 * Evaluate an AST with `env` = { varName: {re, im} } bindings.
 * Unknown variables throw kind="math"; a top-level indefinite integral throws
 * kind="indefinite" (the checker handles it via differentiation instead).
 */
export function evaluate(node, env = {}) {
  switch (node.type) {
    case "num": return C(node.value);
    case "const":
      if (node.name === "pi") return C(Math.PI);
      if (node.name === "infty") return C(Infinity);
      throw new LatexMathError(`Unknown constant ${node.name}.`);
    case "var": {
      if (node.name in env) return env[node.name];
      if (node.name === "e") return C(Math.E);
      if (node.name === "i") return C(0, 1);
      throw new LatexMathError(`The variable "${node.name}" has no value here.`);
    }
    case "add": return cAdd(evaluate(node.a, env), evaluate(node.b, env));
    case "sub": return cSub(evaluate(node.a, env), evaluate(node.b, env));
    case "mul": return cMul(evaluate(node.a, env), evaluate(node.b, env));
    case "div": return cDiv(evaluate(node.a, env), evaluate(node.b, env));
    case "pow": return cPow(evaluate(node.a, env), evaluate(node.b, env));
    case "neg": return cNeg(evaluate(node.a, env));
    case "abs": return C(cAbs(evaluate(node.a, env)));
    case "factorial": {
      const a = evaluate(node.a, env);
      if (!isRealInt(a) || a.re < 0)
        throw new LatexMathError("Factorial (!) only works on whole numbers like 5!.");
      return C(realFactorial(Math.round(a.re)));
    }
    case "binom": {
      const n = evaluate(node.n, env);
      const k = evaluate(node.k, env);
      if (!isRealInt(n) || !isRealInt(k))
        throw new LatexMathError("\\binom needs whole numbers.");
      const ni = Math.round(n.re), ki = Math.round(k.re);
      if (ki < 0 || ki > ni) return C(0);
      return C(realFactorial(ni) / (realFactorial(ki) * realFactorial(ni - ki)));
    }
    case "call": return FUNCTIONS[node.fn](evaluate(node.arg, env));
    case "defint": {
      const lo = evaluate(node.lo, env);
      const hi = evaluate(node.hi, env);
      if (Math.abs(lo.im) > 1e-12 || Math.abs(hi.im) > 1e-12)
        throw new LatexMathError("Integral bounds must be real numbers.");
      return integrate(node.body, node.v, lo.re, hi.re, env);
    }
    case "indefint":
      throw new LatexMathError(
        "An integral without bounds names a whole family of functions — I check it by differentiating your answer.",
        "indefinite"
      );
    case "evalbracket": {
      const lo = evaluate(node.lo, env);
      const hi = evaluate(node.hi, env);
      const atHi = evaluate(node.body, { ...env, [node.v]: hi });
      const atLo = evaluate(node.body, { ...env, [node.v]: lo });
      return cSub(atHi, atLo);
    }
    case "sum": {
      const from = evaluate(node.from, env);
      if (!isRealInt(from))
        throw new LatexMathError("A sum must start at a whole number.");
      const start = Math.round(from.re);
      const toVal = evaluate(node.to, env);
      let acc = C(0);
      if (toVal.re === Infinity) {
        for (let n = start; n < start + 5000; n++) {
          const term = evaluate(node.body, { ...env, [node.v]: C(n) });
          acc = cAdd(acc, term);
          if (cAbs(term) < 1e-13 * Math.max(1, cAbs(acc))) break;
        }
        return acc;
      }
      if (!isRealInt(toVal))
        throw new LatexMathError("A sum must stop at a whole number (or \\infty).");
      for (let n = start; n <= Math.round(toVal.re); n++)
        acc = cAdd(acc, evaluate(node.body, { ...env, [node.v]: C(n) }));
      return acc;
    }
    case "lim": {
      const to = evaluate(node.to, env);
      if (to.re === Infinity)
        return evaluate(node.body, { ...env, [node.v]: C(1e7) });
      const tryAt = (x) => {
        try {
          const v = evaluate(node.body, { ...env, [node.v]: C(x) });
          return isFinite(v.re) && isFinite(v.im) ? v : null;
        } catch {
          return null;
        }
      };
      const above = tryAt(to.re + LIM_H);
      const below = tryAt(to.re - LIM_H);
      if (above && below) return C((above.re + below.re) / 2, (above.im + below.im) / 2);
      if (above) return above;
      if (below) return below;
      throw new LatexMathError("I couldn't evaluate this limit near its approach point.");
    }
    case "deriv":
      return derivativeOf(node.body, node.v, env);
    default:
      throw new LatexMathError(`Unknown node type ${node.type}.`);
  }
}

function integrate(body, v, lo, hi, env) {
  // Composite Simpson over SIMPSON_PANELS panels (complex-valued).
  const n = SIMPSON_PANELS;
  const h = (hi - lo) / n;
  if (h === 0) return C(0);
  let accRe = 0, accIm = 0;
  for (let k = 0; k <= n; k++) {
    const w = k === 0 || k === n ? 1 : k % 2 === 1 ? 4 : 2;
    const val = evaluate(body, { ...env, [v]: C(lo + k * h) });
    accRe += w * val.re;
    accIm += w * val.im;
  }
  return C((accRe * h) / 3, (accIm * h) / 3);
}

/** Numeric d(body)/d(varName) at env[varName] (central difference). */
function derivativeOf(body, varName, env) {
  const x0 = env[varName];
  if (x0 === undefined)
    throw new LatexMathError(`The variable "${varName}" has no value here.`);
  const h = DERIV_H * Math.max(1, Math.abs(x0.re));
  const above = evaluate(body, { ...env, [varName]: C(x0.re + h, x0.im) });
  const below = evaluate(body, { ...env, [varName]: C(x0.re - h, x0.im) });
  return C((above.re - below.re) / (2 * h), (above.im - below.im) / (2 * h));
}

/** Numeric derivative of a whole AST w.r.t. varName at a point (for FTC checks). */
export function derivativeAt(ast, varName, x0, env = {}) {
  return derivativeOf(ast, varName, { ...env, [varName]: C(x0) });
}

// ---------------------------------------------------------------------------
// AST inspection helpers (used by the checker)
// ---------------------------------------------------------------------------

/** Collect free variable names (excluding the built-ins e, i and bound vars). */
export function freeVars(ast, bound = new Set(), out = new Set()) {
  if (!ast || typeof ast !== "object") return out;
  switch (ast.type) {
    case "var":
      if (!bound.has(ast.name) && ast.name !== "e" && ast.name !== "i")
        out.add(ast.name);
      return out;
    case "defint":
    case "indefint": {
      freeVars(ast.lo, bound, out);
      freeVars(ast.hi, bound, out);
      const inner = new Set(bound);
      inner.add(ast.v);
      freeVars(ast.body, inner, out);
      return out;
    }
    case "evalbracket": {
      freeVars(ast.lo, bound, out);
      freeVars(ast.hi, bound, out);
      const inner = new Set(bound);
      inner.add(ast.v);
      freeVars(ast.body, inner, out);
      return out;
    }
    case "sum": {
      freeVars(ast.from, bound, out);
      freeVars(ast.to, bound, out);
      const inner = new Set(bound);
      inner.add(ast.v);
      freeVars(ast.body, inner, out);
      return out;
    }
    case "lim": {
      freeVars(ast.to, bound, out);
      const inner = new Set(bound);
      inner.add(ast.v);
      freeVars(ast.body, inner, out);
      return out;
    }
    default: {
      for (const key of ["a", "b", "n", "k", "arg", "body", "lo", "hi", "from", "to"])
        if (ast[key]) freeVars(ast[key], bound, out);
      return out;
    }
  }
}

/** If the AST is an indefinite integral (possibly negated), return {v, body, sign}. */
export function asIndefiniteIntegral(ast) {
  if (ast.type === "indefint") return { v: ast.v, body: ast.body, sign: 1 };
  if (ast.type === "neg") {
    const inner = asIndefiniteIntegral(ast.a);
    if (inner) return { ...inner, sign: -inner.sign };
  }
  return null;
}
