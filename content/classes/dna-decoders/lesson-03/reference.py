# reference.py — answer key for dna-decoders/lesson-03 (Counting & Swapping Bases).
#
# INERT: loadLesson.ts only reads fixed filenames (lesson.mdx, exercises.mdx,
# tests.json, rubric.json, starter.py, viz.json), so this file is never served
# or built. WRITE THIS FIRST, then generate tests.json expected values from it.
#
# Run `npm run validate-class dna-decoders` to check tests.json against this answer key.
#
# Strings come with built-in helpers. dna.count("A") tallies every "A" in one
# move. dna.replace("T", "U") swaps every T for a U — that turns DNA into RNA.


# --- The two functions the student writes ---


def count_base(dna, base):
    # How many times does `base` show up in the strand? .count() tallies it.
    return dna.count(base)


def to_rna(dna):
    # RNA is just DNA with every T swapped for a U. .replace() swaps them all.
    return dna.replace("T", "U")


# --- Given helpers: the hidden painter that turns DNA into colored squares. ---
# The student never sees or writes these. They also live in viz.json's "setup"
# so the live canvas can draw them; they are duplicated here so that
# `npm run validate-class` can run the draw stages against this answer key.

BASE_COLOR = {"A": "green", "T": "red", "C": "blue", "G": "yellow", "U": "purple"}


def __paint(dna):
    # One row of colored squares: one square per base.
    return [BASE_COLOR.get(base, "") for base in dna]


def __show_count(dna="AATTTGCA", base="T"):
    # Top row: the strand. Bottom row: a tally bar — one colored square for each
    # time `base` appears (built from the student's count_base), left-aligned.
    n = count_base(dna, base)
    color = BASE_COLOR.get(base, "")
    bottom = [color] * n + [""] * (len(dna) - n)
    return [__paint(dna), bottom]


def __show_rna(dna="ATCGTAGC"):
    # Top row: the DNA strand (red T's). Bottom row: the RNA (purple U's) — the
    # swap made visible, built from the student's to_rna.
    return [__paint(dna), __paint(to_rna(dna))]
