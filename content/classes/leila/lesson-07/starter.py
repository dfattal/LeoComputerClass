# Decode creature traits from a toy genome!
# The genome is 9 letters long, split into 3 genes:
#   Positions 0-2: Fur color
#   Positions 3-5: Eye color
#   Positions 6-8: Tail type

FUR_CODES = {"AAA": "white", "GGG": "black", "CCC": "brown", "TTT": "golden"}
EYE_CODES = {"AAA": "blue", "GGG": "green", "CCC": "brown", "TTT": "red"}
TAIL_CODES = {"AAA": "long", "GGG": "short", "CCC": "curly", "TTT": "fluffy"}

def decode_traits(genome):
    # Slice the genome into 3-letter chunks
    # Look up each chunk in the right table
    # Return a dictionary with keys: "fur", "eyes", "tail"
    pass

# Try it out!
print(decode_traits("GGGCCCAAA"))
