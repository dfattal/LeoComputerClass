# Graphs & Shortest Path — explore hop by hop with a QUEUE to find the way.
#
# The graph is a list of [node, [neighbors]] rows. Tip: leave each "pass" until
# you replace it with your code.


def neighbors(graph, node):
    # Find the row whose first item == node and return a copy of its neighbor
    # list. Return [] if the node isn't in the graph.
    pass


def bfs(graph, start, goal):
    # Keep a visited set and a queue of PATHS (lists of nodes), starting [[start]].
    # Each loop: dequeue the oldest path with queue.pop(0), look at its last node,
    # and extend it with each unvisited neighbor. Return the path that first
    # reaches goal (that's the shortest), or [] if none does.
    pass


print("Press Run to light the shortest route across the map on the Canvas!")
