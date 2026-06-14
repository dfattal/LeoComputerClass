# reference.py — answer key for leo/week-08 (ALU Flags).
#
# INERT: never served or built. Used only by `npm run validate-class leo` to
# check tests.json values and to run the teaching graph (the flag lamps) against
# a real solution. The viz calls the flag functions by name.

# --- given helpers (gates + adders, as in week 7) ---


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


# --- the exercises the student writes this week ---


def zero_flag(result):
    # 1 when every bit of the 4-bit result is 0. NOR of all four bits.
    b0 = get_bit(result, 0)
    b1 = get_bit(result, 1)
    b2 = get_bit(result, 2)
    b3 = get_bit(result, 3)
    any_one = OR(OR(b0, b1), OR(b2, b3))
    return NOT(any_one)


def carry_flag(a, b):
    # The 5th bit that falls out of a 4-bit add — the unsigned "it didn't fit".
    return get_bit(add4(a, b), 4)


def negative_flag(result):
    # In two's complement the top bit IS the sign. Bit 3 of a 4-bit number.
    return get_bit(result, 3)


def overflow_flag(a, b):
    # Signed overflow: both inputs the same sign, but the result flipped sign.
    result = add4(a, b) & 0xF
    sa = get_bit(a, 3)
    sb = get_bit(b, 3)
    sr = get_bit(result, 3)
    same_sign = NOT(XOR(sa, sb))
    result_flipped = XOR(sa, sr)
    return AND(same_sign, result_flipped)
