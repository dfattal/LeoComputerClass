# reference.py — answer key for dna-decoders/lesson-01 (DNA is a String of Letters).
#
# INERT: loadLesson.ts only reads fixed filenames (lesson.mdx, exercises.mdx,
# tests.json, rubric.json, starter.py, viz.json), so this file is never served
# or built. WRITE THIS FIRST, then generate tests.json expected values from it:
# reference.py is the source of truth; tests.json is generated from it.
#
# Run `npm run validate-class dna-decoders` to check tests.json against this answer key.
#
# DNA is just a string of letters: A, T, C, G. To grab one base you use its
# SPOT (its index): dna[0] is the first base, dna[-1] is the last one.


# --- The two functions the student writes ---


def first_base(dna):
    # The first base sits at spot 0.
    return dna[0]


def last_base(dna):
    # The last base sits at spot -1 (one step back from the very end).
    return dna[-1]


# --- Given helpers: the hidden painter that turns DNA into colored squares. ---
# The student never sees or writes these. They also live in viz.json's "setup"
# so the live canvas can draw them; they are duplicated here so that
# `npm run validate-class` can run the draw stages against this answer key.

BASE_COLOR = {"A": "green", "T": "red", "C": "blue", "G": "yellow", "U": "purple"}


def __paint(dna):
    # One row of colored squares: one square per base.
    return [BASE_COLOR.get(base, "") for base in dna]


def __marker(dna, spot):
    # A row of empty squares with ONE colored square at `spot`, colored from the
    # base the student's function picked (so a wrong pick paints the wrong spot).
    row = ["" for _ in dna]
    base = first_base(dna) if spot == 0 else last_base(dna)
    row[spot] = BASE_COLOR.get(base, "")
    return row


def __show_first(dna="ATCGTAGC"):
    # Top row: the whole strand. Bottom row: a marker under the FIRST base.
    return [__paint(dna), __marker(dna, 0)]


def __show_last(dna="ATCGTAGC"):
    # Top row: the whole strand. Bottom row: a marker under the LAST base.
    return [__paint(dna), __marker(dna, len(dna) - 1)]
