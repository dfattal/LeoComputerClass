# Create DNA mutations!
# Three types of mutations:
#   substitution - replace one base with another
#   insertion - add a new base at a position
#   deletion - remove a base at a position

def mutate(dna, position, mutation_type, new_base=None):
    # Your code here!
    # Hint: use string slicing: dna[:position] + ... + dna[position:]
    pass

# Try it out!
print(mutate("ATCG", 1, "substitution", "G"))
print(mutate("ATCG", 2, "insertion", "T"))
print(mutate("ATCG", 0, "deletion"))
