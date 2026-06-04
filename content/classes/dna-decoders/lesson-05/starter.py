# Loops: Do It to Every Base 🧬
# A `for` loop visits every base in the strand, one at a time.
# You build a NEW strand by starting empty and adding to it each step: out += ...
# The pairing rule: A<->T and C<->G.
#
# Tip: leave each "pass" until you replace it with your code — don't just
# delete it, or Python will complain that a function is empty.

# A handy lookup of each base's partner (you may use it):
PARTNER = {"A": "T", "T": "A", "C": "G", "G": "C"}


def complement(dna):
    # Build the partner strand. Start with an empty string, then for EACH base,
    # add its partner:
    #     out = ""
    #     for base in dna:
    #         out += PARTNER[base]
    #     return out
    pass


def reverse_complement(dna):
    # The partner strand, read the other way: take the complement, then flip it.
    # Trick: complement(dna)[::-1]
    pass
