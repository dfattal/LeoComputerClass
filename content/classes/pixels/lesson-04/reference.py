# reference.py — answer key for pixels/lesson-04 (Magic Spells).
#
# INERT: never served or built. Write this FIRST, then generate tests.json
# expected values from it. Run `npm run validate-class pixels` to check.
#
# The big idea: write a recipe ONCE, give it a name, then CALL it whenever you
# need it — instead of copy-pasting the same squares over and over.


def blank_row():
    # One row of five empty squares. Write it once, reuse it everywhere.
    return ["", "", "", "", ""]


def face():
    # A 5x5 smiley. We CALL blank_row() for the empty rows instead of retyping
    # ["", "", "", "", ""] again and again.
    eyes = ["", "black", "", "black", ""]
    mouth_ends = ["black", "", "", "", "black"]
    smile = ["", "black", "black", "black", ""]
    return [blank_row(), eyes, blank_row(), mouth_ends, smile]
