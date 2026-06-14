# Answer key for "Species Distance" — INERT (never served/built).
# Use DNA differences to figure out which creatures are closest relatives.

def species_distance(dna_a, dna_b):
    # The "distance" between two creatures is just how many letters differ.
    # Fewer differences  ->  more closely related.
    distance = 0
    for a, b in zip(dna_a, dna_b):
        if a != b:
            distance += 1
    return distance


def closest_relative(target, others):
    # others is a dict {name: genome}. Find the name whose genome is the
    # smallest distance away from target.
    best_name = None
    best_distance = None
    for name, genome in others.items():
        d = species_distance(target, genome)
        if best_distance is None or d < best_distance:
            best_distance = d
            best_name = name
    return best_name


if __name__ == "__main__":
    print(species_distance("AAAAAAAAA", "AAAAAAAAA"))   # 0
    print(species_distance("GGGCCCAAA", "GGGCCCGGG"))   # 3
    print(species_distance("ATCGATCG", "ATCGTTCG"))     # 1

    zoo = {
        "wolf": "GGGCCCAAA",
        "fox": "GGGCCCAAG",
        "lizard": "TTTAAACCC",
    }
    print(closest_relative("GGGCCCAAA", zoo))            # wolf  (distance 0)
    print(closest_relative("GGGCCCAAT", zoo))            # wolf  (distance 1, fox 2)

    cousins = {
        "cat": "AAATTTGGG",
        "tiger": "AAATTTGGC",
        "snake": "CCCGGGAAA",
    }
    print(closest_relative("AAATTTGGA", cousins))        # tiger (distance 1)
