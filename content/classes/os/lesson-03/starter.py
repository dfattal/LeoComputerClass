# Fair vs. Fast
# Round-robin is fair, but urgent jobs feel slow. Priorities let the important
# program cut the line. Higher priority number = more urgent.


def pick_next(remaining, priorities):
    # Of the programs that still have work (remaining[i] > 0), return the id of
    # the MOST urgent one (biggest priority). Ties go to the lower id.
    # If everyone is finished, return -1.
    # Hint: track the best id you've seen; only switch when you find a strictly
    # higher priority.
    pass


def priority_run(programs, priorities):
    # Each tick, run pick_next's choice for ONE tick. Keep going until all the
    # work is gone. Return timeline[t] = which program ran on tick t.
    pass


def starves(timeline, pid, limit):
    # Did program `pid` wait MORE than `limit` ticks for its first turn (or
    # never run at all)? Return True if it starved, else False.
    # Hint: find the first t where timeline[t] == pid; check t > limit.
    pass


print("Press Run to see the priority timeline!")
