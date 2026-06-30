# reference.py — answer key for dsa/lesson-03 (Binary Search).
#
# INERT: never served or built. Source of truth; gen_lesson.py reads TESTS_SPEC /
# VIZ_SPEC + the painter to emit tests.json + viz.json.
#
# Big idea: if the list is SORTED, you don't have to check every box. Look in the
# middle: too big? throw away the right half. Too small? throw away the left half.
# Every guess deletes HALF of what's left. We count those guesses and plot them
# against linear search — a nearly-flat O(log n) curve crushing the O(n) line.


def binary_search(sorted_arr, target):
    lo = 0
    hi = len(sorted_arr) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if sorted_arr[mid] == target:
            return mid
        elif sorted_arr[mid] < target:
            lo = mid + 1   # target is bigger -> keep the right half
        else:
            hi = mid - 1   # target is smaller -> keep the left half
    return -1


def binary_steps(sorted_arr, target):
    # Count how many times we look at a middle box before we finish.
    steps = 0
    lo = 0
    hi = len(sorted_arr) - 1
    while lo <= hi:
        steps += 1
        mid = (lo + hi) // 2
        if sorted_arr[mid] == target:
            return steps
        elif sorted_arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return steps


# === PAINTER START ===
# Hidden producer: the WORST-case step-count for lists of size 1..n_max. The
# straight "linear" line (n) is a fixed comparison; the "binary" line comes from
# the student's OWN binary_steps and should stay nearly flat (O(log n)).
def __binary_curve(n_max):
    pts = []
    for n in range(1, n_max + 1):
        arr = list(range(n))
        s = binary_steps(arr, -1)  # -1 is never present -> worst case
        if not isinstance(s, int) or isinstance(s, bool):
            return None
        pts.append([n, s])
    return pts


def __plot(n_max):
    linear = [[n, n] for n in range(1, n_max + 1)]
    binary = None
    try:
        binary = __binary_curve(n_max)
    except Exception:
        binary = None
    series = [{"name": "linear search — check every box (O(n))", "points": linear, "highlight": False}]
    if binary:
        series.append({"name": "binary search — halve each guess (O(log n))", "points": binary, "highlight": True})
    return series
# === PAINTER END ===


TESTS_SPEC = [
    {
        "entry": "binary_search",
        "cases": [
            {"name": "binary_search([1, 3, 5, 7, 9, 11], 7)", "args": [[1, 3, 5, 7, 9, 11], 7]},
            {"name": "binary_search([1, 3, 5, 7, 9, 11], 1) — first", "args": [[1, 3, 5, 7, 9, 11], 1]},
            {"name": "binary_search([1, 3, 5, 7, 9, 11], 11) — last", "args": [[1, 3, 5, 7, 9, 11], 11]},
            {"name": "binary_search([1, 3, 5, 7, 9, 11], 4) — missing", "args": [[1, 3, 5, 7, 9, 11], 4]},
            {"name": "binary_search([42], 42) — single item", "args": [[42], 42]},
            {"name": "binary_search([], 4) — empty list", "args": [[], 4]},
        ],
    },
    {
        "entry": "binary_steps",
        "cases": [
            {"name": "binary_steps([1..7], 4) — bullseye, the middle", "args": [[1, 2, 3, 4, 5, 6, 7], 4]},
            {"name": "binary_steps([1..7], 1) — corner", "args": [[1, 2, 3, 4, 5, 6, 7], 1]},
            {"name": "binary_steps([1..7], 8) — missing", "args": [[1, 2, 3, 4, 5, 6, 7], 8]},
            {"name": "binary_steps(8 items, 10) — far corner", "args": [[10, 20, 30, 40, 50, 60, 70, 80], 10]},
        ],
    },
]

VIZ_SPEC = {
    "type": "plot",
    "title": "Binary vs linear — halving the haystack barely grows with N",
    "xLabel": "N — how many boxes in the row",
    "yLabel": "boxes you open (worst case)",
    "resultFn": "__plot",
    "demoArgs": [64],
    "caption": {
        "todo": "Finish binary_steps to draw the binary-search curve.",
        "tuning": "Your curve is showing — keep tuning binary_steps to match the answer.",
        "match": "✅ A nearly-flat curve way under the straight line — that's O(log n)!",
        "checks": [
            {"fn": "binary_steps", "args": [[1, 2, 3, 4, 5, 6, 7], 1]},
            {"fn": "binary_steps", "args": [[1, 2, 3, 4, 5, 6, 7], 8]},
        ],
    },
}
