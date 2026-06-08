// reference.js — answer key for leo-games/lesson-01 (The Canvas).
//
// INERT: loadLesson.ts only reads the student filenames (lesson.mdx,
// exercises.mdx, tests.json, rubric.json, starter.js, js.json), so this file is
// never served or built. WRITE THIS FIRST, then generate tests.json expected
// values from it: reference.js is the source of truth.
//
// Run `npm run validate-class leo-games` to check tests.json + the preview fns
// against this answer key (it runs reference.js in a node sandbox).

// A box on the screen is just four numbers: x, y, width, height. The TOP-LEFT
// corner is (x, y), so the right edge sits at x + w.
function rightEdge(box) {
  return box.x + box.w;
}

// A box is "on screen" only if it is fully inside the canvas: its left/top can't
// be off the left/top edges, and its right/bottom can't poke past width/height.
// (Remember: (0, 0) is the top-left and y grows DOWNWARD.)
function isOnScreen(box, width, height) {
  return (
    box.x >= 0 &&
    box.y >= 0 &&
    box.x + box.w <= width &&
    box.y + box.h <= height
  );
}

// The live game canvas calls this once to paint the scene (js.json preview).
function render(ctx) {
  // Dark "space" background.
  ctx.fillStyle = "#0b1020";
  ctx.fillRect(0, 0, 480, 360);
  // The paddle: an orange box near the bottom.
  ctx.fillStyle = "#fb923c";
  ctx.fillRect(200, 330, 80, 14);
  // The ball: a small white square in the middle.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(235, 175, 10, 10);
}
