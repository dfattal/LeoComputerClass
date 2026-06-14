# reference.py — answer key for os/lesson-01 (The Frozen Computer).
# INERT: never served or built. Source of truth for tests.json.


def run_to_completion(programs):
    # Run each program fully, in order, before the next one gets the CPU.
    # programs[i] = how many ticks of work program i needs.
    # Returns the timeline: timeline[t] = which program ran on tick t.
    timeline = []
    for pid, work in enumerate(programs):
        for _ in range(work):
            timeline.append(pid)
    return timeline


def wait_time(programs, pid):
    # How many ticks program `pid` waits before it first runs:
    # the total work of everyone ahead of it in line.
    return sum(programs[:pid])


def longest_hog(timeline):
    # The longest streak a single program ran without giving the CPU back.
    if not timeline:
        return 0
    best = 1
    run = 1
    for i in range(1, len(timeline)):
        if timeline[i] == timeline[i - 1]:
            run += 1
        else:
            run = 1
        if run > best:
            best = run
    return best
