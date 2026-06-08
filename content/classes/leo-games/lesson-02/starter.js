// The Game Loop 🔁
// A game is a flip-book: 60 times a second the computer does UPDATE (change the
// numbers) then RENDER (draw the picture). Fast pictures = motion!

const W = 480, H = 360;

// ┌──────────────────────────────────────────────────┐
// │  YOUR JOB: move the ball one frame by its speed 👇 │
// └──────────────────────────────────────────────────┘
// A ball is { x, y, vx, vy, r }: its position (x, y), its velocity per frame
// (vx, vy), and its size (r). Return a NEW ball nudged by its velocity:
//   x goes to x + vx, and y goes to y + vy. (Keep vx, vy, and r the same.)
function step(ball) {
  // return { x: ..., y: ..., vx: ball.vx, vy: ball.vy, r: ball.r };
}

// --- given: the game loop calls these for you (you don't need to change them) ---
function init() {
  // The starting world: one ball in the middle, drifting right and down.
  return { ball: { x: 240, y: 180, vx: 2.4, vy: 1.8, r: 7 } };
}

function update(state, input) {
  // Each frame, make a new world with the ball moved one step.
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
