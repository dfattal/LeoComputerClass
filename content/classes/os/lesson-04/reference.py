# reference.py — answer key for os/lesson-04 (Whose Memory Is This?).
# INERT: never served or built. Source of truth for tests.json.
# Memory is a list of slots. Each slot holds the program id that owns it,
# or 0 if the slot is free.


def allocate(memory, pid, size):
    # First-fit: find the first run of `size` free slots and give them to
    # `pid`. Return the NEW memory. If there's no room, return it unchanged.
    mem = list(memory)
    run = 0
    start = -1
    for i in range(len(mem)):
        if mem[i] == 0:
            if run == 0:
                start = i
            run += 1
            if run == size:
                for j in range(start, start + size):
                    mem[j] = pid
                return mem
        else:
            run = 0
    return mem


def free(memory, pid):
    # Give back every slot owned by `pid` (set it to 0). Return new memory.
    return [0 if v == pid else v for v in memory]


def free_slots(memory):
    # How many slots are free right now.
    return sum(1 for v in memory if v == 0)
