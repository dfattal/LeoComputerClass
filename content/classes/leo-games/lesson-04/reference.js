// reference.js — answer key for leo-games/lesson-04 (You're in Control).
//
// INERT: never served or built (loadLesson.ts reads only the student filenames).
// WRITE THIS FIRST, then generate tests.json expected values from it with node.
// Run `npm run validate-class leo-games` to check it.

const W = 480, H = 360;

// --- given: from earlier lessons (complete) ---
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

// ┌──────────────────────────────────────────────────────────┐
// │  THE LESSON: steer the paddle, then keep it on the canvas  │
// └──────────────────────────────────────────────────────────┘
// A paddle is a box { x, y, w, h }. input.keys tells us which arrow keys are
// held down RIGHT NOW. Slide the paddle left/right by `speed`, then CLAMP its x
// so it can never leave the canvas (x stays between 0 and width - w).
function movePaddle(paddle, input, width) {
  let x = paddle.x;
  const speed = 6;
  if (input.keys["ArrowLeft"]) x -= speed;
  if (input.keys["ArrowRight"]) x += speed;
  if (x < 0) x = 0;
  if (x + paddle.w > width) x = width - paddle.w;
  return { x: x, y: paddle.y, w: paddle.w, h: paddle.h };
}

// --- given: the game loop calls these for you ---
function init() {
  return {
    ball: { x: 240, y: 180, vx: 2.4, vy: 1.8, r: 7 },
    paddle: { x: 200, y: 336, w: 80, h: 12 },
  };
}

function update(state, input) {
  // Each frame: bounce the ball off the walls + ceiling, and steer the paddle.
  let ball = bounce(step(state.ball), W, H);
  // The floor is OPEN — if the ball drops out, pop it back (your paddle cannot catch it yet!).
  if (ball.y - ball.r > H) ball = { x: 240, y: 180, vx: 2.4, vy: -2.4, r: 7 };
  return { ball: ball, paddle: movePaddle(state.paddle, input, W) };
}

function render(ctx, state) {
  ctx.fillStyle = "#0b1020";
  ctx.fillRect(0, 0, W, H);
  // the ball — a white circle.
  const b = state.ball;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
  ctx.fill();
  // the paddle — an orange box.
  const p = state.paddle;
  ctx.fillStyle = "#fb923c";
  ctx.fillRect(p.x, p.y, p.w, p.h);
}
