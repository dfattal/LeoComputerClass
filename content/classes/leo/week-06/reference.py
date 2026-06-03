# reference.py — answer key for leo/week-06 (Registers & Register File).
#
# INERT: never served or built. Used only by `npm run validate-class leo` to
# check tests.json values and to run the teaching graph (the register timing
# waveform) against a real solution. The viz steps reg_bit by name over time.


def AND(a, b):
    return a & b


def OR(a, b):
    return a | b


def NOT(a):
    return 1 - a


def XOR(a, b):
    return OR(AND(a, NOT(b)), AND(NOT(a), b))


def mux(a, b, s):
    return OR(AND(NOT(s), a), AND(s, b))


def get_bit(x, i):
    return (x >> i) & 1


def reg_bit(d, load, q):
    return mux(q, d, load)


def reg4(d, load, q):
    out = 0
    for i in range(4):
        out |= reg_bit(get_bit(d, i), load, get_bit(q, i)) << i
    return out


def mux4(a, b, c, d, s1, s0):
    # A 4-to-1 mux over multi-bit values = a per-bit 4-to-1 mux on each bit.
    out = 0
    for i in range(6):
        top = mux(get_bit(a, i), get_bit(b, i), s0)
        bottom = mux(get_bit(c, i), get_bit(d, i), s0)
        out |= mux(top, bottom, s1) << i
    return out


def reg_file_read(regs, addr):
    s0 = get_bit(addr, 0)
    s1 = get_bit(addr, 1)
    return mux4(regs[0], regs[1], regs[2], regs[3], s1, s0)
