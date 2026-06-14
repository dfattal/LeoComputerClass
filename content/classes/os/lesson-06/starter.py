# Saving for Keeps
# The disk is a row of blocks. Each block holds the NAME of the file that owns
# it, or "" if it's free. A file system maps a name to its blocks.


def save(disk, name, size):
    # Find the FIRST run of `size` free ("") blocks and write `name` into them.
    # Return the NEW disk. If there's no room, return it unchanged.
    # Hint: this is just like allocate(), but the free marker is "" and you
    # write a name string instead of a program id.
    pass


def blocks_of(disk, name):
    # Return the list of block numbers that hold `name`, in order. This is how
    # the file system finds a file again later.
    # Hint: enumerate the disk and keep the indices where the block == name.
    pass


def delete_file(disk, name):
    # Free every block that belongs to `name` (set it back to ""). New disk.
    pass


print("Press Run to see the disk blocks!")
