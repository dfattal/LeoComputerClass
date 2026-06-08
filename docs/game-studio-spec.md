# Leo's Game Studio — build spec (lessons 1–8)

Authoritative spec so all 8 lessons build ONE coherent Breakout game. Read this
before authoring any leo-games lesson. The "javascript" lesson kind is already
built (see CLASS-ROADMAP candidate #1 "As-built"). This doc locks the data model,
the canonical function implementations, and each lesson's contract.

## The model (no `setup` / no `preview.js`)

Each lesson's **starter.js IS the whole little program**: the function(s) being
taught are stubbed; everything else is given, complete, clearly marked. The live
`<GamePreview>` compiles the student's file and calls the `init`/`update`/`render`
names from `js.json`. Tests (`tests.json`, run in the JS sandbox) call the taught
function directly. `reference.js` = the same file with the taught function(s)
filled in (the answer key — **write it FIRST**, generate `tests.json` values from
it with node, never by hand).

So per lesson: `reference.js` = `starter.js` with the day's stub(s) completed.
The file GROWS lesson to lesson (prior lessons' functions become "given" complete
code). Keep given code tight and commented. Mark the student's job with a banner:

```javascript
// ┌─────────────────────────────────────────┐
// │  YOUR JOB: finish the function below 👇  │
// └─────────────────────────────────────────┘
```

### Conventions (match across every lesson)
- Canvas `W = 480`, `H = 360`. Background `"#0b1020"`. Paddle `"#fb923c"`. Ball
  `"#ffffff"`. Brick row colors: `["#f87171","#fb923c","#fbbf24","#34d399"]`.
- A **box** is `{ x, y, w, h }` (top-left + size). `(0,0)` is top-left, y grows
  DOWN.
- The **ball** is `{ x, y, vx, vy, r }` (center + velocity + radius).
- Pure functions RETURN new objects (never mutate the argument) — this is a
  taught habit and the ai-prompt watches for it. Use the SAME key order shown in
  the canonical code below so generated `tests.json` values stay stable.
- **The bottom is OPEN** (bounce flips vy on the ceiling only). The floor is where
  the paddle goes; missing it is how you lose a life. In L3–L5 (no lives yet) the
  given `update` pops a dropped ball back to the middle so the preview stays live;
  from L6 a drop past the floor (`ball.y - ball.r > H`) costs a life + resets the
  ball moving UP (`{x:240,y:240,vx:2.4,vy:-2.4,r:7}`).
- Randomness (if ever needed) comes from a seeded RNG passed as an argument, never
  `Math.random()`.
- `input` (passed to update each frame by GamePreview) is
  `{ keys: {ArrowLeft, ArrowRight, ...}, mouseX, mouseY, mouseDown, width, height, frame }`.
- `render(ctx, state)` only draws; it is never run by the grader (only existence
  is checked + init/update run in node), so it may freely use `ctx`.

## Canonical functions (the finished game's code — copy verbatim)

```javascript
const W = 480, H = 360;

// L2 — move the ball one frame by its velocity.
function step(ball) {
  return { x: ball.x + ball.vx, y: ball.y + ball.vy, vx: ball.vx, vy: ball.vy, r: ball.r };
}

// L3 — flip a velocity when the ball reaches a wall (the bounce). NOTE: the
// bottom is OPEN (no floor bounce) — that's the whole point of the paddle, and
// the ONLY way a "miss"/lose-a-life is possible (a 4-wall bounce makes losing
// impossible). `height` is unused but kept in the signature for symmetry.
function bounce(ball, width, height) {
  let vx = ball.vx, vy = ball.vy;
  if (ball.x - ball.r <= 0 || ball.x + ball.r >= width) vx = -vx;
  if (ball.y - ball.r <= 0) vy = -vy; // ceiling only
  return { x: ball.x, y: ball.y, vx: vx, vy: vy, r: ball.r };
}

// L4 — steer the paddle from the keyboard, clamped to the canvas.
function movePaddle(paddle, input, width) {
  let x = paddle.x;
  const speed = 6;
  if (input.keys["ArrowLeft"]) x -= speed;
  if (input.keys["ArrowRight"]) x += speed;
  if (x < 0) x = 0;
  if (x + paddle.w > width) x = width - paddle.w;
  return { x: x, y: paddle.y, w: paddle.w, h: paddle.h };
}

// L5 — do two boxes overlap? (axis-aligned rectangle test)
function overlaps(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

// helper used from L5 on — the ball as a box (so overlaps() works on it).
function ballBox(ball) {
  return { x: ball.x - ball.r, y: ball.y - ball.r, w: ball.r * 2, h: ball.r * 2 };
}

// L6 — immutable state updates (return a NEW state, never mutate).
function addScore(state, points) { return { ...state, score: state.score + points }; }
function loseLife(state)         { return { ...state, lives: state.lives - 1 }; }
function isGameOver(state)       { return state.lives <= 0; }

// L7 — build the brick wall (a grid of boxes) and knock out hit bricks.
function makeBricks(rows, cols) {
  const bricks = [];
  const w = 50, h = 16, gapX = 6, gapY = 6, left = 9, top = 30;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      bricks.push({ x: left + c * (w + gapX), y: top + r * (h + gapY), w: w, h: h });
    }
  }
  return bricks;
}
function removeHit(bricks, box) {
  return bricks.filter(function (b) { return !overlaps(b, box); });
}
```

## Per-lesson contract

For every lesson: `js.json` is `{ "preview": { "width":480, "height":360,
"init":"init", "update":"update", "render":"render", "keys":[...], "caption":"..." } }`
(omit `update`/`keys` where noted; use `"still": true` only for L1). `init`,
`update`, `render` live in the student file (given, complete) EXCEPT where the
taught function below IS one of them. `tests.json` grades the **taught
function(s)** — generate every `expected` from `reference.js` with node.

### L1 — The Canvas ✅ DONE
Taught: `rightEdge(box)`, `isOnScreen(box,w,h)`, `render(ctx)`. Preview `still`.

### L2 — The Game Loop  (taught: `step`)
- Teach update-vs-render: each frame UPDATE the numbers, then RENDER. `step(ball)`
  returns the ball moved by its velocity. No bounce yet → it flies off screen
  (the cliffhanger for L3).
- File: given `init()` → `{ ball: {x:240,y:180,vx:2.4,vy:1.8,r:7} }`;
  given `update(state,input)` → `{ ball: step(state.ball) }`; given
  `render(ctx,state)` draws bg + the ball (white circle via `ctx.arc`). Stub
  `step`.
- Tests (`step`): `step({x:0,y:0,vx:2,vy:1,r:7})`,
  `step({x:240,y:180,vx:2.4,vy:1.8,r:7})`, a negative-velocity case.
- js.json: init/update/render, caption "Your ball moves! Next lesson we'll keep it on screen."

### L3 — Make It Move  (taught: `bounce`)
- Teach: a wall bounce flips the matching velocity's sign (the Motion Lab
  callback). `bounce(ball,width,height)`.
