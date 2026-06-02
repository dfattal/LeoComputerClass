# reference.py — answer key for pixels/lesson-06 (Making Choices).
#
# INERT: never served or built. Write this FIRST, then generate tests.json
# expected values from it. Run `npm run validate-class pixels` to check.
#
# The big idea: if/else lets the computer DECIDE. It looks at the input and
# picks what to give back — so the same function can make different pictures.


def light(on):
    # A lamp. If it's on, give back a yellow square; if not, a black one.
    if on:
        return [["yellow"]]
    else:
        return [["black"]]


def tile(n):
    # Even numbers get a white square, odd numbers get a black one.
    # n % 2 is the leftover after dividing by 2: it's 0 for even numbers.
    if n % 2 == 0:
        return [["white"]]
    else:
        return [["black"]]
