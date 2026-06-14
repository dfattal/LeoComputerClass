# Compare two creatures' genomes!
# Both strands are the SAME length. We line them up and look for differences.

def count_differences(dna_a, dna_b):
    # Walk through both strands at the same time.
    # Every spot where the letters DON'T match, add 1 to a counter.
    # Tip: zip(dna_a, dna_b) hands you one pair of letters at a time.
    pass

def percent_match(dna_a, dna_b):
    # How many letters DO match? (the total length minus the differences)
    # Turn that into a percentage:  matches / total * 100
    # Round to 1 decimal place with round(value, 1)
    pass

# Try it out — how alike are these two creatures?
print(count_differences("GGGCCCAAA", "GGGCCCGGG"))
print(percent_match("GGGCCCAAA", "GGGCCCGGG"))
