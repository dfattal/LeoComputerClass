# reference.py — answer key for whitehat/lesson-04 (Smash the Stack).
#
# INERT: never served or built. WRITE THIS FIRST, then generate tests.json +
# viz.json with the scratchpad generator.
#
# THE STORY: This is the famous one. You built the CPU and the stack, so you
# know a program keeps a "return address" — a note saying "when this function is
# done, jump back HERE." That note sits in memory right after the little box
# (the BUFFER) that holds your typed-in input.
#
# Here's the bug: if a program copies your input into the buffer WITHOUT
# checking the length, a too-long input spills past the buffer and scribbles
# over the return address. Now the program "returns" to wherever the attacker
# wrote. That's a BUFFER OVERFLOW — and it's how countless real systems got
# hijacked.
#
# Our memory is 5 cells: four buffer slots (indexes 0-3) holding "_" when empty,
# and the return-address slot (index 4) holding "H" for HOME. Overwrite that H
# and you control where the program jumps.


def store(text):
    # Copy text into memory ONE CHARACTER AT A TIME, with no length check (the
    # bug!). Anything past slot 3 spills into the return address and beyond.
    mem = ["_", "_", "_", "_", "H"]   # 4 buffer slots + the return address
    for i, ch in enumerate(text):
        if i < len(mem):
            mem[i] = ch
    return mem


def return_address(text):
    # After storing text, what's in the return-address slot? "H" means the
    # program still returns HOME safely. Anything else means it's HIJACKED.
    return store(text)[4]


def is_safe(text):
    # The defense: a length check. Input is safe only if it fits in the 4-slot
    # buffer without spilling into the return address.
    return len(text) <= 4


# === PAINTER START ===
# Hidden painter: draws memory as a row of cells for each attack input. The four
# buffer slots are blue when they hold a character, gray when empty. The
# return-address slot (last) is GREEN while it still says "H" (safe) and RED once
# it's been overwritten (hijacked!). Driven by the student's store().
EMPTY = "gray"
DATA = "blue"
SAFE = "green"
HIJACK = "red"


def __row(text):
    try:
        mem = store(text)
    except Exception:
        mem = ["_", "_", "_", "_", "H"]
    row = []
    for i in range(4):                       # buffer slots
        row.append(DATA if mem[i] != "_" else EMPTY)
    row.append("")                           # gap before the return address
    row.append(SAFE if mem[4] == "H" else HIJACK)   # the return address
    return row


def __show_attacks(texts=None):
    if texts is None:
        texts = ["cat", "kitten", "evilX"]
    return [__row(t) for t in texts]
# === PAINTER END ===


TESTS_SPEC = [
    {"entry": "store", "cases": [
        {"name": "'cat' fits in the buffer", "args": ["cat"]},
        {"name": "'abcd' exactly fills the buffer", "args": ["abcd"]},
        {"name": "'kitten' overflows (return clobbered)", "args": ["kitten"]},
        {"name": "'evilX' lands X on the return slot", "args": ["evilX"]},
        {"name": "empty input leaves memory untouched", "args": [""]},
    ]},
    {"entry": "return_address", "cases": [
        {"name": "'cat' returns HOME safely", "args": ["cat"]},
        {"name": "'abcd' still safe (just fills buffer)", "args": ["abcd"]},
        {"name": "'kitten' corrupts the return", "args": ["kitten"]},
        {"name": "'evilX' hijacks to X", "args": ["evilX"]},
    ]},
    {"entry": "is_safe", "cases": [
        {"name": "'cat' is safe", "args": ["cat"]},
        {"name": "'abcd' is right at the limit", "args": ["abcd"]},
        {"name": "'kitten' is too long", "args": ["kitten"]},
        {"name": "empty input is safe", "args": [""]},
    ]},
]

VIZ_SPEC = {
    "type": "draw",
    "resultFn": "__show_attacks",
    "demoArgs": [["cat", "kitten", "evilX"]],
    "title": "Memory: 4 blue buffer slots + the return address. Green = returns HOME, red = HIJACKED by overflow",
}


if __name__ == "__main__":
    import json
    print("store:", [store(t) for t in ["cat", "abcd", "kitten", "evilX", ""]])
    print("return_address:", [return_address(t) for t in ["cat", "abcd", "kitten", "evilX"]])
    print("is_safe:", [is_safe(t) for t in ["cat", "abcd", "kitten", ""]])
    print("attacks:", json.dumps(__show_attacks()))
