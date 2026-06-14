# reference.py — answer key for os/lesson-03 (Fair vs. Fast / priorities).
# INERT: never served or built. Source of truth for tests.json.
# Higher priority number = more urgent. Ties go to the lower program id.


def pick_next(remaining, priorities):
    # Of the programs that still have work, return the id of the most
    # urgent one (highest priority). Return -1 if everyone is done.
    best = -1
    for pid in range(len(remaining)):
        if remaining[pid] <= 0:
            continue
        if best == -1 or priorities[pid] > priorities[best]:
            best = pid
    return best


def priority_run(programs, priorities):
    # Each tick, run the most urgent program that still has work.
    remaining = list(programs)
    timeline = []
    while any(r > 0 for r in remaining):
        pid = pick_next(remaining, priorities)
        timeline.append(pid)
        remaining[pid] -= 1
    return timeline


def starves(timeline, pid, limit):
    # True if program `pid` had to wait MORE than `limit` ticks before its
    # first turn (or never ran at all) — the danger of strict priorities.
    for t, who in enumerate(timeline):
        if who == pid:
            return t > limit
    return True
