# reference.py — answer key for os/lesson-05 (Swiss-Cheese Memory).
# INERT: never served or built. Source of truth for tests.json.
# Memory is a list of slots; 0 means free, any other number is an owner id.


def largest_free_block(memory):
    # The length of the biggest run of free (0) slots in a row.
    best = 0
    run = 0
    for v in memory:
        if v == 0:
            run += 1
            if run > best:
                best = run
        else:
            run = 0
    return best


def best_fit(memory, size):
    # Return the start index of the SMALLEST free gap that still fits `size`.
    # That wastes the least space. Return -1 if nothing fits.
    best_start = -1
    best_len = None
    i = 0
    n = len(memory)
    while i < n:
        if memory[i] == 0:
            start = i
            while i < n and memory[i] == 0:
                i += 1
            length = i - start
            if length >= size and (best_len is None or length < best_len):
                best_len = length
                best_start = start
        else:
            i += 1
    return best_start


def compact(memory):
    # Slide every used block to the front, keeping their order, and push all
    # the free slots to the end — turning scattered gaps into one big block.
    used = [v for v in memory if v != 0]
    return used + [0] * (len(memory) - len(used))
