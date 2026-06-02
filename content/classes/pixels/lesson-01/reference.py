# reference.py — answer key for pixels/lesson-01 (Hello, Pixels!).
#
# INERT: never served or built. Write this FIRST, then generate tests.json
# expected values from it. Run `npm run validate-class pixels` to check.
#
# A "picture" is a grid: a list of ROWS, and each row is a list of CELLS.
# A cell is a color word like "red", or "" for an empty (see-through) square.


def hello_pixel():
    # One red square: a grid with one row that holds one cell.
    return [["red"]]


def rainbow():
    # One row with six colored squares, side by side.
    return [["red", "orange", "yellow", "green", "blue", "purple"]]
