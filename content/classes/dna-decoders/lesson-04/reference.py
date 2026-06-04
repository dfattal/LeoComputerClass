# reference.py — answer key for dna-decoders/lesson-04 (Lists: a Backpack of Bases).
#
# INERT: loadLesson.ts only reads fixed filenames (lesson.mdx, exercises.mdx,
# tests.json, rubric.json, starter.py, viz.json), so this file is never served
# or built. WRITE THIS FIRST, then generate tests.json expected values from it.
#
# Run `npm run validate-class dna-decoders` to check tests.json against this answer key.
#
# A list is a backpack that holds many items in order. list(dna) unpacks a
# strand into a backpack of single bases. .append(x) drops one more item in the
# back. len(backpack) tells you how many it holds.


# --- The two functions the student writes ---


def bases_list(dna):
    # Turn the strand string into a list (backpack) of single-base strings.
    return list(dna)


def add_base(genes, base):
    # Drop one more base into the back of the list, then hand the list back.
    genes.append(base)
    return genes


# --- Given helpers: the hidden painter that turns bases into colored squares. ---
# The student never sees or writes these. They also live in viz.json's "setup"
# so the live canvas can draw them; they are duplicated here so that
# `npm run validate-class` can run the draw stages against this answer key.

BASE_COLOR = {"A": "green", "T": "red", "C": "blue", "G": "yellow", "U": "purple"}


def __paint(bases):
    # One row of colored squares: one square per base in the list (or string).
    return [BASE_COLOR.get(base, "") for base in bases]


def __show_list(dna="ATCGTAGC"):
    # One row: the strand unpacked into a backpack of separate base-squares.
    return [__paint(bases_list(dna))]


def __show_add(dna="ATC", base="G"):
    # Top row: the backpack so far. Bottom row: after dropping in one more base
    # (the new square appears at the end), built from the student's add_base.
    genes = bases_list(dna)
    before = __paint(genes)
    after = __paint(add_base(genes, base))
    return [before, after]
