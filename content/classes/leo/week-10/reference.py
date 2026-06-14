# reference.py — answer key for leo/week-10 (Tiny CPU Capstone).
#
# INERT: never served or built. Used only by `npm run validate-class leo` to
# check tests.json values and to run the teaching graph (the register timeline)
# against a real solution. The viz calls run_trace by name.

# --- given helpers: the WHOLE machine so far — gates, adders, ALU, decode,
#     execute. The student is handed all of this and writes only run/run_trace. ---


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


def mux4(a, b, c, d, s1, s0):
    out = 0
    for i in range(6):
        top = mux(get_bit(a, i), get_bit(b, i), s0)
        bottom = mux(get_bit(c, i), get_bit(d, i), s0)
        out |= mux(top, bottom, s1) << i
    return out


def and4(a, b):
    out = 0
    for i in range(4):
        out |= AND(get_bit(a, i), get_bit(b, i)) << i
    return out


def or4(a, b):
    out = 0
    for i in range(4):
        out |= OR(get_bit(a, i), get_bit(b, i)) << i
    return out


def alu(a, b, op):
    add_result = add4(a, b) & 0xF
    sub_result = sub4(a, b)
    and_result = and4(a, b)
    or_result = or4(a, b)
    s0 = get_bit(op, 0)
    s1 = get_bit(op, 1)
    return mux4(add_result, sub_result, and_result, or_result, s1, s0)


def get_opcode(instr):
    return (instr >> 6) & 3


def get_dest(instr):
    return (instr >> 4) & 3


def get_srcA(instr):
    return (instr >> 2) & 3


def get_srcB(instr):
    return instr & 3


def execute(regs, instr):
    op = get_opcode(instr)
    dest = get_dest(instr)
    a = get_srcA(instr)
    b = get_srcB(instr)
    result = alu(regs[a], regs[b], op)
    new_regs = list(regs)
    new_regs[dest] = result
    return new_regs


# --- the exercises the student writes this week ---


def run(program, regs):
    # Fetch-decode-execute, over and over. Run each instruction in order,
    # threading the register list forward, and return the FINAL registers.
    for instr in program:
        regs = execute(regs, instr)
    return regs


def run_trace(program, regs):
    # Same loop, but record a snapshot of the registers after EACH step (and the
    # starting state first), so we can watch the computer think.
    trace = [list(regs)]
    for instr in program:
        regs = execute(regs, instr)
        trace.append(list(regs))
    return trace