- File: `step` now GIVEN complete; `update` → `{ ball: bounce(step(state.ball), W, H) }`.
  Stub `bounce`. init ball same as L2.
- Tests (`bounce`): ball at right wall (x+r≥W) → vx negated; at left wall (x-r≤0)
  → vx negated; at top (y-r≤0) → vy negated; in the middle → unchanged.
- js.json: init/update/render, caption "Now it ricochets off every wall — forever!"

### L4 — You're in Control  (taught: `movePaddle`)
- Teach: read `input.keys`, move the paddle, clamp to the canvas. `movePaddle(paddle,input,width)`.
- File: `step`,`bounce` GIVEN; state now `{ ball, paddle }` with
  `paddle:{x:200,y:336,w:80,h:12}`; `update` →
  `{ ball: bounce(step(state.ball),W,H), paddle: movePaddle(state.paddle,input,W) }`;
  `render` draws bg, ball, orange paddle. Stub `movePaddle`.
- Tests (`movePaddle`): ArrowRight down → x+6; ArrowLeft down → x-6; ArrowLeft at
  x=0 → stays 0; ArrowRight at right edge → clamped to W-w; no keys → unchanged.
  (Pass input as `{keys:{ArrowRight:true}}` etc.)
- js.json: init/update/render, keys `["ArrowLeft","ArrowRight"]`, caption "Click the
  game and steer with ← →. (The ball ignores the paddle… for now.)"

### L5 — Crash!  (taught: `overlaps`)
- Teach: two rects overlap only if they overlap on BOTH axes. `overlaps(a,b)`.
  `ballBox` is GIVEN.
