# Whose Memory Is This?
# Memory is a row of slots. Each slot holds the id of the program that owns it,
# or 0 if it's free. The allocator hands each program its own block.


def allocate(memory, pid, size):
    # Find the FIRST run of `size` free (0) slots in a row and mark them with
    # `pid`. Return the NEW memory list. If there's no room, return it unchanged.
    # Hint: walk the list counting free slots in a row; when the count hits
    # `size`, fill those slots and return.
    pass


def free(memory, pid):
    # Give back every slot owned by `pid` (set it to 0). Return the new memory.
    # Hint: a list comprehension that turns pid into 0 and leaves others alone.
    pass


def free_slots(memory):
    # How many slots are free (equal to 0) right now?
    pass


print("Press Run to see the memory slots!")
