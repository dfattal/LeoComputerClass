# reference.py — answer key for pixels/lesson-03 (Numbers & Counting).
#
# INERT: never served or built. Write this FIRST, then generate tests.json
# expected values from it. Run `npm run validate-class pixels` to check.
#
# The big idea: numbers let the computer do the counting. ["green"] * n makes a
# list with n copies of "green" — so the picture's size comes from a number.


def bar(n):
    # One row with n green squares. The computer copies "green" n times for us.
    return [["green"] * n]


def arrow(n):
    # n empty squares, then one red square at the end.
    # Joining two lists with + puts them side by side.
    return [[""] * n + ["red"]]
