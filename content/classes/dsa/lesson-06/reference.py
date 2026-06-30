# reference.py — answer key for dsa/lesson-06 (Sorting I — Bubble Sort).
#
# INERT: never served or built. Source of truth; gen_lesson.py reads TESTS_SPEC /
# VIZ_SPEC + the painter to emit tests.json + viz.json.
#
# Big idea: the simplest way to sort is BUBBLE SORT. Walk the list comparing
# neighbors; if a pair is out of order, swap them. Big values "bubble" to the end.
# Repeat until everything is in order. Easy to write — but count the swaps and you
# meet a steep O(n²) hill: double the list and you do about FOUR times the work.


def bubble_sort(arr):
    a = list(arr)               # copy so we don't change the caller's list
    n = len(a)
    for i in range(n):
        for j in range(n - 1 - i):
            if a[j] > a[j + 1]:
                a[j], a[j + 1] = a[j + 1], a[j]   # swap the out-of-order pair
    return a


def bubble_steps(arr):
    # The same sort, but count how many SWAPS it makes.
    a = list(arr)
    n = len(a)
    swaps = 0
    for i in range(n):
        for j in range(n - 1 - i):
            if a[j] > a[j + 1]:
                a[j], a[j + 1] = a[j + 1], a[j]
                swaps += 1
    return swaps


# === PAINTER START ===
# Hidden producer: plots the WORST case (a fully reversed list) for sizes
# 1..n_max, using the student's OWN bubble_steps. The swap-count curves UP like a
# hill — that's O(n²). Falls back to the n(n-1)/2 curve so it's never blank.
def __bubble_curve(n_max):
    pts = []
    for n in range(1, n_max + 1):
        arr = list(range(n, 0, -1))   # n, n-1, ..., 1 -> every pair out of order
        s = bubble_steps(arr)
        if not isinstance(s, int) or isinstance(s, bool):
            return None
        pts.append([n, s])
    return pts


def __plot(n_max):
    curve = None
    try:
        curve = __bubble_curve(n_max)
    except Exception:
        curve = None
    if not curve:
        curve = [[n, n * (n - 1) // 2] for n in range(1, n_max + 1)]
    return [{"name": "bubble sort — swaps in the worst case (O(n²))", "points": curve, "highlight": True}]
# === PAINTER END ===


TESTS_SPEC = [
    {
        "entry": "bubble_sort",
        "cases": [
            {"name": "bubble_sort([3, 1, 2])", "args": [[3, 1, 2]]},
            {"name": "bubble_sort([5, 4, 3, 2, 1]) — reversed", "args": [[5, 4, 3, 2, 1]]},
            {"name": "bubble_sort([1, 2, 3]) — already sorted", "args": [[1, 2, 3]]},
            {"name": "bubble_sort([2, 2, 1]) — duplicates", "args": [[2, 2, 1]]},
            {"name": "bubble_sort([]) — empty", "args": [[]]},
        ],
    },
    {
        "entry": "bubble_steps",
        "cases": [
            {"name": "bubble_steps([1, 2, 3]) — already sorted, 0 swaps", "args": [[1, 2, 3]]},
            {"name": "bubble_steps([2, 1, 3]) — one swap", "args": [[2, 1, 3]]},
            {"name": "bubble_steps([3, 2, 1]) — reversed", "args": [[3, 2, 1]]},
            {"name": "bubble_steps([4, 3, 2, 1]) — reversed", "args": [[4, 3, 2, 1]]},
        ],
    },
]

VIZ_SPEC = {
    "type": "plot",
    "title": "Bubble sort — the swap-count climbs like a hill (O(n²))",
    "xLabel": "N — how many items to sort",
    "yLabel": "swaps in the worst case",
    "resultFn": "__plot",
    "demoArgs": [16],
    "caption": {
        "todo": "Finish bubble_steps to draw the swap-count curve.",
        "tuning": "Your curve is showing — keep tuning bubble_steps to match the answer.",
        "match": "✅ A steep hill, not a line — that's O(n²): twice the list, ~4× the swaps.",
        "checks": [
            {"fn": "bubble_steps", "args": [[1, 2, 3]]},
            {"fn": "bubble_steps", "args": [[3, 2, 1]]},
        ],
    },
}
