# reference.py — answer key for pixels/lesson-07 (Do It Again).
#
# INERT: never served or built. Write this FIRST, then generate tests.json
# expected values from it. Run `npm run validate-class pixels` to check.
#
# The big idea: a LOOP repeats work for you. A loop inside a loop fills a whole
# grid — a few lines do what would take a hundred by hand.


def row_of(color, n):
    # Build one row by adding a square n times with a loop.
    row = []
    for i in range(n):
        row.append(color)
    return [row]


def checkerboard(n):
    # A loop inside a loop walks every square of an n-by-n grid.
    # For each square we DECIDE its color from its position (like last lesson).
    grid = []
    for r in range(n):
        row = []
        for c in range(n):
            if (r + c) % 2 == 0:
                row.append("black")
            else:
                row.append("white")
        grid.append(row)
    return grid
