# reference.py — answer key for dsa/lesson-01 (How Fast Is Fast?).
#
# INERT: loadLesson.ts only reads the student filenames (lesson.mdx,
# exercises.mdx, tests.json, rubric.json, starter.py, viz.json), so this file is
# never served or built. WRITE THIS FIRST, then generate tests.json + viz.json
# from it with the scratchpad gen_lesson.py. reference.py is the source of truth.
#
# Big idea: speed is a NUMBER you can count. Some jobs cost the SAME no matter how
# big the pile is (grab the first box → 1 step). Others cost MORE as the pile
# grows (look at every box → n steps). We return that step-count as an int, then
# plot it: a flat line vs a line that climbs.


def constant_steps(n):
    # Grabbing the FIRST box takes one step — it doesn't matter if there are 3
    # boxes or three million. So the answer is always 1.
    steps = 0
    steps += 1
    return steps


def linear_steps(n):
    # Looking at EVERY box takes one step each. With n boxes, that's n steps.
    steps = 0
    for _ in range(n):
        steps += 1
    return steps


# === PAINTER START ===
# Hidden producer (the student never sees this). It calls the student's OWN
# constant_steps and linear_steps for N = 1..n_max and returns two curves: a flat
# line (always 1) and a climbing line (n). A wrong function draws a wrong line.
# Falls back to a plain n-line so the panel is never blank.
def __series(fn, n_max):
    pts = []
    for n in range(1, n_max + 1):
        y = fn(n)
        if not isinstance(y, (int, float)) or isinstance(y, bool):
            return None
        pts.append([n, y])
    return pts


def __plot(n_max):
    series = []
    flat = None
    slant = None
    try:
        flat = __series(constant_steps, n_max)
    except Exception:
        flat = None
    try:
        slant = __series(linear_steps, n_max)
    except Exception:
        slant = None
    if flat:
        series.append({"name": "constant — always 1 step", "points": flat, "highlight": False})
    if slant:
        series.append({"name": "linear — n steps (climbs!)", "points": slant, "highlight": True})
    if not series:
        series.append({"name": "linear — n steps", "points": [[n, n] for n in range(1, n_max + 1)], "highlight": True})
    return series
# === PAINTER END ===


# --- inert spec blocks read by gen_lesson.py (expected values filled from above) ---
TESTS_SPEC = [
    {
        "entry": "constant_steps",
        "cases": [
            {"name": "constant_steps(1)", "args": [1]},
            {"name": "constant_steps(7)", "args": [7]},
            {"name": "constant_steps(100)", "args": [100]},
            {"name": "constant_steps(1000000) — even a million boxes", "args": [1000000]},
        ],
    },
    {
        "entry": "linear_steps",
        "cases": [
            {"name": "linear_steps(1)", "args": [1]},
            {"name": "linear_steps(5)", "args": [5]},
            {"name": "linear_steps(100)", "args": [100]},
            {"name": "linear_steps(0) — nothing to do", "args": [0]},
        ],
    },
]

VIZ_SPEC = {
    "type": "plot",
    "title": "Same job, two costs — a flat line vs a line that climbs with N",
    "xLabel": "N — how big the job is",
    "yLabel": "steps it takes",
    "resultFn": "__plot",
    "demoArgs": [20],
    "caption": {
        "todo": "Finish constant_steps and linear_steps to draw both lines.",
        "tuning": "Your lines are showing — keep tuning until both match the answer.",
        "match": "✅ A flat line and a climbing line — that's O(1) vs O(n)!",
        "checks": [
            {"fn": "constant_steps", "args": [10]},
            {"fn": "linear_steps", "args": [10]},
        ],
    },
}
