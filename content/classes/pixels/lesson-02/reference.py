# reference.py — answer key for pixels/lesson-02 (Boxes That Remember).
#
# INERT: never served or built. Write this FIRST, then generate tests.json
# expected values from it. Run `npm run validate-class pixels` to check.
#
# The big idea: store a color in a VARIABLE (a named box). Then you can build a
# whole picture out of that one box — and change the picture by changing the box.


def my_square():
    # One box named c holds the color. The whole 2x2 square uses c.
    # Change "purple" to any color and ALL four squares change at once.
    c = "purple"
    return [[c, c], [c, c]]


def two_tone():
    # Two boxes, a and b. We reuse them to make a striped row: a, b, a, b.
    a = "black"
    b = "yellow"
    return [[a, b, a, b]]
