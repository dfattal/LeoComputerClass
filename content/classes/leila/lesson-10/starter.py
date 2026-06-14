# Build a creature family tree from DNA!
# The closer two genomes are, the more closely related the creatures.

def species_distance(dna_a, dna_b):
    # Count how many letters differ between the two genomes.
    # (This is the same idea as count_differences from last lesson —
    #  here we call the count the "distance" between two species.)
    pass

def closest_relative(target, others):
    # others is a dictionary like {"wolf": "GGGCCCAAA", "fox": "GGGCCCAAG"}
    # For each creature, measure its distance from target.
    # Return the NAME of the creature with the SMALLEST distance.
    # Tip: loop with  for name, genome in others.items():
    pass

# Try it out — who is this creature's closest cousin?
zoo = {"wolf": "GGGCCCAAA", "fox": "GGGCCCAAG", "lizard": "TTTAAACCC"}
print(closest_relative("GGGCCCAAG", zoo))
