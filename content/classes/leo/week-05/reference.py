# reference.py — answer key for leo/week-05 (Latches & Flip-Flops).
#
# INERT: never served or built. Used only by `npm run validate-class leo` to
# check tests.json values and to run the teaching graph (the timing waveform)
# against a real solution. The viz steps d_flip_flop by name over a clock.


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


def sr_latch(s, r, q):
    return OR(s, AND(NOT(r), q))


def d_latch(d, enable, q):
    return mux(q, d, enable)


def d_flip_flop(d, clk, clk_prev, q):
    rising = AND(clk, NOT(clk_prev))
    return mux(q, d, rising)
