# The Frozen Computer
# A program is just some "ticks" of work. The CPU can only run ONE tick at a
# time. Your job: see what happens when programs don't share.


def run_to_completion(programs):
    # programs[i] = how many ticks program i needs.
    # Run each program ALL the way to the end before the next one starts.
    # Build a list: timeline[t] = which program ran on tick t.
    # Hint: loop over each program id, then append its id `work` times.
    pass


def wait_time(programs, pid):
    # How many ticks does program `pid` wait before it first runs?
    # That's the total work of every program ahead of it in line.
    # Hint: add up programs[0] ... programs[pid - 1].
    pass


def longest_hog(timeline):
    # The longest streak one program ran without giving the CPU back.
    # Walk the timeline; count how long the same id repeats in a row;
    # remember the biggest streak you saw. (Empty timeline -> 0.)
    pass


print("Press Run to see the CPU timeline!")
