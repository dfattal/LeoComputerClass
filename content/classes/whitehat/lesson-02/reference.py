# reference.py — answer key for whitehat/lesson-02 (Guess the Password).
#
# INERT: never served or built. WRITE THIS FIRST, then generate tests.json +
# viz.json from it with the scratchpad generator.
#
# THE STORY: Last lesson you cracked the keypad by understanding it. But what if
# there's NO clever rule — just a secret PIN? Then you do the bluntest hack of
# all: BRUTE FORCE. Try every possible code, in order, until one works. A
# computer can try thousands per second, so a short PIN has no chance.
#
# The twist: each extra digit multiplies the number of codes by 10. A 4-digit
# PIN has 10,000 codes (crackable in a blink). An 8-digit one has 100,000,000 —
# that's why longer passwords win. Length beats cleverness.


def crack_pin(secret):
    # Brute force: try 0, 1, 2, ... as zero-padded codes until one matches the
    # secret. `secret` is a string like "0042"; return the matching code.
    n = len(secret)
    for i in range(10 ** n):
        guess = str(i).zfill(n)
        if guess == secret:
            return guess
    return None


def combos(num_digits):
    # How many different PINs are possible with this many digits?
    # 10 choices per slot, multiplied together: 10 ** num_digits.
    return 10 ** num_digits


# === PAINTER START ===
# Hidden painter: draws the brute-force attack as a 10x10 board of every 2-digit
# code (00 in the top-left, 99 in the bottom-right). Codes already tried glow
# red; the cracked one turns green; the rest stay gray. Driven by the student's
# crack_pin, so the green square lands wherever their cracker stops.
TRIED = "red"
FOUND = "green"
UNTRIED = "gray"


def __show_search(secret="37"):
    grid = [[UNTRIED for _ in range(10)] for _ in range(10)]
    try:
        target = int(crack_pin(secret))
    except Exception:
        target = int(secret)
    for i in range(target + 1):
        r, c = i // 10, i % 10
        grid[r][c] = FOUND if i == target else TRIED
    return grid
# === PAINTER END ===


TESTS_SPEC = [
    {"entry": "crack_pin", "cases": [
        {"name": "0000 — the very first guess", "args": ["0000"]},
        {"name": "0042 — found on guess 43", "args": ["0042"]},
        {"name": "1337 — a leet PIN", "args": ["1337"]},
        {"name": "9999 — the very last guess", "args": ["9999"]},
        {"name": "37 — a short 2-digit lock", "args": ["37"]},
    ]},
    {"entry": "combos", "cases": [
        {"name": "1 digit: 10 codes", "args": [1]},
        {"name": "2 digits: 100 codes", "args": [2]},
        {"name": "4 digits: 10,000 codes", "args": [4]},
        {"name": "6 digits: a million codes", "args": [6]},
        {"name": "8 digits: 100 million codes", "args": [8]},
    ]},
]

VIZ_SPEC = {
    "type": "draw",
    "resultFn": "__show_search",
    "demoArgs": ["37"],
    "title": "Brute force sweeping every 2-digit code (00 top-left → 99 bottom-right): red = tried, green = cracked",
}


if __name__ == "__main__":
    import json
    print("crack_pin:", [crack_pin(s) for s in ["0000", "0042", "1337", "9999", "37"]])
    print("combos:", [combos(d) for d in [1, 2, 4, 6, 8]])
    print("search:", json.dumps(__show_search("37")))
