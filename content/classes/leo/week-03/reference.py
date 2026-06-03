# reference.py — answer key for leo/week-03 (Binary Numbers & The Half Adder).
#
# INERT: never served or built. Used only by `npm run validate-class leo` to
# check tests.json values and to run the teaching graph (the binary-counter grid)
# against a real solution. The viz calls decimal_to_4bit by name.


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


def bits_to_decimal(b3, b2, b1, b0):
    return (b3 << 3) | (b2 << 2) | (b1 << 1) | b0


def half_adder(a, b):
    return (XOR(a, b), AND(a, b))


def decimal_to_4bit(x):
    return (get_bit(x, 3), get_bit(x, 2), get_bit(x, 1), get_bit(x, 0))