- File: `step`,`bounce`,`movePaddle`,`ballBox` GIVEN; `update` bounces the ball off
  the paddle: after stepping+wall-bounce, `if (overlaps(ballBox(ball), paddle) &&
  ball.vy > 0) ball = {...ball, vy:-ball.vy}`. Stub `overlaps`.
- Tests (`overlaps`): two clearly overlapping boxes → true; far apart → false;
  just-touching edges (a.x+a.w === b.x) → false; one inside the other → true;
  overlap on x only → false.
- js.json: init/update/render, keys `["ArrowLeft","ArrowRight"]`, caption "Keep the
  ball alive — it bounces off your paddle now!"

### L6 — Keeping Score  (taught: `addScore`, `loseLife`, `isGameOver`)
- Teach: the whole game is one bundle of numbers; update RETURNS a new state
  (never mutates). Lives, score, GAME OVER.
- File: state `{ ball, paddle, score:0, lives:3 }`; `update` (GIVEN) calls the
  three taught fns: +10 when the ball bounces off the paddle (addScore), -1 and a
  ball reset when the ball passes the floor (loseLife), and freezes when
  isGameOver. `render` draws a HUD (SCORE / ♥ lives) and a GAME OVER banner. Stub
  the three fns.
- Tests: `addScore({score:0,lives:3,...},10)` → score 90/... (generate from ref);
  `loseLife` → lives-1; `isGameOver({lives:0})` → true, `{lives:2}` → false. Use a
  minimal but realistic state object in args (keep key order: ball,paddle,score,lives).
- js.json: init/update/render, keys `["ArrowLeft","ArrowRight"]`, caption "Score points,
  guard your 3 lives — don't let it hit the floor!"

### L7 — The Brick Wall  (taught: `makeBricks`, `removeHit`)
- Teach: an array of bricks; `makeBricks(rows,cols)` builds the grid; `removeHit(bricks,box)`
  filters out any brick the ball hit. `overlaps`/`ballBox` GIVEN.
- File: state `{ ball, paddle, bricks: makeBricks(4,8), score, lives }`; `update`
  (GIVEN) bounces the ball off bricks, removes them (removeHit), +10 each. `render`
  draws colored bricks by row. Stub `makeBricks`, `removeHit`.
- Tests: `makeBricks(1,1)` → `[{x:9,y:30,w:50,h:16}]`; `makeBricks(2,3)` → 6 bricks
  (generate); `removeHit([...],ballBoxOverlappingOne)` → array minus that brick;
  `removeHit` with no overlap → unchanged. Generate ALL from reference.
- js.json: init/update/render, keys `["ArrowLeft","ArrowRight"]`, caption "Smash every
  brick to win!"

### L8 — Ship It: Your Arcade Game  (taught: master `update`)
- Capstone: assemble everything. `step`,`bounce`,`movePaddle`,`overlaps`,`ballBox`,
  `makeBricks`,`removeHit`,`addScore`,`loseLife`,`isGameOver`,`newGame` are GIVEN
  complete; the student writes the master `update(state, input)` that wires them
  into one frame: move+wall-bounce the ball, steer the paddle, paddle bounce (+10),
  brick collisions (removeHit +10 each), lose a life on the floor, stop on game
  over / win. Stub `update`.
- Tests (`update`): a few specific one-frame transitions from a fixed start state
  (ball moves by velocity; ball bounces off a wall; a brick disappears + score +10
  when the ball overlaps it; lives -1 when the ball is below the floor). Generate
  every expected state from reference.update.
- js.json: init = `newGame`, update = `update`, render = `render`, keys
  `["ArrowLeft","ArrowRight"]`, caption "🎉 Your game! Share it with friends."
- "Publish online": the lesson.mdx celebrates the finished game and explains
  sharing. (A public /arcade share-route is a SEPARATE future infra item — note it,
  don't block the capstone on it. L8 IS the looking-back capstone; no reflection
  lesson, like Proof Press.)

## Build checklist per lesson
1. Write `reference.js` (whole file, taught fn complete) FIRST.
2. `node -e` load reference.js, call each test case → copy exact values into `tests.json`.
3. `starter.js` = reference.js with the taught fn(s) replaced by a stub + the YOUR JOB banner.
4. `js.json`, `rubric.json`, `lesson.mdx`, `exercises.mdx` (10-year-old voice; lean on
   Python they know and the Motion Lab bounce for L3).
5. `npm run validate-class leo-games` until green; flip syllabus week to `published`.
