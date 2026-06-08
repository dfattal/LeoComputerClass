// reference.js — answer key for leo-games/lesson-02 (The Game Loop).
//
// INERT: never served or built (loadLesson.ts reads only the student filenames).
// WRITE THIS FIRST, then generate tests.json expected values from it with node.
// Run `npm run validate-class leo-games` to check it.

const W = 480, H = 360;

// ┌──────────────────────────────────────────────────┐
// │  THE LESSON: move the ball one frame by its speed  │
// └──────────────────────────────────────────────────┘
// A ball is { x, y, vx, vy, r }: where it is (x, y), how fast it's going each
// frame (vx, vy), and how big it is (r). step() returns a NEW ball nudged by its
// velocity. (No bounce yet — it'll fly right off the screen!)
function step(ball) {
  return { x: ball.x + ball.vx, y: ball.y + ball.vy, vx: ball.vx, vy: ball.vy, r: ball.r };
}

// --- given: the game loop calls these for you ---
function init() {
  return { ball: { x: 240, y: 180, vx: 2.4, vy: 1.8, r: 7 } };
}

function update(state, input) {
  // Each frame: make a new state with the ball moved one step.
  return { ball: step(state.ball) };
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
