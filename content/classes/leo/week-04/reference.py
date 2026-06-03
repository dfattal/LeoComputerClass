# reference.py — answer key for leo/week-04 (Full Adder, Ripple-Carry & Subtraction).
#
# INERT: never served or built. Used only by `npm run validate-class leo` to
# check tests.json values and to run the teaching graph (the adder sweep) against
# a real solution. The viz calls add4 by name.


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


def half_adder(a, b):
    return (XOR(a, b), AND(a, b))


def full_adder(a, b, c_in):
    s1, c1 = half_adder(a, b)
    s, c2 = half_adder(s1, c_in)
    return (s, OR(c1, c2))


def add4(a, b):
    a0, a1, a2, a3 = get_bit(a, 0), get_bit(a, 1), get_bit(a, 2), get_bit(a, 3)
    b0, b1, b2, b3 = get_bit(b, 0), get_bit(b, 1), get_bit(b, 2), get_bit(b, 3)
    s0, c0 = full_adder(a0, b0, 0)
    s1, c1 = full_adder(a1, b1, c0)
    s2, c2 = full_adder(a2, b2, c1)
    s3, c3 = full_adder(a3, b3, c2)
    return (c3 << 4) | (s3 << 3) | (s2 << 2) | (s1 << 1) | s0


def negate4(a):
    b0, b1, b2, b3 = get_bit(a, 0), get_bit(a, 1), get_bit(a, 2), get_bit(a, 3)
    flipped = (NOT(b3) << 3) | (NOT(b2) << 2) | (NOT(b1) << 1) | NOT(b0)
    return add4(flipped, 1) & 0xF


def sub4(a, b):
    return add4(a, negate4(b)) & 0xF
