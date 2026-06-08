// reference.js — answer key for leo-games/lesson-05 (Crash!).
//
// INERT: never served or built (loadLesson.ts reads only the student filenames).
// WRITE THIS FIRST, then generate tests.json expected values from it with node.
// Run `npm run validate-class leo-games` to check it.

const W = 480, H = 360;

// --- given: things you already built in earlier lessons ---

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

// helper: the ball as a box (so overlaps() works on it).
function ballBox(ball) {
  return { x: ball.x - ball.r, y: ball.y - ball.r, w: ball.r * 2, h: ball.r * 2 };
}

// ┌──────────────────────────────────────────────────┐
// │  THE LESSON: do two boxes overlap? (the referee)   │
// └──────────────────────────────────────────────────┘
// Two boxes crash ONLY if they overlap on the x-axis AND on the y-axis.
// Each box is { x, y, w, h }. Return true if they touch, false if they miss.
function overlaps(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

// --- given: the game loop calls these for you ---
function init() {
  return {
    ball: { x: 240, y: 180, vx: 2.4, vy: 1.8, r: 7 },
    paddle: { x: 200, y: 336, w: 80, h: 12 },
  };
}

function update(state, input) {
  // 1. Move the ball one step, then bounce it off the four walls.
  const moved = bounce(step(state.ball), W, H);
  // 2. Steer the paddle with the arrow keys.
  const paddle = movePaddle(state.paddle, input, W);
  // 3. Did the ball crash into the paddle while heading DOWN? Bounce it back up.
  let ball = moved;
  if (overlaps(ballBox(ball), paddle) && ball.vy > 0) {
    ball = { ...ball, vy: -ball.vy };
  }
  // Missed it? The floor is OPEN, so pop the ball back to the middle.
  if (ball.y - ball.r > H) ball = { x: 240, y: 180, vx: 2.4, vy: -2.4, r: 7 };
  return { ball: ball, paddle: paddle };
}

function render(ctx, state) {
  ctx.fillStyle = "#0b1020";
  ctx.fillRect(0, 0, W, H);
  // The ball: a small white circle.
  const b = state.ball;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
  ctx.fill();
  // The paddle: an orange box near the bottom.
  const p = state.paddle;
  ctx.fillStyle = "#fb923c";
  ctx.fillRect(p.x, p.y, p.w, p.h);
}
