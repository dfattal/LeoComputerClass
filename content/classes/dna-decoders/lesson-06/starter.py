# Dictionaries: the Lookup Table 🗂️
# A dict pairs a KEY with a VALUE, like a table of answers.
# Make one with { }, and jump to a value with table[key]:
#     PARTNER = {"A": "T", "T": "A", "C": "G", "G": "C"}
#     PARTNER["A"]   # -> "T"
#
# Tip: leave each "pass" until you replace it with your code — don't just
# delete it, or Python will complain that a function is empty.


def count_bases(dna):
    # Tally ALL four bases into one dict. Build the keys in this exact order:
    # A, then T, then C, then G. Use dna.count(...) for each:
    #     return {
    #         "A": dna.count("A"),
    #         "T": dna.count("T"),
    #         "C": dna.count("C"),
    #         "G": dna.count("G"),
    #     }
    pass


def look_up(table, codon):
    # Jump straight to the value stored under `codon` in the table.
    # The trick is table[codon].
    pass
