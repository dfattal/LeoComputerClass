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

---

## Current classes

| Class | Slug | Through-line | Status |
|-------|------|--------------|--------|
| Pixel Wizards | `pixels` | Absolute basics: draw pictures with code (variables → loops) | Published (7) ✅ new |
| Python Primer | `python-primer` | Real Python, one step up from Pixel Wizards | Published (5) |
| Leo's Computer Class | `leo` | Logic gates → a working CPU | Phases 1–3 published, ALU/CPU planned |
| Leo's Motion Lab | `leo-physics` | Calculus → simulate & engineer a Nerf blaster | Published (8) |
| Leo's Space School | `leo-space` | Gravity → orbits → land a rocket → reach Mars | Published (8) |
| Leo's Secret Codes | `leo-codes` | Make & break codes → XOR → one-time pad → RSA | Published (8) |
| DNA Decoders | `dna-decoders` | Visual Python primer: paint DNA as pixels → decode a creature (on-ramp to Bio Lab) | Published (7) ✅ |
| Leila's Bio Lab | `leila` | DNA, mutations, CRISPR through code | 8 published, 2 planned |

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

---

## Candidate classes (ranked by fit)

### 1. Build an Unbeatable Game Bot — *gateway to recursion*
**Through-line:** "A robot that never loses at tic-tac-toe… then Connect 4."
**Why it fits:** The natural on-ramp to recursion and search, with an immediate
payoff (beating Dad). Boards are grids (lists), every helper is testable.
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

### 2. Build a Programming Language — *the software bookend to the CPU class*
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
2. **Game Bot** — introduces recursion/search with a big payoff.
3. **Build a Programming Language** — the grand finale that closes the
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
