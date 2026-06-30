# reference.py — answer key for dsa/lesson-04 (Stacks & Queues).
#
# INERT: never served or built. Source of truth; gen_lesson.py reads TESTS_SPEC /
# VIZ_SPEC + the painter (between the markers) to emit tests.json + viz.json.
#
# Big idea: two ways to hold a line of items.
#   STACK  — add to the back, remove from the BACK  (Last In, First Out). A stack
#            of plates: the last plate you put down is the first you take off.
#   QUEUE  — add to the back, remove from the FRONT (First In, First Out). A line
#            at a door: first to arrive is first to leave.
# Both ADD the same way. The whole difference is which END you take from.
# Every function returns the NEW list, so we can both test it and draw it.


def push(stack, x):
    # Put x on top of the stack (the back of the list).
    return stack + [x]


def pop(stack):
    # Take the top item off (the back). Empty stack stays empty.
    return stack[:-1]


def enqueue(queue, x):
    # A new item joins the back of the line.
    return queue + [x]


def dequeue(queue):
    # The item at the FRONT leaves the line. Empty queue stays empty.
    return queue[1:]


# === PAINTER START ===
# Hidden painter: builds a "film strip" of snapshots by calling the student's OWN
# push/pop (stack) and enqueue/dequeue (queue). Each ROW is one moment in time;
# a filled cell is "purple", and the ACTIVE end (the next item to leave) glows
# "orange". A wrong function draws a wrong strip.
FULL = "purple"   # a cell holding an item
HOT = "orange"    # the active end: top of a stack / front of a queue
WIDTH = 5


def __row(items, hot_index):
    row = []
    for j in range(WIDTH):
        if j < len(items):
            row.append(HOT if j == hot_index else FULL)
        else:
            row.append("")
    return row


def __show_stack():
    # push 1,2,3 then pop twice. The TOP (last filled cell) is the active end.
    s = []
    snaps = [list(s)]
    for x in [1, 2, 3]:
        s = push(s, x)
        snaps.append(list(s))
    for _ in range(2):
        s = pop(s)
        snaps.append(list(s))
    return [__row(snap, len(snap) - 1) for snap in snaps]


def __show_queue():
    # enqueue 1,2,3 then dequeue twice. Items leave from the FRONT (index 0),
    # so the strip slides left as the line drains. The front is the active end.
    q = []
    snaps = [list(q)]
    for x in [1, 2, 3]:
        q = enqueue(q, x)
        snaps.append(list(q))
    for _ in range(2):
        q = dequeue(q)
        snaps.append(list(q))
    return [__row(snap, 0 if snap else -1) for snap in snaps]
# === PAINTER END ===


TESTS_SPEC = [
    {
        "entry": "push",
        "cases": [
            {"name": "push([1, 2], 3) — onto a stack", "args": [[1, 2], 3]},
            {"name": "push([], 5) — onto an empty stack", "args": [[], 5]},
        ],
    },
    {
        "entry": "pop",
        "cases": [
            {"name": "pop([1, 2, 3]) — take the top (3)", "args": [[1, 2, 3]]},
            {"name": "pop([7]) — down to empty", "args": [[7]]},
            {"name": "pop([]) — empty stays empty", "args": [[]]},
        ],
    },
    {
        "entry": "enqueue",
        "cases": [
            {"name": "enqueue([1, 2], 3) — join the back", "args": [[1, 2], 3]},
            {"name": "enqueue([], 5) — first in line", "args": [[], 5]},
        ],
    },
    {
        "entry": "dequeue",
        "cases": [
            {"name": "dequeue([1, 2, 3]) — front (1) leaves", "args": [[1, 2, 3]]},
            {"name": "dequeue([7]) — down to empty", "args": [[7]]},
            {"name": "dequeue([]) — empty stays empty", "args": [[]]},
        ],
    },
]

VIZ_SPEC = {
    "type": "draw",
    "title": "Film strip of a stack and a queue — watch the cells fill, then drain",
    "todo": "Finish push, pop, enqueue, and dequeue to watch the cells fill and drain.",
    "stages": [
        {
            "fn": "__show_stack",
            "args": [],
            "label": "Stack (LIFO)",
            "caption": "🥞 A stack: items pile up at the back, and the LAST one in (orange) is the first out. Add three, take two — it grows then shrinks from the same end.",
        },
        {
            "fn": "__show_queue",
            "args": [],
            "label": "Queue (FIFO)",
            "caption": "🚪 A queue: items join the back, but the FRONT one (orange) leaves first. Watch the line slide left as the front keeps stepping out.",
        },
    ],
}
