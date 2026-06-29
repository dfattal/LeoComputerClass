# reference.py — answer key for whitehat/lesson-01 (Think Like a Hacker).
#
# INERT: loadLesson.ts only reads fixed filenames (lesson.mdx, exercises.mdx,
# tests.json, rubric.json, starter.py, viz.json), so this file is never served
# or built. WRITE THIS FIRST, then generate tests.json + viz.json from it with
# the scratchpad generator: reference.py is the source of truth.
#
# Run `npm run validate-class whitehat` to check tests.json against this key.
#
# THE STORY: You've been hired (with permission — always!) to test Fort Knocks.
# Its front door has a secret keypad. You don't know the rule, so you do what a
# real hacker does: you PROBE it. You try codes and watch what happens:
#
#     2468 -> CLICK (opens!)      1234 -> BEEP (stays locked)
#     2222 -> CLICK               1357 -> BEEP
#     4444 -> CLICK               1111 -> BEEP
#
# Stare at it long enough and the secret pops out: the door opens only when
# EVERY digit is even. You didn't guess — you understood the system. That's
# what "thinking like a hacker" really means.


# --- The two functions the student writes ---


def all_even(code):
    # True only if every digit in the code is even (0,2,4,6,8).
    # `code` is a string of digits like "2468".
    for ch in code:
        if int(ch) % 2 != 0:
            return False
    return True


def responds(code):
    # What the Fort Knocks keypad does when you punch in a code.
    # All digits even -> the lock CLICKs open. Otherwise it just BEEPs.
    if all_even(code):
        return "CLICK"
    return "BEEP"


# === PAINTER START ===
# Hidden painter: turns probe codes into a picture of the keypad panel. The
# student never writes this; it lives in viz.json's "setup" so the live canvas
# can draw it, and is duplicated here so validate-class can run it. It calls the
# student's responds(), so a wrong answer changes the locks you see.
EVEN = "green"   # an even digit
ODD = "red"      # an odd digit
OPEN = "\U0001F513"    # 🔓 the door clicked open
SHUT = "\U0001F512"    # 🔒 the door stayed locked

PROBES = ["2468", "1234", "2222", "1357", "4444", "1111"]


def __show_panel(codes=None):
    # One row per probe code: the four digits colored green (even) or red (odd),
    # a gap, then a lock that's OPEN if your responds() says "CLICK".
    if codes is None:
        codes = PROBES
    grid = []
    for code in codes:
        row = []
        for ch in code:
            row.append(EVEN if int(ch) % 2 == 0 else ODD)
        row.append("")  # gap column
        # Student-driven, with a safe fallback so the panel never crashes.
        try:
            opened = responds(code) == "CLICK"
        except Exception:
            opened = all_even(code)
        row.append(OPEN if opened else SHUT)
        grid.append(row)
    return grid
# === PAINTER END ===


# --- generation spec (inert; read by the scratchpad generator) ---
TESTS_SPEC = [
    {"entry": "all_even", "cases": [
        {"name": "2468 — all even", "args": ["2468"]},
        {"name": "1234 — has odd digits", "args": ["1234"]},
        {"name": "2222 — all even", "args": ["2222"]},
        {"name": "1357 — all odd", "args": ["1357"]},
        {"name": "0000 — zero counts as even", "args": ["0000"]},
        {"name": "8642 — all even", "args": ["8642"]},
    ]},
    {"entry": "responds", "cases": [
        {"name": "2468 opens the door", "args": ["2468"]},
        {"name": "1234 stays locked", "args": ["1234"]},
        {"name": "4444 opens the door", "args": ["4444"]},
        {"name": "1111 stays locked", "args": ["1111"]},
        {"name": "0000 opens (zero is even)", "args": ["0000"]},
    ]},
]

# Single-resultFn draw panel (no stages — one picture, the keypad).
VIZ_SPEC = {
    "type": "draw",
    "resultFn": "__show_panel",
    "demoArgs": [PROBES],
    "title": "Fort Knocks keypad: each probe's digits (green=even, red=odd) and whether your code opens the lock",
}


if __name__ == "__main__":
    import json

    print("all_even:")
    for c in ["2468", "1234", "2222", "1357", "0000", "8642"]:
        print(f"  {c} -> {all_even(c)}")
    print("responds:")
    for c in ["2468", "1234", "4444", "1111", "0000"]:
        print(f"  {c} -> {responds(c)}")
    print("panel:")
    print(json.dumps(__show_panel()))
