# Taking Turns
# Round-robin: give every program a small turn, then rotate. Fair, and nobody
# gets stuck forever behind a giant job.


def round_robin(programs, quantum):
    # programs[i] = ticks of work left for program i. `quantum` = how many
    # ticks each turn is worth. Go around and around giving turns until ALL
    # the work is done. Return timeline[t] = which program ran on tick t.
    # Hint: keep a `remaining` copy of programs. Each lap, give every program
    # with work left a turn of min(quantum, remaining[pid]) ticks.
    pass


def turns_each(timeline, n):
    # Count how many ticks each of the n programs got. Return a list of counts.
    # Hint: start with [0] * n and add one for every id in the timeline.
    pass


def finish_order(programs, quantum):
    # Return the program ids in the order they FINISH (hit 0 work left).
    # Hint: same loop as round_robin, but append a pid the moment it reaches 0.
    pass


print("Press Run to see the round-robin timeline!")
