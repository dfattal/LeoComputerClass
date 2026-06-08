# reference.py — answer key for python-primer/lesson-04b
# (The Secret Staircase: How Python Knows What's Inside).
#
# INERT: loadLesson.ts only reads fixed filenames (lesson.mdx, exercises.mdx,
# tests.json, rubric.json, starter.py, viz.json), so this file is never served
# or built. WRITE THIS FIRST, then generate tests.json expected values from it:
# reference.py is the source of truth; tests.json is generated from it.
#
# Run `npm run validate-class python-primer` to check tests.json against this answer key.


# Exercise 1 — The Repair Shop: a straight-line body, every line on step 1.
def cheer(name):
    message = "Go " + name + ", go!"
    loud = message.upper()
    return loud


# Exercise 2 — The Amnesia Bug: total = 0 must live OUTSIDE the loop (step 1),
# the adding line INSIDE it (step 2).
def total_steps(steps):
    total = 0
    for s in steps:
        total = total + s
    return total


# Exercise 3 — The Early Escape: return count belongs on step 1 (outside the
# loop), not step 2/3 (inside it).
def count_evens(numbers):
    count = 0
    for n in numbers:
        if n % 2 == 0:
            count = count + 1
    return count


# Exercise 4 — In or Out?: written from scratch; the append must sit on step 3,
# inside the if, inside the for.
def keep_big(numbers, limit):
    keepers = []
    for n in numbers:
        if n > limit:
            keepers.append(n)
    return keepers


# Exercise 5 — The Secret Staircase (capstone): nested loops + an if returning
# an n×n pixel grid where row i has i+1 green squares. The picture IS the
# staircase the lesson is about.
def staircase(n):
    grid = []
    for row in range(n):
        cells = []
        for col in range(n):
            if col <= row:
                cells.append("green")
            else:
                cells.append("")
        grid.append(cells)
    return grid


if __name__ == "__main__":
    print(cheer("Leo"))
    print(total_steps([3, 5, 2]))
    print(count_evens([1, 2, 3, 4]))
    print(keep_big([3, 9, 1, 12, 5], 4))
    for r in staircase(4):
        print(r)
