# reference.py — answer key for dsa/lesson-05 (Recursion).
#
# INERT: never served or built. Source of truth; gen_lesson.py reads TESTS_SPEC /
# VIZ_SPEC + the painter to emit tests.json + viz.json.
#
# Big idea: a RECURSIVE function calls ITSELF on a smaller problem. It needs two
# parts: a BASE CASE (the smallest problem, answered directly with no more calls)
# and a RECURSIVE STEP (do a little, then call yourself on something smaller). The
# unfinished calls pile up on the CALL STACK, then unwind. The call stack is a
# stack — exactly the LIFO pile from last lesson.


def countdown(n):
    # Base case: nothing left to count down from.
    if n == 0:
        return []
    # Recursive step: this number, then the countdown of everything smaller.
    return [n] + countdown(n - 1)


def factorial(n):
    # Base case: 0! is 1.
    if n == 0:
        return 1
    # Recursive step: n times the factorial of one less.
    return n * factorial(n - 1)


def sum_to(n):
    # Base case: the sum up to 0 is 0.
    if n == 0:
        return 0
    # Recursive step: n plus the sum of everything below it.
    return n + sum_to(n - 1)


# === PAINTER START ===
# Hidden painter: a film strip of the CALL STACK while countdown(n) runs. It
# drives off the student's OWN countdown — each value it returns is one stacked
# call. The stack GROWS as calls are made (top frame = orange), hits the base
# case (green), then UNWINDS frame by frame. A broken countdown falls back to a
# reference triangle so the canvas is never blank.
WAIT = "purple"   # a paused call, waiting for the one above it to finish
TOP = "orange"    # the call running right now (top of the stack)
BASE = "green"    # the base case — the bottom, where the recursion stops


def __triangle(depth):
    width = depth + 1
    snaps = [0]                      # start: empty stack
    for d in range(1, depth + 1):    # grow: push each call
        snaps.append(d)
    snaps.append(depth + 1)          # push the base-case frame
    for d in range(depth, -1, -1):   # unwind: pop back down to empty
        snaps.append(d)
    grid = []
    for height in snaps:
        row = []
        for j in range(width + 1):
            if j < height:
                if j == height - 1:
                    # top frame: base case if it's the deepest push, else running
                    row.append(BASE if height == depth + 1 else TOP)
                else:
                    row.append(WAIT)
            else:
                row.append("")
        grid.append(row)
    return grid


def __show_callstack(n=4):
    try:
        vals = countdown(n)
        if isinstance(vals, list) and len(vals) == n:
            return __triangle(len(vals))
    except Exception:
        pass
    return __triangle(n)
# === PAINTER END ===


TESTS_SPEC = [
    {
        "entry": "countdown",
        "cases": [
            {"name": "countdown(4)", "args": [4]},
            {"name": "countdown(1)", "args": [1]},
            {"name": "countdown(0) — the base case", "args": [0]},
        ],
    },
    {
        "entry": "factorial",
        "cases": [
            {"name": "factorial(0) — base case is 1", "args": [0]},
            {"name": "factorial(1)", "args": [1]},
            {"name": "factorial(4)", "args": [4]},
            {"name": "factorial(5)", "args": [5]},
        ],
    },
    {
        "entry": "sum_to",
        "cases": [
            {"name": "sum_to(0) — base case is 0", "args": [0]},
            {"name": "sum_to(1)", "args": [1]},
            {"name": "sum_to(5)", "args": [5]},
            {"name": "sum_to(10)", "args": [10]},
        ],
    },
]

VIZ_SPEC = {
    "type": "draw",
    "title": "The call stack of countdown(4) — calls pile up, hit the base case, then unwind",
    "resultFn": "__show_callstack",
    "demoArgs": [4],
}
