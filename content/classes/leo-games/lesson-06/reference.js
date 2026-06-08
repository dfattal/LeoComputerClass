// reference.js — answer key for leo-games/lesson-06 (Keeping Score).
//
// INERT: loadLesson.ts only reads the student filenames (lesson.mdx,
// exercises.mdx, tests.json, rubric.json, starter.js, js.json), so this file is
// never served or built. WRITE THIS FIRST, then generate tests.json expected
// values from it: reference.js is the source of truth.
//
// Run `npm run validate-class leo-games` to check tests.json + the preview fns
// against this answer key (it runs reference.js in a node sandbox).

const W = 480, H = 360;

// --- given: everything you've already built (lessons 2–5) ---

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

// helper from L5 — the ball as a box (so overlaps() works on it).
function ballBox(ball) {
  return { x: ball.x - ball.r, y: ball.y - ball.r, w: ball.r * 2, h: ball.r * 2 };
}

// ┌────────────────────────────────────────────────────────────┐
// │  THE LESSON: keep score with an immutable state update        │
// └────────────────────────────────────────────────────────────┘
// The whole game is ONE bundle of numbers (the "state"). Each of these returns a
// brand-NEW state — it never changes the one you handed it. The trick is the
// spread `...state`: "copy every key, then overwrite just the one I name."
function addScore(state, points) { return { ...state, score: state.score + points }; }
function loseLife(state)         { return { ...state, lives: state.lives - 1 }; }
function isGameOver(state)       { return state.lives <= 0; }

// --- given: the game loop calls these for you ---

function init() {
  // The starting world: ball in the middle, paddle near the floor, fresh score,
  // and 3 lives to spend.
  return {
    ball: { x: 240, y: 240, vx: 2.4, vy: -2.4, r: 7 },
    paddle: { x: 200, y: 336, w: 80, h: 12 },
    score: 0,
    lives: 3,
  };
}

function update(state, input) {
  // Game over? Freeze the world — return it exactly as it is.
  if (isGameOver(state)) return state;

  // Move the ball one frame, then bounce it off the four walls.
  let ball = bounce(step(state.ball), W, H);
  // Steer the paddle.
  const paddle = movePaddle(state.paddle, input, W);

  // Start from the old state; we'll layer changes on top with the helpers.
  let next = { ...state, ball: ball, paddle: paddle };

  // Bounce off the paddle (only on the way DOWN) and earn 10 points.
  if (overlaps(ballBox(ball), paddle) && ball.vy > 0) {
    ball = { ...ball, vy: -ball.vy };
    next = addScore({ ...next, ball: ball }, 10);
  }

  // Fell past the floor? Lose a life and put the ball back in the middle.
  if (ball.y - ball.r > H) {
    next = loseLife(next);
    next = { ...next, ball: { x: 240, y: 240, vx: 2.4, vy: -2.4, r: 7 } };
  }

  return next;
}

function render(ctx, state) {
  // Background.
  ctx.fillStyle = "#0b1020";
  ctx.fillRect(0, 0, W, H);

  // Ball.
  const b = state.ball;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
  ctx.fill();

  // Paddle (orange).
  const p = state.paddle;
  ctx.fillStyle = "#fb923c";
  ctx.fillRect(p.x, p.y, p.w, p.h);

  // HUD: score on the left, hearts on the right.
  ctx.fillStyle = "#ffffff";
  ctx.font = "16px sans-serif";
  ctx.textBaseline = "top";
  ctx.textAlign = "left";
  ctx.fillText("SCORE: " + state.score, 10, 8);
  ctx.textAlign = "right";
  ctx.fillText("♥".repeat(state.lives), W - 10, 8);

  // GAME OVER banner.
  if (isGameOver(state)) {
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "32px sans-serif";
    ctx.fillStyle = "#f87171";
    ctx.fillText("GAME OVER", W / 2, H / 2);
  }
}
