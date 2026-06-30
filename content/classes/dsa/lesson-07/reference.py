# reference.py — answer key for dsa/lesson-07 (Sorting II — Merge Sort).
#
# INERT: never served or built. Source of truth; gen_lesson.py reads TESTS_SPEC /
# VIZ_SPEC + the painter to emit tests.json + viz.json.
#
# Big idea: DIVIDE AND CONQUER. Split the list in half, sort each half (by
# splitting THEM in half — recursion!), then MERGE the two sorted halves back
# into one. Merging two sorted lists is cheap. The total work is O(n log n) — a
# gentle curve that dives way under bubble sort's O(n²) hill.


def merge(a, b):
    # Zip two ALREADY-sorted lists into one sorted list, always taking the
    # smaller front item next.
    result = []
    i = 0
    j = 0
    while i < len(a) and j < len(b):
        if a[i] <= b[j]:
            result.append(a[i])
            i += 1
        else:
            result.append(b[j])
            j += 1
    result += a[i:]   # whatever's left over is already sorted
    result += b[j:]
    return result


def merge_sort(arr):
    if len(arr) <= 1:                 # base case: 0 or 1 item is already sorted
        return list(arr)
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])      # sort the left half (recursion)
    right = merge_sort(arr[mid:])     # sort the right half (recursion)
    return merge(left, right)         # merge the two sorted halves


def merge_steps(arr):
    # "Work done" = the work to sort each half, plus the work to merge them back
    # (merging touches every item once, so that's len(arr)). A list of 1 is free.
    if len(arr) <= 1:
        return 0
    mid = len(arr) // 2
    return merge_steps(arr[:mid]) + merge_steps(arr[mid:]) + len(arr)


# === PAINTER START ===
# Hidden producer: plots merge sort's work against bubble sort's. The bubble
# curve (n(n-1)/2, the O(n²) hill) is a fixed comparison; the merge curve comes
# from the student's OWN merge_steps and should dive far below it (O(n log n)).
def __merge_curve(n_max):
    pts = []
    for n in range(1, n_max + 1):
        s = merge_steps(list(range(n)))
        if not isinstance(s, int) or isinstance(s, bool):
            return None
        pts.append([n, s])
    return pts


def __plot(n_max):
    bubble = [[n, n * (n - 1) // 2] for n in range(1, n_max + 1)]
    merge_c = None
    try:
        merge_c = __merge_curve(n_max)
    except Exception:
        merge_c = None
    series = [{"name": "bubble sort — O(n²)", "points": bubble, "highlight": False}]
    if merge_c:
        series.append({"name": "merge sort — O(n log n)", "points": merge_c, "highlight": True})
    return series
# === PAINTER END ===


TESTS_SPEC = [
    {
        "entry": "merge",
        "cases": [
            {"name": "merge([1, 4], [2, 3])", "args": [[1, 4], [2, 3]]},
            {"name": "merge([], [1, 2]) — one side empty", "args": [[], [1, 2]]},
            {"name": "merge([1, 2, 3], []) — other side empty", "args": [[1, 2, 3], []]},
            {"name": "merge([5], [1]) — single items", "args": [[5], [1]]},
            {"name": "merge([1, 4, 7], [2, 3, 8])", "args": [[1, 4, 7], [2, 3, 8]]},
        ],
    },
    {
        "entry": "merge_sort",
        "cases": [
            {"name": "merge_sort([3, 1, 2])", "args": [[3, 1, 2]]},
            {"name": "merge_sort([5, 4, 3, 2, 1]) — reversed", "args": [[5, 4, 3, 2, 1]]},
            {"name": "merge_sort([2, 2, 1]) — duplicates", "args": [[2, 2, 1]]},
            {"name": "merge_sort([1]) — single", "args": [[1]]},
            {"name": "merge_sort([]) — empty", "args": [[]]},
        ],
    },
    {
        "entry": "merge_steps",
        "cases": [
            {"name": "merge_steps([]) — nothing to do", "args": [[]]},
            {"name": "merge_steps([1]) — one item is free", "args": [[1]]},
            {"name": "merge_steps([1, 2]) — split, merge 2", "args": [[1, 2]]},
            {"name": "merge_steps([1, 2, 3, 4]) — n log n = 8", "args": [[1, 2, 3, 4]]},
            {"name": "merge_steps([5, 4, 3, 2, 1])", "args": [[5, 4, 3, 2, 1]]},
        ],
    },
]

VIZ_SPEC = {
    "type": "plot",
    "title": "Merge sort vs bubble sort — watch O(n log n) dive under O(n²)",
    "xLabel": "N — how many items to sort",
    "yLabel": "work done (worst case)",
    "resultFn": "__plot",
    "demoArgs": [32],
    "caption": {
        "todo": "Finish merge_steps to draw merge sort's work curve.",
        "tuning": "Your curve is showing — keep tuning merge_steps to match the answer.",
        "match": "✅ Your curve dives far under the bubble hill — that's the power of O(n log n)!",
        "checks": [
            {"fn": "merge", "args": [[1, 4, 7], [2, 3, 8]]},
            {"fn": "merge_steps", "args": [[1, 2, 3, 4]]},
        ],
    },
}
