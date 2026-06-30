# reference.py — answer key for dsa/lesson-02 (Linear Search).
#
# INERT: never served or built. Source of truth; gen_lesson.py reads TESTS_SPEC /
# VIZ_SPEC + the painter to emit tests.json + viz.json.
#
# Big idea: to find something in a row of boxes, the simplest plan is to check
# every box from the start until you find it (or run out). That's LINEAR SEARCH.
# We return the index where we found it (or -1), AND a step-counter that returns
# how many boxes we had to open. Plot that count: it climbs straight up with N.


def linear_search(arr, target):
    # Walk the list from the front; return the first index that matches.
    for i in range(len(arr)):
        if arr[i] == target:
            return i
    return -1


def search_steps(arr, target):
    # Count how many boxes we open. We stop the moment we find the target; if it
    # isn't there, we end up opening all of them.
    steps = 0
    for i in range(len(arr)):
        steps += 1
        if arr[i] == target:
            return steps
    return steps


# === PAINTER START ===
# Hidden producer: plots the WORST case (target not in the list) for lists of
# size 1..n_max, using the student's OWN search_steps. The line climbs straight
# up with N — that's O(n). Falls back to a plain n-line so it's never blank.
def __linear_curve(n_max):
    pts = []
    for n in range(1, n_max + 1):
        arr = list(range(n))
        s = search_steps(arr, -1)  # -1 is never in [0..n-1] -> worst case
        if not isinstance(s, int) or isinstance(s, bool):
            return None
        pts.append([n, s])
    return pts


def __plot(n_max):
    curve = None
    try:
        curve = __linear_curve(n_max)
    except Exception:
        curve = None
    if not curve:
        curve = [[n, n] for n in range(1, n_max + 1)]
    return [{"name": "linear search — steps in the worst case", "points": curve, "highlight": True}]
# === PAINTER END ===


TESTS_SPEC = [
    {
        "entry": "linear_search",
        "cases": [
            {"name": "linear_search([5, 8, 2, 9], 2) — middle", "args": [[5, 8, 2, 9], 2]},
            {"name": "linear_search([5, 8, 2, 9], 5) — first", "args": [[5, 8, 2, 9], 5]},
            {"name": "linear_search([5, 8, 2, 9], 9) — last", "args": [[5, 8, 2, 9], 9]},
            {"name": "linear_search([5, 8, 2, 9], 7) — missing", "args": [[5, 8, 2, 9], 7]},
            {"name": "linear_search([], 7) — empty list", "args": [[], 7]},
        ],
    },
    {
        "entry": "search_steps",
        "cases": [
            {"name": "search_steps([5, 8, 2, 9], 5) — found first try", "args": [[5, 8, 2, 9], 5]},
            {"name": "search_steps([5, 8, 2, 9], 9) — found last", "args": [[5, 8, 2, 9], 9]},
            {"name": "search_steps([5, 8, 2, 9], 7) — checks all 4", "args": [[5, 8, 2, 9], 7]},
            {"name": "search_steps([], 7) — nothing to check", "args": [[], 7]},
        ],
    },
]

VIZ_SPEC = {
    "type": "plot",
    "title": "Linear search — the longer the row, the more boxes you open",
    "xLabel": "N — how many boxes in the row",
    "yLabel": "boxes you open (worst case)",
    "resultFn": "__plot",
    "demoArgs": [16],
    "caption": {
        "todo": "Finish search_steps to draw the worst-case line.",
        "tuning": "Your line is showing — keep tuning search_steps to match the answer.",
        "match": "✅ A straight climbing line — that's O(n): twice the row, twice the work.",
        "checks": [
            {"fn": "search_steps", "args": [[10, 20, 30, 40], 30]},
            {"fn": "search_steps", "args": [[10, 20, 30, 40], 99]},
        ],
    },
}
