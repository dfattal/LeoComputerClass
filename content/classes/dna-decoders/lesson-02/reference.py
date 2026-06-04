# reference.py — answer key for dna-decoders/lesson-02 (Slicing the Strand).
#
# INERT: loadLesson.ts only reads fixed filenames (lesson.mdx, exercises.mdx,
# tests.json, rubric.json, starter.py, viz.json), so this file is never served
# or built. WRITE THIS FIRST, then generate tests.json expected values from it.
#
# Run `npm run validate-class dna-decoders` to check tests.json against this answer key.
#
# A strand is a string. A SLICE grabs a stretch of it with two spots:
# dna[start:end] keeps from `start` up to (but not including) `end`.
# dna[::-1] walks the whole strand backwards — it flips it.


# --- The two functions the student writes ---


def snip(dna, start, end):
    # Keep the piece from spot `start` up to (not including) spot `end`.
    return dna[start:end]


def flip(dna):
    # Read the strand backwards. [::-1] means "step by -1" — end to start.
    return dna[::-1]


# --- Given helpers: the hidden painter that turns DNA into colored squares. ---
# The student never sees or writes these. They also live in viz.json's "setup"
# so the live canvas can draw them; they are duplicated here so that
# `npm run validate-class` can run the draw stages against this answer key.

BASE_COLOR = {"A": "green", "T": "red", "C": "blue", "G": "yellow", "U": "purple"}


def __paint(dna):
    # One row of colored squares: one square per base.
    return [BASE_COLOR.get(base, "") for base in dna]


def __show_snip(dna="ATCGTAGC", start=2, end=5):
    # Top row: the whole strand. Bottom row: empty except the snipped piece,
    # painted right under the spots it came from (built from the student's snip).
    piece = snip(dna, start, end)
    bottom = ["" for _ in dna]
    for i, base in enumerate(piece):
        bottom[start + i] = BASE_COLOR.get(base, "")
    return [__paint(dna), bottom]


def __show_flip(dna="ATCGTAGC"):
    # Top row: the strand as written. Bottom row: the strand flipped backwards.
    return [__paint(dna), __paint(flip(dna))]
