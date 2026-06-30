# reference.py — answer key for dsa/lesson-09 (Binary Search Trees).
#
# INERT: never served or built. Source of truth; gen_lesson.py reads TESTS_SPEC /
# VIZ_SPEC + the painter to emit tests.json + viz.json.
#
# Big idea: a BINARY SEARCH TREE keeps data in a branching shape with one rule:
# at every node, everything SMALLER goes left and everything BIGGER goes right.
# That rule is binary search frozen into a shape — to find a value you walk ONE
# path down, choosing left or right at each node, ignoring the whole other side.
# A node is a list [value, left, right]; an empty tree is None. Both insert and
# search are recursive (Lesson 5).


def insert(tree, value):
    if tree is None:
        return [value, None, None]      # base case: grow a new leaf
    node_val, left, right = tree
    if value < node_val:
        return [node_val, insert(left, value), right]    # smaller -> go left
    elif value > node_val:
        return [node_val, left, insert(right, value)]    # bigger -> go right
    else:
        return tree                     # already in the tree: no change


def search(tree, value):
    if tree is None:
        return False                    # fell off the bottom: not here
    node_val, left, right = tree
    if value == node_val:
        return True
    elif value < node_val:
        return search(left, value)      # follow the LEFT branch only
    else:
        return search(right, value)     # follow the RIGHT branch only


# === PAINTER START ===
# Hidden painter: builds a tree with the student's OWN insert, lays it out by
# depth (row) and in-order position (column) so it looks like a real tree, and
# paints the ONE path a search for TARGET follows in orange. Wrong insert -> wrong
# shape. Falls back to an empty cell so the canvas is never blank.
NODE = "purple"    # a value sitting in the tree
HIT = "orange"     # a node on the search path for TARGET
DEMO_VALUES = [5, 3, 8, 1, 4, 7]
TARGET = 4


def __inorder(tree, depth, acc):
    if tree is None:
        return
    val, left, right = tree
    __inorder(left, depth + 1, acc)
    acc.append((val, depth))
    __inorder(right, depth + 1, acc)


def __path_to(tree, target):
    path = []
    node = tree
    while node is not None:
        val, left, right = node
        path.append(val)
        if target == val:
            break
        node = left if target < val else right
    return path


def __show_tree():
    try:
        tree = None
        for v in DEMO_VALUES:
            tree = insert(tree, v)
        nodes = []
        __inorder(tree, 0, nodes)
        if not nodes:
            return [[""]]
        width = len(nodes)
        height = max(d for _v, d in nodes) + 1
        path = set(__path_to(tree, TARGET))
        grid = [["" for _ in range(width)] for _ in range(height)]
        for col, (val, depth) in enumerate(nodes):
            grid[depth][col] = HIT if val in path else NODE
        return grid
    except Exception:
        return [[""]]
# === PAINTER END ===


TESTS_SPEC = [
    {
        "entry": "insert",
        "cases": [
            {"name": "insert(None, 5) — first node", "args": [None, 5]},
            {"name": "insert([5,None,None], 3) — smaller goes left", "args": [[5, None, None], 3]},
            {"name": "insert([5,None,None], 8) — bigger goes right", "args": [[5, None, None], 8]},
            {"name": "insert(tree, 4) — down-left-right", "args": [[5, [3, None, None], None], 4]},
        ],
    },
    {
        "entry": "search",
        "cases": [
            {"name": "search(tree, 4) — present leaf", "args": [[5, [3, [1, None, None], [4, None, None]], [8, [7, None, None], None]], 4]},
            {"name": "search(tree, 5) — the root", "args": [[5, [3, [1, None, None], [4, None, None]], [8, [7, None, None], None]], 5]},
            {"name": "search(tree, 7) — deep on the right", "args": [[5, [3, [1, None, None], [4, None, None]], [8, [7, None, None], None]], 7]},
            {"name": "search(tree, 6) — missing", "args": [[5, [3, [1, None, None], [4, None, None]], [8, [7, None, None], None]], 6]},
            {"name": "search(None, 3) — empty tree", "args": [None, 3]},
        ],
    },
]

VIZ_SPEC = {
    "type": "draw",
    "title": "A binary search tree — find 4 by walking ONE path (orange), ignoring the rest",
    "resultFn": "__show_tree",
    "demoArgs": [],
}
