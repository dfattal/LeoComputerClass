# Answer key for "Compare Two Sequences" — INERT (never served/built).
# Two creatures, two genomes of the same length. How alike are they?

def count_differences(dna_a, dna_b):
    # Walk both strands together, count the spots where the letters disagree.
    diffs = 0
    for a, b in zip(dna_a, dna_b):
        if a != b:
            diffs += 1
    return diffs


def percent_match(dna_a, dna_b):
    # What fraction of the letters line up? Turn it into a percentage.
    total = len(dna_a)
    if total == 0:
        return 0.0
    matches = total - count_differences(dna_a, dna_b)
    return round(matches / total * 100, 1)


if __name__ == "__main__":
    print(count_differences("AAAAAAAAA", "AAAAAAAAA"))   # 0
    print(count_differences("AAAAAAAAA", "AAAGGGAAA"))   # 3
    print(count_differences("ATCG", "TAGC"))             # 4
    print(count_differences("GGGCCCAAA", "GGGCCCGGG"))   # 3
    print(percent_match("AAAAAAAAA", "AAAAAAAAA"))        # 100.0
    print(percent_match("AAAAAAAAA", "AAAGGGAAA"))        # 66.7
    print(percent_match("ATCG", "TAGC"))                  # 0.0
    print(percent_match("GGGCCCAAA", "GGGCCCGGG"))        # 66.7
    print(percent_match("ATCGATCG", "ATCGATCC"))          # 87.5
