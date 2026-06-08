// The Canvas — welcome to JavaScript! 🎮
// The screen is graph paper: (0, 0) is the TOP-LEFT corner, and y grows DOWNWARD.
// A "box" is four numbers: { x, y, w, h } — its top-left corner plus its size.

// 1) Return the x-coordinate of a box's RIGHT edge.
//    Hint: the left edge is box.x, and the box is box.w wide.
function rightEdge(box) {
  // return ...
}

// 2) Return true only if the whole box fits inside the canvas.
//    It must not poke off the left/top (x or y below 0) or off the
//    right/bottom (x + w past width, or y + h past height).
function isOnScreen(box, width, height) {
  // return ...
}

// 3) Draw your scene! `ctx` is the paintbrush. Two spells to know:
//      ctx.fillStyle = "orange";          // pick a color
//      ctx.fillRect(x, y, width, height); // paint a filled box
//    Paint a background, then a paddle near the bottom, then a ball.
function render(ctx) {
  ctx.fillStyle = "#0b1020";
  ctx.fillRect(0, 0, 480, 360); // the background fills the whole screen

  // Your turn: draw an orange paddle and a white ball.
}
