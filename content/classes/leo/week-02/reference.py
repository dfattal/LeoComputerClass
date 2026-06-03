# reference.py — answer key for leo/week-02 (Gates as Circuits).
#
# INERT: never served or built. Used only by `npm run validate-class leo` to
# check tests.json values and to run the teaching graph (the circuit truth-table
# grid) against a real solution. The viz calls mux/majority by name.


def AND(a, b):
    return a & b


def OR(a, b):
    return a | b


def NOT(a):
    return 1 - a


def XOR(a, b):
    return OR(AND(a, NOT(b)), AND(NOT(a), b))


def get_bit(x, i):
    return (x >> i) & 1


def mux(a, b, s):
    return OR(AND(a, NOT(s)), AND(b, s))


def equal2(a, b):
    a0, a1 = get_bit(a, 0), get_bit(a, 1)
    b0, b1 = get_bit(b, 0), get_bit(b, 1)
    return AND(NOT(XOR(a0, b0)), NOT(XOR(a1, b1)))


def majority(a, b, c):
    return OR(OR(AND(a, b), AND(a, c)), AND(b, c))
