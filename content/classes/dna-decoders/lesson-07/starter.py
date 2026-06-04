# Chunk the Genome -> Decode a Creature 🧬🐾
# THE BIG FINALE. Cells read DNA three letters at a time. Each 3-letter word is
# a CODON. Chop the genome into codons, look each one up, and a creature appears!
#
# Tip: leave each "pass" until you replace it with your code — don't just
# delete it, or Python will complain that a function is empty.


def codons(dna):
    # Chop the genome into 3-letter chunks. Jump by 3 and slice three at a time:
    #     chunks = []
    #     for i in range(0, len(dna), 3):
    #         chunks.append(dna[i:i + 3])
    #     return chunks
    pass


def decode_creature(dna, table):
    # The genome holds 3 codons: codon 0 = fur, codon 1 = eyes, codon 2 = tail.
    # `table` has one lookup table per trait: table["fur"], table["eyes"], table["tail"].
    # Chop the genome with codons(), then look up each trait. Return a dict with
    # keys in this order: fur, eyes, tail.
    #     chunks = codons(dna)
    #     return {
    #         "fur": table["fur"][chunks[0]],
    #         "eyes": table["eyes"][chunks[1]],
    #         "tail": table["tail"][chunks[2]],
    #     }
    pass
