// reference.js — answer key for leo-games/lesson-03 (Make It Move).
//
// INERT: never served or built (loadLesson.ts reads only the student filenames).
// WRITE THIS FIRST, then generate tests.json expected values from it with node.
// Run `npm run validate-class leo-games` to check it.

const W = 480, H = 360;

// --- given from last lesson: move the ball one frame by its velocity ---
function step(ball) {
  return { x: ball.x + ball.vx, y: ball.y + ball.vy, vx: ball.vx, vy: ball.vy, r: ball.r };
}

// ┌──────────────────────────────────────────────────┐
// │  THE LESSON: bounce the ball off the walls         │
// └──────────────────────────────────────────────────┘
// When the ball touches a side wall, flip vx (it now goes the other way left↔right).
// When it touches the CEILING (top), flip vy. The floor is OPEN — no bounce there!
// "Flip" just means multiply by -1 — the SAME bounce trick from Motion Lab.
function bounce(ball, width, height) {
  let vx = ball.vx, vy = ball.vy;
  if (ball.x - ball.r <= 0 || ball.x + ball.r >= width) vx = -vx;
  if (ball.y - ball.r <= 0) vy = -vy; // ceiling only — the floor is OPEN (that is why you need a paddle!)
  return { x: ball.x, y: ball.y, vx: vx, vy: vy, r: ball.r };
}

// --- given: the game loop calls these for you ---
function init() {
  return { ball: { x: 240, y: 180, vx: 2.4, vy: 1.8, r: 7 } };
}

function update(state, input) {
  // Each frame: step the ball, then bounce it off the walls + ceiling.
  let ball = bounce(step(state.ball), W, H);
  // The floor is OPEN — if the ball drops out the bottom, pop it back to the middle.
  if (ball.y - ball.r > H) ball = { x: 240, y: 180, vx: 2.4, vy: -2.4, r: 7 };
  return { ball: ball };
}

function render(ctx, state) {
  ctx.fillStyle = "#0b1020";
  ctx.fillRect(0, 0, W, H);
  const b = state.ball;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
  ctx.fill();
}
