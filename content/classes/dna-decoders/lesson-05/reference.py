# reference.py — answer key for dna-decoders/lesson-05 (Loops: Do It to Every Base).
#
# INERT: loadLesson.ts only reads fixed filenames (lesson.mdx, exercises.mdx,
# tests.json, rubric.json, starter.py, viz.json), so this file is never served
# or built. WRITE THIS FIRST, then generate tests.json expected values from it.
#
# Run `npm run validate-class dna-decoders` to check tests.json against this answer key.
#
# A `for` loop visits every base in turn. You build a new strand by starting
# empty and ADDING to it each time: out += partner. The pairing rule is
# A<->T and C<->G. Reverse-complement is the complement, then flipped.


PARTNER = {"A": "T", "T": "A", "C": "G", "G": "C"}


# --- The two functions the student writes ---


def complement(dna):
    # Walk every base; add its partner to a new strand. A<->T, C<->G.
    out = ""
    for base in dna:
        out += PARTNER[base]
    return out


def reverse_complement(dna):
    # The matching partner strand, read the other way: complement, then flip.
    return complement(dna)[::-1]


# --- Given helpers: the hidden painter that turns DNA into colored squares. ---
# The student never sees or writes these. They also live in viz.json's "setup"
# so the live canvas can draw them; they are duplicated here so that
# `npm run validate-class` can run the draw stages against this answer key.

BASE_COLOR = {"A": "green", "T": "red", "C": "blue", "G": "yellow", "U": "purple"}


def __paint(dna):
    # One row of colored squares: one square per base.
    return [BASE_COLOR.get(base, "") for base in dna]


def __show_complement(dna="ATCGTAGC"):
    # Top row: the strand. Bottom row: its partner strand — every color flips
    # (green<->red, blue<->yellow), built from the student's complement.
    return [__paint(dna), __paint(complement(dna))]


def __show_revcomp(dna="ATCGTAGC"):
    # Top row: the strand. Bottom row: the reverse complement, built from the
    # student's reverse_complement.
    return [__paint(dna), __paint(reverse_complement(dna))]
