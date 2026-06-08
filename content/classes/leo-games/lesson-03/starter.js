// Make It Move 🏓
// Last lesson your ball flew off the screen. Today you teach it to BOUNCE: when it
// reaches a wall, flip its speed so it heads back the other way. Same trick as the
// bounces you coded in Motion Lab — a bounce is just vx = -vx (or vy = -vy)!

const W = 480, H = 360;

// --- given from last lesson: move the ball one frame by its velocity ---
function step(ball) {
  return { x: ball.x + ball.vx, y: ball.y + ball.vy, vx: ball.vx, vy: ball.vy, r: ball.r };
}

// ┌─────────────────────────────────────────────┐
// │  YOUR JOB: bounce the ball off the walls 👇  │
// └─────────────────────────────────────────────┘
// The ball is { x, y, vx, vy, r }. Start with its current speed, then:
//   • if it touched a SIDE wall (x - r <= 0  OR  x + r >= width), flip vx.
//   • if it touched the CEILING / top (y - r <= 0), flip vy.
// There is NO floor wall — the bottom is open on purpose (your paddle goes there
// next lesson!). "Flip" means multiply by -1. Return a NEW ball with the new speed.
function bounce(ball, width, height) {
  // let vx = ball.vx, vy = ball.vy;
  // if (...) vx = -vx;
  // if (...) vy = -vy;
  // return { x: ball.x, y: ball.y, vx: vx, vy: vy, r: ball.r };
}

// --- given: the game loop calls these for you (you don't need to change them) ---
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
