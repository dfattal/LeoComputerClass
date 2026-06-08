# The Secret Staircase!
# You're the town's code repair-person today. Machines 1-3 below are already
# written — only their SPACING is broken. Fix the steps, don't change the words!
# Remember: 4 spaces per step, and the editor's Tab key types them for you.


# Exercise 1: The Repair Shop
# Go read Exercise 1 — copy the crumpled cheer machine from there, paste it
# over this whole function, press Run, and meet your first IndentationError.
# Then line all three body lines up on step 1.
def cheer(name):
    # Paste the crumpled code from Exercise 1 over this function!
    pass


# Exercise 2: The Amnesia Bug
# This machine RUNS, but it forgets its total on every lap of the loop.
# ONE line is standing inside the loop when it should live outside it.
def total_steps(steps):
    for s in steps:
        total = 0
        total = total + s
    return total


# Exercise 3: The Early Escape
# This machine also runs — but it quits after checking only the FIRST number.
# Find the escaping line and move it exactly one step to the left.
def count_evens(numbers):
    count = 0
    for n in numbers:
        if n % 2 == 0:
            count = count + 1
        return count


# Exercise 4: In or Out?
# Your turn to build! Return a new list with only the numbers bigger than limit.
# A for on step 1, an if on step 2, an append on step 3 — a real staircase.
def keep_big(numbers, limit):
    # Start with an empty list of keepers...
    pass


# Exercise 5: The Secret Staircase
# A loop INSIDE a loop! Return n rows; in row r, squares 0..r are "green",
# the rest are "" (empty). Watch your staircase appear in the picture panel!
def staircase(n):
    # For each row, build a list of cells, then append it to the grid.
    pass


# Try them out!
print(cheer("Leo"))
print(total_steps([3, 5, 2]))
print(count_evens([2, 4, 6]))
print(keep_big([3, 9, 1, 12, 5], 4))
print("Now press Run and check the picture panel for your staircase!")
