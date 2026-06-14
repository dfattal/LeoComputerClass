# Swiss-Cheese Memory
# After lots of allocating and freeing, the free space is scattered in little
# gaps. Best-fit and compaction fight back.


def largest_free_block(memory):
    # The length of the BIGGEST run of free (0) slots in a row.
    # Hint: count free slots in a row; remember the largest count you saw.
    pass


def best_fit(memory, size):
    # Return the start index of the SMALLEST free gap that still fits `size`
    # slots. That wastes the least space. Return -1 if nothing fits.
    # Hint: scan each free gap, note its start and length; keep the smallest
    # gap whose length >= size.
    pass


def compact(memory):
    # Slide every used block to the front (keeping their order) and push all the
    # free slots to the end. Return the new memory.
    # Hint: collect all the non-zero values, then pad the rest with zeros.
    pass


print("Press Run to see fragmentation vs. compaction!")
