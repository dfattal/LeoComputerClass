# reference.py — answer key for pixels/lesson-05 (Spells with Inputs).
#
# INERT: never served or built. Write this FIRST, then generate tests.json
# expected values from it. Run `npm run validate-class pixels` to check.
#
# The big idea: a PARAMETER is a blank the caller fills in. One recipe, many
# pictures — instead of a separate function for every color and size.


def bar(color, n):
    # Same idea as last lesson's bar, but now the COLOR is a blank too.
    # bar("red", 3) -> a row of 3 red squares.
    return [[color] * n]


def dot(color):
    # A 3x3 picture with one colored square in the middle. The color is yours.
    return [
        ["", "", ""],
        ["", color, ""],
        ["", "", ""],
    ]
