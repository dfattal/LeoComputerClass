// reference.js — answer key for leo-games/lesson-08 (Ship It: Your Arcade Game).
//
// INERT: loadLesson.ts only reads the student filenames (lesson.mdx,
// exercises.mdx, tests.json, rubric.json, starter.js, js.json), so this file is
// never served or built. WRITE THIS FIRST, then generate tests.json expected
// values from it: reference.js is the source of truth.
//
// Run `npm run validate-class leo-games` to check tests.json + the preview fns
// against this answer key (it runs reference.js in a node sandbox).

const W = 480, H = 360;

// ===================================================================
//  THE WHOLE TOOLBOX — every helper you built in lessons 2–7, GIVEN.
//  You don't change these. Today you wire them together.
// ===================================================================

// L2 — move the ball one frame by its velocity.
function step(ball) {
  return { x: ball.x + ball.vx, y: ball.y + ball.vy, vx: ball.vx, vy: ball.vy, r: ball.r };
}

// L3 — flip a velocity when the ball reaches a wall (the bounce).
function bounce(ball, width, height) {
  let vx = ball.vx, vy = ball.vy;
  if (ball.x - ball.r <= 0 || ball.x + ball.r >= width) vx = -vx;
  if (ball.y - ball.r <= 0) vy = -vy; // ceiling only — the floor is OPEN (that is why you need a paddle!)
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

// L5 helper — the ball as a box (so overlaps() works on it).
function ballBox(ball) {
  return { x: ball.x - ball.r, y: ball.y - ball.r, w: ball.r * 2, h: ball.r * 2 };
}

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

// L6 — immutable state updates (return a NEW state, never mutate).
function addScore(state, points) { return { ...state, score: state.score + points }; }
function loseLife(state)         { return { ...state, lives: state.lives - 1 }; }
function isGameOver(state)       { return state.lives <= 0; }

// --- given: the starting world for a brand-new game ---
function newGame() {
  return {
    ball: { x: 240, y: 240, vx: 2.4, vy: -2.4, r: 7 },
    paddle: { x: 200, y: 336, w: 80, h: 12 },
    bricks: makeBricks(4, 8),
    score: 0,
    lives: 3,
  };
}

// ┌──────────────────────────────────────────────────────────────┐
// │  THE LESSON: the master update() — one frame of the WHOLE game │
// └──────────────────────────────────────────────────────────────┘
// update() is the conductor. Every frame it calls your instruments in order
// and returns a brand-new state. It NEVER changes the state it was handed.
function update(state, input) {
  // 0) Game over? Freeze — hand back exactly what we got.
  if (isGameOver(state)) return state;

  // 1) Move the ball one step, then bounce it off the walls...
  let ball = bounce(step(state.ball), W, H);
  // ...and steer the paddle with the arrow keys.
  const paddle = movePaddle(state.paddle, input, W);

  // Start a fresh state holding the moved ball + paddle.
  let next = { ball: ball, paddle: paddle, bricks: state.bricks, score: state.score, lives: state.lives };

  // 2) Did the ball land on the paddle (heading down)? Bounce + 10 points.
  if (overlaps(ballBox(next.ball), next.paddle) && next.ball.vy > 0) {
    next = { ...next, ball: { ...next.ball, vy: -next.ball.vy } };
    next = addScore(next, 10);
  }

  // 3) Did the ball hit any bricks? Bounce, remove them, +10 each.
  const box = ballBox(next.ball);
  const hit = next.bricks.filter(function (b) { return overlaps(b, box); });
  if (hit.length > 0) {
    next = { ...next, ball: { ...next.ball, vy: -next.ball.vy }, bricks: removeHit(next.bricks, box) };
    next = addScore(next, 10 * hit.length);
  }

  // 4) Did the ball fall past the floor? Lose a life and reset the ball.
  if (next.ball.y - next.ball.r > H) {
    next = loseLife(next);
    next = { ...next, ball: { x: 240, y: 240, vx: 2.4, vy: -2.4, r: 7 } };
  }

  return next;
}

function render(ctx, state) {
  // Background.
  ctx.fillStyle = "#0b1020";
  ctx.fillRect(0, 0, W, H);

  // Bricks, colored by their row.
  const palette = ["#f87171", "#fb923c", "#fbbf24", "#34d399"];
  for (const b of state.bricks) {
    const row = Math.round((b.y - 30) / 22); // 16 tall + 6 gap = 22 px per row
    ctx.fillStyle = palette[((row % 4) + 4) % 4];
    ctx.fillRect(b.x, b.y, b.w, b.h);
  }

  // Paddle.
  ctx.fillStyle = "#fb923c";
  const p = state.paddle;
  ctx.fillRect(p.x, p.y, p.w, p.h);

  // Ball.
  ctx.fillStyle = "#ffffff";
  const ball = state.ball;
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
  ctx.fill();

  // HUD: score on the left, hearts on the right.
  ctx.fillStyle = "#e5e7eb";
  ctx.font = "16px monospace";
  ctx.textAlign = "left";
  ctx.fillText("SCORE " + state.score, 10, 20);
  ctx.textAlign = "right";
  ctx.fillText("♥".repeat(Math.max(0, state.lives)), W - 10, 20);

  // Banners.
  ctx.textAlign = "center";
  if (isGameOver(state)) {
    ctx.fillStyle = "#f87171";
    ctx.font = "bold 36px monospace";
    ctx.fillText("GAME OVER", W / 2, H / 2);
  } else if (state.bricks.length === 0) {
    ctx.fillStyle = "#34d399";
    ctx.font = "bold 36px monospace";
    ctx.fillText("YOU WIN!", W / 2, H / 2);
  }
}
