# reference.py — answer key for dsa/lesson-10 (Graphs & Shortest Path).
#
# INERT: never served or built. Source of truth; gen_lesson.py reads TESTS_SPEC /
# VIZ_SPEC + the painter to emit tests.json + viz.json.
#
# CAPSTONE. A GRAPH is a map: dots (nodes) joined by lines (connections). We store
# it as [[node, [neighbors]], ...]. BREADTH-FIRST SEARCH (BFS) finds the FEWEST
# hops from a start to a goal: explore everything one hop away, then two hops, then
# three... using a QUEUE (Lesson 4!) so the closest places are always checked
# first. The first time you reach the goal, you came by a shortest route. This is
# exactly how a packet finds its way across the internet (callback to Networks).


def neighbors(graph, node):
    # Find this node's row and return a copy of its list of neighbors.
    for entry in graph:
        if entry[0] == node:
            return list(entry[1])
    return []


def bfs(graph, start, goal):
    # Explore hop by hop, keeping a QUEUE of paths. Because a queue is first-in
    # first-out, shorter paths are always explored before longer ones — so the
    # first path that reaches the goal is a shortest one.
    if start == goal:
        return [start]
    visited = {start}
    queue = [[start]]                  # a queue of paths, each path a list of nodes
    while queue:
        path = queue.pop(0)            # dequeue the oldest path (FIFO)
        node = path[-1]
        for nb in neighbors(graph, node):
            if nb not in visited:
                visited.add(nb)
                new_path = path + [nb]
                if nb == goal:
                    return new_path    # reached the goal by a shortest route
                queue.append(new_path)  # enqueue the longer path to explore later
    return []                          # no route exists


# === PAINTER START ===
# Hidden painter: draws the little map at fixed spots and lights the shortest path
# the student's OWN bfs finds (orange); other towns stay purple. Wrong bfs lights
# the wrong towns.
ON = "orange"    # a town on the shortest path
OFF = "purple"   # a town not on the path
GRAPH = [
    ["A", ["B", "C"]],
    ["B", ["A", "D"]],
    ["C", ["A", "D", "E"]],
    ["D", ["B", "C", "F"]],
    ["E", ["C", "F"]],
    ["F", ["D", "E"]],
    ["Z", []],
]
POS = {"A": (1, 0), "B": (0, 1), "C": (2, 1), "D": (1, 2), "E": (2, 3), "F": (1, 4)}
START = "A"
GOAL = "F"


def __show_map():
    try:
        path = set(bfs(GRAPH, START, GOAL))
    except Exception:
        path = set()
    rows = max(r for r, _c in POS.values()) + 1
    cols = max(c for _r, c in POS.values()) + 1
    grid = [["" for _ in range(cols)] for _ in range(rows)]
    for node, (r, c) in POS.items():
        grid[r][c] = ON if node in path else OFF
    return grid
# === PAINTER END ===


TESTS_SPEC = [
    {
        "entry": "neighbors",
        "cases": [
            {"name": 'neighbors(graph, "A")', "args": [[["A", ["B", "C"]], ["B", ["A", "D"]], ["C", ["A", "D", "E"]], ["D", ["B", "C", "F"]], ["E", ["C", "F"]], ["F", ["D", "E"]], ["Z", []]], "A"]},
            {"name": 'neighbors(graph, "C")', "args": [[["A", ["B", "C"]], ["B", ["A", "D"]], ["C", ["A", "D", "E"]], ["D", ["B", "C", "F"]], ["E", ["C", "F"]], ["F", ["D", "E"]], ["Z", []]], "C"]},
            {"name": 'neighbors(graph, "Z") — lonely town', "args": [[["A", ["B", "C"]], ["B", ["A", "D"]], ["C", ["A", "D", "E"]], ["D", ["B", "C", "F"]], ["E", ["C", "F"]], ["F", ["D", "E"]], ["Z", []]], "Z"]},
        ],
    },
    {
        "entry": "bfs",
        "cases": [
            {"name": 'bfs(graph, "A", "F") — shortest route', "args": [[["A", ["B", "C"]], ["B", ["A", "D"]], ["C", ["A", "D", "E"]], ["D", ["B", "C", "F"]], ["E", ["C", "F"]], ["F", ["D", "E"]], ["Z", []]], "A", "F"]},
            {"name": 'bfs(graph, "A", "E")', "args": [[["A", ["B", "C"]], ["B", ["A", "D"]], ["C", ["A", "D", "E"]], ["D", ["B", "C", "F"]], ["E", ["C", "F"]], ["F", ["D", "E"]], ["Z", []]], "A", "E"]},
            {"name": 'bfs(graph, "A", "A") — already there', "args": [[["A", ["B", "C"]], ["B", ["A", "D"]], ["C", ["A", "D", "E"]], ["D", ["B", "C", "F"]], ["E", ["C", "F"]], ["F", ["D", "E"]], ["Z", []]], "A", "A"]},
            {"name": 'bfs(graph, "A", "Z") — no route', "args": [[["A", ["B", "C"]], ["B", ["A", "D"]], ["C", ["A", "D", "E"]], ["D", ["B", "C", "F"]], ["E", ["C", "F"]], ["F", ["D", "E"]], ["Z", []]], "A", "Z"]},
        ],
    },
]

VIZ_SPEC = {
    "type": "draw",
    "title": "A map of towns — BFS lights the fewest-hops route from A to F (orange)",
    "resultFn": "__show_map",
    "demoArgs": [],
}
