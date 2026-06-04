# reference.py — answer key for dna-decoders/lesson-06 (Dictionaries: the Lookup Table).
#
# INERT: loadLesson.ts only reads fixed filenames (lesson.mdx, exercises.mdx,
# tests.json, rubric.json, starter.py, viz.json), so this file is never served
# or built. WRITE THIS FIRST, then generate tests.json expected values from it.
#
# Run `npm run validate-class dna-decoders` to check tests.json against this answer key.
#
# A dict is a lookup table: it pairs a KEY with a VALUE. d[key] jumps straight
# to the value — no searching. count_bases tallies all four bases into one
# table; look_up reads a value out of a table by its key.
#
# IMPORTANT: count_bases must build its keys in the fixed order A, T, C, G.
# The grader compares dicts as JSON and key order counts, so this order is the
# one taught in starter.py / exercises.mdx — every correct answer matches it.


# --- The two functions the student writes ---


def count_bases(dna):
    # Tally all four bases into one lookup table, keys in order A, T, C, G.
    return {
        "A": dna.count("A"),
        "T": dna.count("T"),
        "C": dna.count("C"),
        "G": dna.count("G"),
    }


def look_up(table, codon):
    # Jump straight to the value stored under `codon` in the table.
    return table[codon]


# --- Given helpers: the hidden painter that turns DNA into colored squares. ---
# The student never sees or writes these. They also live in viz.json's "setup"
# so the live canvas can draw them; they are duplicated here so that
# `npm run validate-class` can run the draw stages against this answer key.

BASE_COLOR = {"A": "green", "T": "red", "C": "blue", "G": "yellow", "U": "purple"}

# A toy codon -> creature table, used only to demo look_up in the panel.
CREATURE_TABLE = {"AAA": "🦊", "TTT": "🐢", "CCC": "🐰", "GGG": "🐻"}


def __paint(dna):
    # One row of colored squares: one square per base.
    return [BASE_COLOR.get(base, "") for base in dna]


def __show_counts(dna="AATTTGCA"):
    # One row per base (A, T, C, G). Each row is a bar: one colored square for
    # every time that base appears, read out of the student's count_bases table.
    counts = count_bases(dna)
    return [[BASE_COLOR[b]] * counts[b] for b in "ATCG"]


def __show_lookup(table=CREATURE_TABLE, codon="GGG"):
    # Top row: the codon's three base-squares. Bottom row: the creature the
    # table stores under that codon, fetched with the student's look_up.
    return [__paint(codon), [look_up(table, codon)]]
