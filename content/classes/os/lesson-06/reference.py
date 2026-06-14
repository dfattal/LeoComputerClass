# reference.py — answer key for os/lesson-06 (Saving for Keeps).
# INERT: never served or built. Source of truth for tests.json.
# The disk is a list of blocks. Each block holds the NAME of the file that
# owns it, or "" if the block is free.


def save(disk, name, size):
    # First-fit on disk: find the first run of `size` free blocks and write
    # `name` into them. Return the NEW disk. No room -> return it unchanged.
    d = list(disk)
    run = 0
    start = -1
    for i in range(len(d)):
        if d[i] == "":
            if run == 0:
                start = i
            run += 1
            if run == size:
                for j in range(start, start + size):
                    d[j] = name
                return d
        else:
            run = 0
    return d


def blocks_of(disk, name):
    # The list of block numbers that hold `name`, in order. This is how the
    # file system FINDS a file again later — by its name.
    return [i for i, b in enumerate(disk) if b == name]


def delete_file(disk, name):
    # Free every block that belongs to `name` (set it back to ""). New disk.
    return ["" if b == name else b for b in disk]
