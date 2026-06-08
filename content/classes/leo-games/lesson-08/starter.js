// Ship It: Your Arcade Game 🎉
// This is it — the finale. Every helper you built in lessons 2–7 is right here,
// finished and ready. Your job is to write ONE function: the master update().
// It's the conductor that calls all your instruments to play one frame.

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
// │  YOUR JOB: write the master update() — one frame of the game 👇 │
// └──────────────────────────────────────────────────────────────┘
// update() is the conductor. Each frame it calls your helpers in order and
// returns a BRAND-NEW state. Never change the state you were handed.
//
// Do these steps, in order, then `return` the new state:
//   0) If isGameOver(state) is true, just `return state` — the game is frozen.
//   1) Move + wall-bounce the ball:  let ball = bounce(step(state.ball), W, H);
//      Steer the paddle:             const paddle = movePaddle(state.paddle, input, W);
//      Start a fresh state, e.g.:
//        let next = { ball: ball, paddle: paddle, bricks: state.bricks,
//                     score: state.score, lives: state.lives };
//   2) Paddle bounce: if overlaps(ballBox(next.ball), next.paddle) AND
//      next.ball.vy > 0, flip the ball's vy and addScore(next, 10).
//   3) Brick hits: find the bricks the ball touches. If there are any, flip the
//      ball's vy, removeHit() them, and addScore(next, 10 * howMany).
//   4) Floor: if next.ball.y - next.ball.r > H, loseLife(next) and reset the
//      ball to { x: 240, y: 240, vx: 2.4, vy: -2.4, r: 7 }.
//   5) return next;
function update(state, input) {
  // Your conductor goes here. Keep the state keys in this order:
  //   ball, paddle, bricks, score, lives.
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
