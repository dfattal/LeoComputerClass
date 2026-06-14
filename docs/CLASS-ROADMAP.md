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
   Nerf blaster, fly a mission to the Moon, publish your own math book). The arc
   is the motivation.
2. **Every lesson is one (or a few) testable function(s).** Exercises map to
   `tests.json` entries that run in-browser via Pyodide. Pure, deterministic
   functions only — no network, no filesystem, no GUI. *(Two no-Python lesson
   kinds now exist as deliberate exceptions — see below — but the deterministic
   auto-grading spirit holds for both.)*
3. **Code is the lab bench, not the subject.** Kids learn the *domain* by
   writing code that *does* the thing. Code is the tool; the wonder is the topic.
   (Usually Python; the Proof Press class made LaTeX the lab bench instead.)
4. **Written for a 10-year-old.** Simple language, concrete analogies, warm and
   encouraging. Teach the real words, but always anchor them to a picture.
5. **A payoff worth wanting.** Each lesson ends with a visible win, and the class
   ends with a capstone that ties everything together.

**Supporting tech already available** (lean on it): KaTeX for math, three
`viz.json` panel types — the line/trajectory **`plot`**, the **`draw`** pixel-grid
drawing canvas (student code returns a 2D grid of color-name/emoji/empty cells;
see Pixel Wizards + `components/PixelCanvas.tsx`), and the CRISPR-style sequence
`viz` — per-case/per-entry `tol` for float answers, and a per-class AI coaching
prompt (now personalized with the student's login first name). `plot`/`draw`
panels are driven by the student's own code through the `__VIZ__` channel, so
they're "watch it happen" panels. Accent colors live in one place,
`lib/accents.ts` (don't hardcode them). To scaffold a drawing lesson, pass
`--viz draw` to `scaffold-lesson.mjs` / `/new-lesson`.

**Two no-Python lesson kinds** are also available (both documented in
`/new-lesson`):

- **Reflection lessons** (`reflection.json`) — one open question the kid
  re-explains in their own words; the AI coach grades *understanding*. Every
  class now ends with a "The Big Picture" reflection capstone.
- **LaTeX lessons** (`latex.json`, Proof Press) — the kid typesets a small math
  document with a live KaTeX page; a numeric evaluator (`lib/latex/`) verifies
  the **math is true**, not just the syntax (equation chains sampled at real
  values, complex-valued, indefinite integrals checked by differentiating the
  answer — the FTC as grader). Answer key is `reference.tex`, proven by
  `validate-class` against the same checker the browser runs. A whole class can
  be built on this kind — or a single latex lesson could land inside a Python
  class where typesetting fits the story.

---

## Current classes

Every class below also ships a final **"The Big Picture" reflection capstone**
(the `+1` in the counts).

| Class | Slug | Through-line | Status |
|-------|------|--------------|--------|
| Pixel Wizards | `pixels` | Absolute basics: draw pictures with code (variables → loops) | Published (7+1) |
| Python Primer | `python-primer` | Real Python, one step up from Pixel Wizards | Published (5+1) |
| Leo's Computer Class | `leo` | Logic gates → a working CPU | Published (10+1) ✅ — ALU & CPU phases complete (weeks 7–10) |
| Leo's Motion Lab | `leo-physics` | Calculus → simulate & engineer a Nerf blaster | Published (8+1) |
| Leo's Space School | `leo-space` | Gravity → orbits → land a rocket → reach Mars | Published (8+1) |
| Leo's Secret Codes | `leo-codes` | Make & break codes → XOR → one-time pad → RSA | Published (8+1) |
| DNA Decoders | `dna-decoders` | Visual Python primer: paint DNA as pixels → decode a creature (on-ramp to Bio Lab) | Published (7+1) |
| Leila's Bio Lab | `leila` | DNA, mutations, CRISPR through code | Published (8+1), 2 planned |
| Leo's Proof Press | `leo-latex` | Typeset your own math book in LaTeX → e^{iπ} = −1 | Published (8) ✅ new — no reflection capstone (L8 *is* the capstone) |
| Leo's Game Studio | `leo-games` | JavaScript → build an arcade game (Breakout) → publish it online for friends | Published (8) ✅ new "javascript" lesson kind; L8 *is* the capstone (no reflection) |
| Operating Systems | `os` | You built the CPU — now build the OS that runs it (scheduler → memory → files → cache) | Published (7+1) ✅ all 8 lessons built; software sequel to the Computer Class; `slate` accent; Gantt/memory/disk/cache rendered on the `draw` grid |

---

## Shipped from this list

### Pixel Wizards — ✅ built as `pixels`, 7 lessons published
**Through-line:** "Draw pictures with code — and find out *why* variables,
functions, and loops exist." A new **Level 0** class (not originally on this
list): the true absolute-beginner on-ramp for a kid who has never coded. It sits
first on the home page, above Python Primer, which was repositioned as the
next step ("Real Python, One Step Up").

**Why it was added:** Python Primer ramps to intermediate fast (bitwise ops by
lesson 5) and has no visuals — too steep as a first contact. Pixel Wizards is
visual-first and slows the ramp to half-steps.

**Lesson arc (each one: feel the *pain* of not having the idea → then the idea as
relief → then draw):**
1. Hello, Pixels! — return a grid; one red square, then a rainbow row
2. Boxes That Remember — variables (name a color once, change it everywhere)
3. Numbers & Counting — `["green"] * n`, sizing by a number (no loop yet)
4. Magic Spells — functions/reuse (call `blank_row()` instead of retyping)
5. Spells with Inputs — parameters (one `dot(color)` spell, many pictures)
6. Making Choices — `if`/`else` (the computer decides per square)
7. Do It Again — `for` + nested loops (an 8×8 checkerboard from a few lines)

**As-built notes:**
- Shipped the new **`draw` pixel-grid viz** (`type:"draw"`): the student's
  function returns a 2D grid of color-name/emoji/`""`-empty cells, rendered by
  `components/PixelCanvas.tsx` over the existing `__VIZ__` channel (no Pyodide
  change). `validate-class` and `scaffold-lesson.mjs --viz draw` know about it.
  **This closes the "needs a raster/grid panel" blocker the honorable-mention
  classes below were waiting on.**
- Exact-match grids (lists of lists of strings) are generated from `reference.py`
  like every other class — no `tol` needed.
- New accent `fuchsia` added to `lib/accents.ts`. Hero `/hero-pixels.webp` is
  pixel-art. The AI coaching prompt is name-agnostic and greets the student by
  their Google login first name (a personalization now wired for all classes).

### Secret Codes (Cryptography) — ✅ built as `leo-codes`, 8 lessons published
**Through-line:** "Send messages your sister can't read — then crack hers."
The top candidate, now live. Final lesson arc (titles as shipped):

1. The Caesar Cipher — shift letters to hide a message
2. Crack It: Brute Force — try all 26 shifts, score for English, read the winner
3. The Substitution Cipher — a full scrambled alphabet
4. Frequency Analysis — *crack* a substitution by counting letters ("e" gives it away)
5. The XOR Trick — bitwise secrecy; the same key undoes it (reuses Leo's binary)
6. The One-Time Pad — the only unbreakable code; the two-time-pad leak shows why keys can't repeat
7. Key Exchange by Color-Mixing — Diffie-Hellman as paint you can't un-mix
8. The Public Lock (capstone) — tiny RSA: a public lock anyone can shut, a private key only you hold

**As-built notes (differ slightly from the original sketch):**
- To keep Pyodide `valuesMatch` robust, every function returns `str`/`int`/`bool`/`list`,
  never a dict. The substitution key is a **26-char string** (not a dict), letter counts
  are a **list of 26 ints**, and ciphers (XOR/OTP) return **lists of ints**.
- Ciphers operate on lowercase `a–z`; spaces/other characters pass through unchanged.
- Frequency "bar charts" are drawn as **profile point-series** in the line `plot` viz
  (the only viz type available) — message vs scaled typical-English shape.
- RSA/DH numbers are tiny and framed as clock arithmetic (RSA p=5,q=11,n=55,φ=40,e=3,d=27;
  DH g=5,p=23). `private_key` finds `d` by a short search loop.
- Hero `/hero-codes.webp` (cipher-wheel/spy motif), accent `rose`. Building this also
  surfaced that accent colors are hardcoded in three files (`AccentContext.tsx`,
  `app/page.tsx`, `app/classes/[classSlug]/page.tsx`) — `rose` and the previously-missing
  `sky` were added to all three.

### DNA Decoders — ✅ built as `dna-decoders`, 7 lessons published
**Through-line:** "One strand of DNA → a living creature." A visual, draw-canvas
Python primer that bridges **Pixel Wizards → Leila's Bio Lab**: it teaches the exact
Python concepts Bio Lab assumes (strings, slicing, methods, lists, loops, dicts,
chunking), each motivated by a *DNA pain point* the concept relieves, with DNA painted
as colored pixels. Accent `lime`, studentName Leila; the registry entry sits just
before `leila` so it reads as the on-ramp. Built entirely with `/new-lesson`,
reference.py-first.

**Lesson arc (each: feel the DNA *pain* → the Python idea as relief → paint it):**
1. DNA is a String of Letters — strings + indexing (`dna[0]`, `dna[-1]`) — *built earlier*
2. Slicing the Strand — `dna[start:end]` snips a gene; `dna[::-1]` flips the strand
3. Counting & Swapping Bases — `.count()` tallies a base; `.replace("T","U")` makes RNA
4. Lists: a Backpack of Bases — `list(dna)`, `.append()` (a container that can *grow*)
5. Loops: Do It to Every Base — `for` + `out += ...` to build the complement / reverse-complement
6. Dictionaries: the Lookup Table — dict literal + `d[key]`: tally table + codon→creature look-up
7. Chunk the Genome → Decode a Creature (capstone) — `range(0,len,3)` + slicing → codons,
   then nested-dict lookups hatch a creature (mirrors Bio Lab L7's `decode_traits`)

**As-built notes:**
- **Novel reusable technique — "hidden painter in viz `setup`":** students return real
  Bio-Lab-style values (`str`/`list`/`dict`) validated by `tests.json`, and a hidden
  `__paint`/`__show_*` painter turns them into a `draw` grid. The painter helpers are
  **duplicated in both** the draw `viz.json` `setup` (the live app prepends student code
  then `setup`) **and** `reference.py` (so `validate-class` can run each stage's `fn`
  against the answer key). Draw `stages` (`{fn,args,expected,caption,label}`) give the
  pin-to-play chips. First class to drive a `draw` panel from `setup`.
- **Relaxed the "never return a dict" rule** (L6/L7). The Pyodide grader compares with
  key-order-sensitive `JSON.stringify`, so the old blanket ban existed to avoid a student
  being marked wrong for a different key order. Bio Lab L1/L7 already prove dicts are safe
  when the lesson **pins one natural key order** (`A,T,C,G`; `fur,eyes,tail`) that the
  starter/exercises teach. The `/new-lesson` SKILL was updated from a hard ban to that
  nuance. Dict *args* also work — a JSON object literal is a valid Python dict literal, so
  `look_up(table, codon)` and `decode_creature(dna, table)` take dicts directly.
- Base palette reused from L1: A=green, T=red, C=blue, G=yellow, U=purple, `""`=empty;
  traits/creatures use emoji cells. Hero `/hero-dna-decoders.webp`.

### Leo's Proof Press — ✅ built as `leo-latex`, 8 lessons published
**Through-line:** "You've derived the math — now publish it." Like Pixel
Wizards, not originally on this list: a **LaTeX typesetting** class that uses
the *Building the Universe from First Principles* curriculum Leo already worked
through on paper as its backdrop. Each lesson teaches the LaTeX needed to
typeset one chapter of math he already understands; the capstone is his own
math book ending at $e^{i\pi} = -1$. Accent `teal`, hero `/hero-latex.webp`.

**Lesson arc (LaTeX skill ladder riding the math he owns):**
1. Your First Typeset Page — `$$`, `^`/`_`, `\frac`, `\sqrt`, `\lim`, `\int`, evaluation brackets
2. The Rules of the Machine — `\frac{d}{dx}`, `\cdot`, `\left( \right)` (product/chain rules in action)
3. The Art of Counting — `!`, `\binom`, the binomial expansion
4. The Infinite Tower — `\sum`, `\infty` (the e^x series)
5. The Mirror Universe — `\ln`, commands inside exponents, typesetting a *law*
6. A New Dimension — complex numbers; answers with imaginary parts
7. The Great Split — `align*` multi-line derivations; Euler's formula; the unit circle summoned
8. The Summit — Euler's identity, ln(−1) = iπ, one closing FTC integral

**As-built notes:**
- Shipped a whole new **"latex" lesson kind** (see "Two no-Python lesson kinds"
  above): Monaco LaTeX mode, live KaTeX page with per-exercise status chips,
  3-tier in-browser grading (compiles → required commands → **the math is
  numerically true**), no Pyodide. The math-truth tier is the class's
  signature: it evaluates every `=`-segment at sampled values (complex-valued —
  it verifies $e^{i\pi} = -1$ itself), integrates definite integrals
  numerically, and checks indefinite integrals by differentiating the student's
  answer back to the integrand.
- The `reference.py`-before-`tests.json` invariant carries over as
  **`reference.tex`-before-`latex.json`**: `validate-class` proves the answer
  key against the exact checker module the browser imports.
- Numeric grading can't distinguish *forms* (a re-stated left side passes by
  value) — `requires`/`forbids` tokens + `minSegments` ("show your work") +
  the AI editor persona carry the craftsmanship judgment instead.
- No reflection capstone: lesson 8 already *is* the looking-back chapter, and
  the finished typeset book is the artifact.

---

## Candidate classes (ranked by fit)

### 1. Leo's Game Studio — *JavaScript + build a real online game* (next up — Leo asked for it)
**Through-line:** "Build your own arcade game and put it online for friends to play."
**Why it fits:** Leo explicitly asked for JavaScript leading to online games —
motivation is the platform's strongest fuel. It's also the cheapest language
swap yet: Proof Press proved a new lesson kind can change the lab bench
(LaTeX/`latex.json`), and JS runs *natively* in the browser — no Pyodide, no
worker round-trips. And it's a Trojan horse: Leo discovers that variables,
functions, and loops transfer to a second language, and lesson 3 quietly reuses
his Motion Lab physics (velocity, bouncing).
**How it keeps the class DNA (testability):** teach the **update/render split**.
Students write **pure functions** — `update(state, input) → newState`,
`isHit(ball, paddle) → bool` — deterministic and auto-gradeable with the same
`TestResult` shape, while a built-in game loop in the preview panel calls them
~60×/sec to make the game *live* (the `__VIZ__` "watch it happen" philosophy at
its peak). Randomness via a seeded RNG passed in as an argument.
**New engineering — the "javascript" lesson kind — ✅ SHIPPED (2026-06-07):**
- `js.json` signal file (presence ⇒ JS lesson, like `latex.json`), carrying an
  optional `preview` (live game canvas config). `reference.js` is the inert
  answer key — **write it before `tests.json`/`js.json`**, same invariant as
  `reference.py`/`reference.tex`.
- Grading: `tests.json` (same shape) runs in `public/js-worker.js` (a sandboxed
  Web Worker) using the SAME `valuesMatch` as Python — now extracted to one
  shared `public/values-match.js` that both workers `importScripts` and
  `validate-class` reads, so the three graders can't drift. Same `TestResult`
  shape ⇒ submit/completion/AI-review unchanged. `lib/js/useJsRunner.ts` mirrors
  `usePyodide` (owns the timeout, terminates a runaway worker).
- Live preview: `components/GamePreview.tsx` runs the student's code on the main
  thread (canvas needs it) in a rAF loop — `update(state, input) → state` then
  `render(ctx, state)` each frame, with keyboard/mouse `input`. Recompiles only
  on Run (a half-typed `while(true)` can't freeze the tab on keystroke), with
  Play/Pause/Restart + error overlay. Monaco JS mode is built-in.
- `validate-class` runs `reference.js` in a `node:vm` sandbox the same way the
  worker does (proves the answer key passes every case + the preview fns exist
  and init/update run). `scaffold-lesson.mjs --kind js` scaffolds the JS files;
  the ai-review route has a JavaScript branch (Python-aware coaching voice).
- Proven L1 "The Canvas" (`rightEdge`, `isOnScreen`, a `render` scene) validates
  15/15; all 1244 checks across every class still pass (no Python regression).

**All 8 lessons SHIPPED ✅ (2026-06-07).** Arc: 1 The Canvas (coordinates +
`render`) · 2 The Game Loop (`step`, update-vs-render) · 3 Make It Move (`bounce`,
the Motion-Lab sign-flip) · 4 You're in Control (`movePaddle`, keyboard) · 5 Crash!
(`overlaps`, AABB) · 6 Keeping Score (`addScore`/`loseLife`/`isGameOver`, immutable
state) · 7 The Brick Wall (`makeBricks`/`removeHit`) · 8 Ship It (the master
`update`, full Breakout). Each lesson's `starter.js` IS the whole little program
with the day's function(s) stubbed; the file grows lesson to lesson and the live
canvas shows the cumulative game. **Key design call:** the game's bottom is OPEN
(bounce flips vy on the ceiling only) — a 4-wall bounce makes losing a life
impossible, so the open floor is what makes the paddle and lives real; verified by
node sim (tracking paddle clears all 32 bricks → win; parked paddle → 3 misses →
GAME OVER). Built by 6 parallel subagents against `docs/game-studio-spec.md` (the
canonical Breakout data model + per-lesson contracts), then integrated + the
open-floor fix applied.

**"Publish online" — ✅ SHIPPED (the `/arcade` share route).** A **Share** button
in the JS editor toolbar POSTs the current game to `POST /api/share`, which
snapshots the code into a new `shared_games` table (public-read RLS) under a
stable short id and returns `/arcade/<id>`. That public, no-auth page
(`app/arcade/[shareId]/page.tsx`, allowlisted in `lib/supabase/middleware.ts`)
loads the lesson's `js.json` preview and runs the saved code full-screen via a
reused `<GamePreview>` (`components/ArcadePlayer.tsx`), with its own OG/Twitter
card so the link unfurls. One share per (user, lesson) so re-publishing keeps the
same link. **One deploy step:** apply `lib/supabase/migration-shared-games.sql` to
prod (same as the drafts table). L8 ships the full playable game *and* a real
shareable URL.
**Prereqs:** Python Primer + one subject class (Leo is far past this).
**8-lesson sketch:**
1. The Canvas — draw shapes at (x, y); JS syntax via pure "what to draw" functions
2. The Game Loop — frames; update vs render
3. Make It Move — velocity, bouncing off walls (Motion Lab callback)
4. You're in Control — keyboard input, move the paddle/ship
5. Crash! — collision functions (rect/circle overlap — beautifully testable)
6. Keeping Score — game state: score, lives, game-over
7. Enemies & Surprises — spawning, seeded randomness, difficulty
8. Capstone — assemble the full game (Breakout or Snake) **and publish it at a
   real URL** to send to friends
**Viz/assets:** the live game canvas *is* the viz. Hero: arcade/joystick motif.
**Risks:** scope creep ("can I add multiplayer?") — pin the capstone to one
finished, polished game; the new lesson-kind plumbing must land before lesson 1.

### 2. Build an Unbeatable Game Bot — *gateway to recursion* (now the Game Studio sequel)
**Through-line:** "Your game needs an opponent — a robot that never loses at
tic-tac-toe… then Connect 4."
**Why it fits:** The natural on-ramp to recursion and search, with an immediate
payoff (beating Dad). Boards are grids (lists), every helper is testable.
Re-positioned as the **sequel to Game Studio**: recursion/minimax lands with
more punch when the AI plays inside a game world the kid built himself (language
TBD — Python or JS, decide when building).
**Prereqs:** Python Primer (Leo has already done Secret Codes & Motion Lab — plenty of confidence).
**8-lesson sketch:**
1. The board — represent and print a grid
2. Legal moves & making a move
3. Did someone win? — check rows, columns, diagonals
4. The dumb bot — pick a random legal move
5. Look one move ahead — block the opponent's win
6. Recursion: imagine the whole game — the minimax idea
7. The unbeatable bot — minimax to the end of tic-tac-toe
8. Capstone: Connect 4 with depth-limited search + a scoring heuristic
**Viz/assets:** board render — now easy with the **`draw` pixel-grid viz** (return
the board as a grid of colored/emoji cells); a "search tree" sketch would still be
custom. Hero: game-grid/robot motif.
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
  **Now unblocked:** the `draw` pixel-grid viz (shipped with Pixel Wizards) is
  exactly the raster panel this needed — return a grid where each cell's color
  comes from a math function. (Very high-res continuous fractals would still want
  a finer per-pixel canvas, but coarse grids work today.) A natural sequel that
  graduates Pixel Wizards kids from "pick a color" to "*compute* a color."
  Through-line: "render a scene with nothing but math."
- **Game of Life & Emergence** — Conway's Life and other cellular automata; magical
  emergent behavior from tiny rules. Grid-based, very testable. Through-line:
  "tiny rules, surprising worlds." **Now unblocked:** render each generation with
  the `draw` pixel-grid viz (live → black cells, dead → empty).
- **Sound by Code** — sine waves → notes → scales → synthesize a tune. Bridges
  Motion Lab's wave math to music. Pyodide can emit WAV bytes; needs an audio
  output path in the UI (new). Through-line: "compose and play a song in code."

---

## Suggested sequence for Leo

Given what Leo has done (Primer → Computer Class → Motion Lab → Space School),
the natural next order is:

1. ~~**Secret Codes**~~ — ✅ built (`leo-codes`).
2. ~~**Proof Press**~~ — ✅ built (`leo-latex`); pairs naturally with the paper
   math curriculum he just finished — publish what you proved.
3. **Game Studio** — JavaScript + a real online game (Leo's own request); ships
   the new "javascript" lesson kind.
4. **Game Bot** — the sequel: recursion/search gives his game an unbeatable
   opponent.
5. **Build a Programming Language** — the grand finale that closes the
   hardware→software loop from the Computer Class.

For an **absolute beginner** (a younger kid, or Leila starting out), the ladder
now starts earlier: **Pixel Wizards** (✅ built) → **Python Primer** → a subject
class. Pixel Wizards is the gentlest first contact and feeds everything else. For
a beginner specifically headed into **Bio Lab**, **DNA Decoders** (✅ built) is
the targeted bridge: it teaches the exact Python (strings, slicing, lists, loops,
dicts, chunking) Bio Lab assumes, in the visual `draw`-canvas style, and ends one
step short of Bio Lab's creature-decoder.

Pictures from Math / Game of Life are now unblocked by the `draw` pixel-grid viz
(see above) and make strong any-time detours; **Sound by Code** is still gated on
adding an audio output path to the UI.
