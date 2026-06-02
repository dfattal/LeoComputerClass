# reference.py — answer key for leo/week-01 (Boolean Algebra & Truth Tables).
#
# INERT: never served or built. Used only by `npm run validate-class leo` to
# check tests.json values and to run the teaching graph (the truth-table grid)
# against a real solution. The viz calls AND/OR/XOR/NOT by name.


def AND(a, b):
    return a & b


def OR(a, b):
    return a | b


def NOT(a):
    return 1 - a


def XOR(a, b):
    return OR(AND(a, NOT(b)), AND(NOT(a), b))
