// reference.js — answer key for leo-games/lesson-07 (The Brick Wall).
//
// INERT: never served or built (loadLesson.ts reads only the student filenames).
// WRITE THIS FIRST, then generate tests.json expected values from it with node.
// Run `npm run validate-class leo-games` to check it.

const W = 480, H = 360;

// --- given from earlier lessons: complete, you don't change these ---

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

// helper from L5 on — the ball as a box (so overlaps() works on it).
function ballBox(ball) {
  return { x: ball.x - ball.r, y: ball.y - ball.r, w: ball.r * 2, h: ball.r * 2 };
}

// L6 — immutable state updates (return a NEW state, never mutate).
function addScore(state, points) { return { ...state, score: state.score + points }; }
function loseLife(state)         { return { ...state, lives: state.lives - 1 }; }
function isGameOver(state)       { return state.lives <= 0; }

// ┌──────────────────────────────────────────────────────────┐
// │  THE LESSON: build the brick wall, then knock bricks out   │
// └──────────────────────────────────────────────────────────┘
// A wall is just an ARRAY of brick boxes. makeBricks builds the grid with a
// double loop (rows down, columns across). Each brick is a box { x, y, w, h }.
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

// removeHit returns a NEW array with every brick the box touched dropped out.
// .filter KEEPS a brick only when it does NOT overlap the box.
function removeHit(bricks, box) {
  return bricks.filter(function (b) { return !overlaps(b, box); });
}

// --- given: the game loop calls these for you ---
function init() {
  return {
    ball: { x: 240, y: 240, vx: 2.4, vy: -2.4, r: 7 },
    paddle: { x: 200, y: 336, w: 80, h: 12 },
    bricks: makeBricks(4, 8),
    score: 0,
    lives: 3,
  };
}

function update(state, input) {
  // If the game is over, freeze everything.
  if (isGameOver(state)) return state;

  // Move + wall-bounce the ball.
  let ball = bounce(step(state.ball), W, H);
  // Steer the paddle.
  const paddle = movePaddle(state.paddle, input, W);
  let next = { ...state, ball: ball, paddle: paddle };

  // Bounce off the paddle (only on the way down) and grab 10 points.
  if (overlaps(ballBox(ball), paddle) && ball.vy > 0) {
    ball = { ...ball, vy: -ball.vy };
    next = addScore({ ...next, ball: ball }, 10);
  }

  // Brick collisions: which bricks did the ball just touch?
  const bb = ballBox(ball);
  const hit = next.bricks.filter(function (b) { return overlaps(bb, b); });
  if (hit.length > 0) {
    ball = { ...ball, vy: -ball.vy };
    const bricks = removeHit(next.bricks, bb);
    next = addScore({ ...next, ball: ball, bricks: bricks }, 10 * hit.length);
  }

  // Fell past the floor? Lose a life and reset the ball.
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
  const top = 30, h = 16, gapY = 6;
  for (const b of state.bricks) {
    const row = Math.round((b.y - top) / (h + gapY));
    ctx.fillStyle = palette[row % 4];
    ctx.fillRect(b.x, b.y, b.w, b.h);
  }

  // Ball.
  const ball = state.ball;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
  ctx.fill();

  // Paddle.
  const p = state.paddle;
  ctx.fillStyle = "#fb923c";
  ctx.fillRect(p.x, p.y, p.w, p.h);

  // HUD: score on the left, hearts on the right.
  ctx.fillStyle = "#ffffff";
  ctx.font = "14px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("SCORE " + state.score, 10, 18);
  ctx.textAlign = "right";
  ctx.fillText("♥".repeat(Math.max(0, state.lives)), W - 10, 18);

  // Win / lose banners.
  ctx.textAlign = "center";
  if (isGameOver(state)) {
    ctx.font = "bold 32px sans-serif";
    ctx.fillStyle = "#f87171";
    ctx.fillText("GAME OVER", W / 2, H / 2);
  } else if (state.bricks.length === 0) {
    ctx.font = "bold 32px sans-serif";
    ctx.fillStyle = "#34d399";
    ctx.fillText("YOU WIN!", W / 2, H / 2);
  }
}
