# Class Roadmap — Future Class Ideas

A running list of candidate classes for the Family Classroom platform, plus the
design rules any new class should follow. This is a planning doc, not a spec —
pick one, flesh it into a syllabus, and build it lesson-by-lesson the way the
existing classes are built. See `CLAUDE.md` → "Adding a New Class" for the
mechanics.

---

## The shared "class DNA"

Every class on this platform works because it follows the same recipe. A new
class should keep all five:

1. **A single build-toward-something through-line.** Not a grab-bag of topics —
   one concrete goal the whole class marches toward (build a CPU, engineer a
   Nerf blaster, fly a mission to the Moon). The arc is the motivation.
2. **Every lesson is one (or a few) testable function(s).** Exercises map to
   `tests.json` entries that run in-browser via Pyodide. Pure, deterministic
   functions only — no network, no filesystem, no GUI.
3. **Python is the lab bench, not the subject.** Kids learn the *domain* by
   writing code that *does* the thing. Code is the tool; the wonder is the topic.
4. **Written for a 10-year-old.** Simple language, concrete analogies, warm and
   encouraging. Teach the real words, but always anchor them to a picture.
5. **A payoff worth wanting.** Each lesson ends with a visible win, and the class
   ends with a capstone that ties everything together.

**Supporting tech already available** (lean on it): KaTeX for math, the line/
trajectory plot `viz.json` type for graphs, the CRISPR-style `viz` for sequence
work, per-case/per-entry `tol` for float answers, the AI coaching prompt per
class. The plot viz is self-contained Python in a `setup` block — great for
"watch it happen" panels.

---

## Current classes

| Class | Slug | Through-line | Status |
|-------|------|--------------|--------|
| Python Primer | `python-primer` | Learn Python in 5 lessons (prerequisite) | Published (5) |
| Leo's Computer Class | `leo` | Logic gates → a working CPU | Phases 1–3 published, ALU/CPU planned |
| Leo's Motion Lab | `leo-physics` | Calculus → simulate & engineer a Nerf blaster | Published (8) |
| Leo's Space School | `leo-space` | Gravity → orbits → land a rocket → reach Mars | Published (8) ✅ new |
| Leila's Bio Lab | `leila` | DNA, mutations, CRISPR through code | 8 published, 2 planned |

---

## Candidate classes (ranked by fit)

### 1. Secret Codes (Cryptography) — *top pick*
**Through-line:** "Send messages your sister can't read — then crack hers."
**Why it fits:** Best appeal-to-effort ratio. Every step is a pure string/number
function. Reuses Leo's binary/bit knowledge from Computer Class & Primer. Spy
theme is irresistible at this age, and *breaking* codes is as fun as making them.
**Prereqs:** Python Primer (strings, loops, dicts).
**8-lesson sketch:**
1. Caesar cipher — shift letters to hide a message
2. Decrypt & brute-force — try all 26 shifts, read the one that makes words
3. Substitution cipher — a full scrambled alphabet (a dict)
4. Frequency analysis — *crack* a substitution by counting letters ("e" is most common)
5. The XOR trick — bitwise secrecy, and why the same key undoes it
6. The one-time pad — the only unbreakable code, and why keys can't repeat
7. Key exchange by color-mixing — Diffie-Hellman as paint you can't un-mix
8. Capstone: a tiny public-key (RSA with small numbers) — send a secret with a *public* lock
**Viz/assets:** letter-frequency bar charts (plot viz); a "cracking" panel showing
candidate decryptions. Hero: spy/cipher-wheel motif.
**Risks:** RSA math needs careful 10yo framing (modular arithmetic via clock
analogy). Keep numbers tiny.

### 2. Build an Unbeatable Game Bot — *gateway to recursion*
**Through-line:** "A robot that never loses at tic-tac-toe… then Connect 4."
**Why it fits:** The natural on-ramp to recursion and search, with an immediate
payoff (beating Dad). Boards are grids (lists), every helper is testable.
**Prereqs:** Python Primer; Secret Codes or Motion Lab helps with confidence.
**8-lesson sketch:**
1. The board — represent and print a grid
2. Legal moves & making a move
3. Did someone win? — check rows, columns, diagonals
4. The dumb bot — pick a random legal move
5. Look one move ahead — block the opponent's win
6. Recursion: imagine the whole game — the minimax idea
7. The unbeatable bot — minimax to the end of tic-tac-toe
8. Capstone: Connect 4 with depth-limited search + a scoring heuristic
**Viz/assets:** board render (could reuse/extend the plot or a simple text grid);
a "search tree" sketch. Hero: game-grid/robot motif.
**Risks:** Minimax recursion is the conceptual peak — scaffold heavily; keep
tic-tac-toe small enough to search fully.

### 3. Build a Programming Language — *the software bookend to the CPU class*
**Through-line:** "You built the CPU — now build the language that runs on it."
**Why it fits:** The most satisfying long-term capstone class; directly completes
the Computer Class arc (hardware → software). Tokenizer/parser/evaluator are each
clean, testable stages. **Hold until last** — it's the most abstract.
**Prereqs:** Computer Class (mental model of how a machine executes) + comfort
with recursion (do Game Bot first).
**8-lesson sketch:**
1. Tokenizer — chop "3 + 4 * 2" into tokens
2. Evaluate a flat list — left-to-right calculator
3. Precedence — why × binds tighter than +
4. Recursive parsing — expressions inside expressions (parentheses)
5. Variables — `let x = 5` and a memory dict
6. Comparisons & booleans
7. `if` / `while` — control flow your language can run
8. Capstone: a tiny interpreted language that runs a real little program
**Viz/assets:** a parse-tree / token-stream visualization would be lovely (custom
viz, more work). Hero: code/brackets motif.
**Risks:** Abstraction load is highest of all candidates. Lots of small,
well-tested stages; resist adding language features.

---

## Honorable mentions (good, but second-tier)

- **Pictures from Math** — pixel grids, color functions, fractals (Mandelbrot),
  ASCII or PNG output. Strong visual payoff; ties into David's 3D/DisplayXR work.
  Needs an image-output viz path (the plot viz is line-based; would want a raster
  panel). Through-line: "render a scene with nothing but math."
- **Game of Life & Emergence** — Conway's Life and other cellular automata; magical
  emergent behavior from tiny rules. Grid-based, very testable. Through-line:
  "tiny rules, surprising worlds." Could share a grid-render viz with Game Bot.
- **Sound by Code** — sine waves → notes → scales → synthesize a tune. Bridges
  Motion Lab's wave math to music. Pyodide can emit WAV bytes; needs an audio
  output path in the UI (new). Through-line: "compose and play a song in code."

---

## Suggested sequence for Leo

Given what Leo has done (Primer → Computer Class → Motion Lab → Space School),
the natural next order is:

1. **Secret Codes** — fresh domain, reuses binary, highest fun-per-effort.
2. **Game Bot** — introduces recursion/search with a big payoff.
3. **Build a Programming Language** — the grand finale that closes the
   hardware→software loop from the Computer Class.

Pictures from Math / Game of Life / Sound by Code are great any-time detours,
gated mainly on adding the matching output panel (raster image / audio).
