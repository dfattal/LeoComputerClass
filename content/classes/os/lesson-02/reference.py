# reference.py — answer key for os/lesson-02 (Taking Turns / round-robin).
# INERT: never served or built. Source of truth for tests.json.


def round_robin(programs, quantum):
    # Give each program a turn of up to `quantum` ticks, then rotate.
    # Keep going around the table until everyone's work is done.
    remaining = list(programs)
    timeline = []
    while any(r > 0 for r in remaining):
        for pid in range(len(remaining)):
            if remaining[pid] <= 0:
                continue
            slice_len = min(quantum, remaining[pid])
            for _ in range(slice_len):
                timeline.append(pid)
            remaining[pid] -= slice_len
    return timeline


def turns_each(timeline, n):
    # How many ticks each of the n programs got. A fair scheduler gives
    # each program exactly as many ticks as it had work.
    counts = [0] * n
    for pid in timeline:
        counts[pid] += 1
    return counts


def finish_order(programs, quantum):
    # The order in which programs finish. Under round-robin the SHORT
    # jobs finish first instead of waiting behind a giant one.
    remaining = list(programs)
    order = []
    while any(r > 0 for r in remaining):
        for pid in range(len(remaining)):
            if remaining[pid] <= 0:
                continue
            slice_len = min(quantum, remaining[pid])
            remaining[pid] -= slice_len
            if remaining[pid] == 0:
                order.append(pid)
    return order
