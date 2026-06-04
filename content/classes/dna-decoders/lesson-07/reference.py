# reference.py — answer key for dna-decoders/lesson-07 (Chunk the Genome -> Decode a Creature).
#
# INERT: loadLesson.ts only reads fixed filenames (lesson.mdx, exercises.mdx,
# tests.json, rubric.json, starter.py, viz.json), so this file is never served
# or built. WRITE THIS FIRST, then generate tests.json expected values from it.
#
# Run `npm run validate-class dna-decoders` to check tests.json against this answer key.
#
# CAPSTONE. Cells read DNA three letters at a time. Each three-letter word is a
# CODON. codons() chops a genome into codons with range(0, len, 3) + dna[i:i+3].
# decode_creature() reads three codons (fur, eyes, tail) through a lookup table
# and returns the creature's traits.
#
# IMPORTANT: decode_creature builds its keys in the fixed order fur, eyes, tail.
# The grader compares dicts as JSON and key order counts.


# --- The two functions the student writes ---


def codons(dna):
    # Chop the genome into 3-letter chunks. Jump by 3 and slice three at a time.
    chunks = []
    for i in range(0, len(dna), 3):
        chunks.append(dna[i:i + 3])
    return chunks


def decode_creature(dna, table):
    # Read the first three codons through the table: codon 0 = fur, 1 = eyes,
    # 2 = tail. `table` holds one little lookup table per trait.
    chunks = codons(dna)
    return {
        "fur": table["fur"][chunks[0]],
        "eyes": table["eyes"][chunks[1]],
        "tail": table["tail"][chunks[2]],
    }


# --- Given helpers: the hidden painter that turns DNA + traits into pictures. ---
# The student never sees or writes these. They also live in viz.json's "setup"
# so the live canvas can draw them; they are duplicated here so that
# `npm run validate-class` can run the draw stages against this answer key.

BASE_COLOR = {"A": "green", "T": "red", "C": "blue", "G": "yellow", "U": "purple"}

# The toy "genetic code": one lookup table per trait. Passed to decode_creature
# in the panel and the exercises so a genome decodes to a creature.
CREATURE_TABLE = {
    "fur": {"AAA": "white", "TTT": "golden", "CCC": "brown", "GGG": "black"},
    "eyes": {"AAA": "blue", "TTT": "red", "CCC": "brown", "GGG": "green"},
    "tail": {"AAA": "long", "TTT": "fluffy", "CCC": "curly", "GGG": "short"},
}

# Painter-only maps: turn the decoded trait words into a picture.
FUR_PAINT = {"white": "white", "golden": "orange", "brown": "brown", "black": "black"}
EYE_PAINT = {"blue": "💙", "red": "❤️", "brown": "🤎", "green": "💚"}
TAIL_PAINT = {"long": "〰️", "fluffy": "☁️", "curly": "➰", "short": "▪️"}


def __paint(dna):
    # One row of colored squares: one square per base.
    return [BASE_COLOR.get(base, "") for base in dna]


def __show_codons(dna="AAATTTCCC"):
    # One row per codon: the genome chopped into 3-letter chunks (from codons()).
    return [__paint(chunk) for chunk in codons(dna)]


def __show_creature(dna="AAATTTCCC", table=CREATURE_TABLE):
    # The CAPSTONE picture: decode the genome, then draw a little creature —
    # two eyes on top, a fur-colored body, a tail underneath.
    traits = decode_creature(dna, table)
    eye = EYE_PAINT[traits["eyes"]]
    fur = FUR_PAINT[traits["fur"]]
    tail = TAIL_PAINT[traits["tail"]]
    return [
        [eye, "", eye],
        [fur, fur, fur],
        ["", tail, ""],
    ]
