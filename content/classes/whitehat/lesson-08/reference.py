# reference.py — answer key for whitehat/lesson-08 (Lock It All Down).
#
# INERT: never served or built. WRITE THIS FIRST, then generate tests.json +
# viz.json with the scratchpad generator.
#
# THE STORY: Time to flip your hat to the BLUE TEAM. You broke into Fort Knocks
# six different ways — now you'll patch every hole you found and score how safe
# you made it. Real security isn't one magic wall; it's lots of small fixes
# STACKED UP. That's called "defense in depth."
#
# The five defenses, each one undoing an attack from this class:
#   1. A strong (long) PIN           -> beats brute force      (Lesson 2)
#   2. Salting the password hashes   -> beats dictionary attacks (Lesson 3)
#   3. A buffer length check         -> beats the overflow      (Lesson 4)
#   4. Cleaning the input            -> beats injection         (Lesson 5)
#   5. Encrypting the wire           -> beats sniffing          (Lesson 6)
#
# Turn all five on and Fort Knocks scores a perfect 100 — a real fortress.


def pin_strong(pin):
    # A PIN is strong only if it's long. 8+ digits makes brute force hopeless.
    return len(pin) >= 8


def buffer_ok(text, size):
    # The overflow fix: input must FIT in the buffer, no spilling over.
    return len(text) <= size


def input_clean(text):
    # The injection fix: reject sneaky input that contains a quote.
    return "'" not in text


def security_score(pin, text, size, salted, encrypted):
    # Add 20 points for each defense that's in place (max 100). salted and
    # encrypted are True/False flags for the other two fixes.
    score = 0
    if pin_strong(pin):
        score += 20
    if buffer_ok(text, size):
        score += 20
    if input_clean(text):
        score += 20
    if salted:
        score += 20
    if encrypted:
        score += 20
    return score


# === PAINTER START ===
# Hidden painter: a security dashboard. Top row = five shields, one per defense,
# GREEN when that defense holds and RED when it's still open. Bottom row = the
# score bar, one green block per 20 points. Driven by the student's checks.
ON = "green"
OFF = "red"
BAR = "green"
EMPTY = "gray"


def __show_dashboard(pin="12345678", text="leo", size=4, salted=True, encrypted=True):
    try:
        shields = [
            ON if pin_strong(pin) else OFF,
            ON if salted else OFF,
            ON if buffer_ok(text, size) else OFF,
            ON if input_clean(text) else OFF,
            ON if encrypted else OFF,
        ]
        score = security_score(pin, text, size, salted, encrypted)
    except Exception:
        shields = [OFF] * 5
        score = 0
    filled = score // 20
    bar = [BAR if i < filled else EMPTY for i in range(5)]
    return [shields, bar]
# === PAINTER END ===


TESTS_SPEC = [
    {"entry": "pin_strong", "cases": [
        {"name": "short 4-digit PIN is weak", "args": ["1234"]},
        {"name": "8 digits is strong", "args": ["12345678"]},
        {"name": "7 is still too short", "args": ["1234567"]},
    ]},
    {"entry": "buffer_ok", "cases": [
        {"name": "fits the buffer", "args": ["leo", 4]},
        {"name": "exactly fills it", "args": ["abcd", 4]},
        {"name": "too long — would overflow", "args": ["kitten", 4]},
    ]},
    {"entry": "input_clean", "cases": [
        {"name": "a normal name is clean", "args": ["leo"]},
        {"name": "an injection payload is dirty", "args": ["' OR '1'='1"]},
    ]},
    {"entry": "security_score", "cases": [
        {"name": "all five defenses on = 100", "args": ["12345678", "leo", 4, True, True]},
        {"name": "weak PIN drops it to 80", "args": ["1234", "leo", 4, True, True]},
        {"name": "injection + overflow = 60", "args": ["12345678", "' OR '1'='1", 4, True, True]},
        {"name": "wide-open Fort Knocks = 20", "args": ["12", "kitten", 4, False, False]},
    ]},
]

VIZ_SPEC = {
    "type": "draw",
    "resultFn": "__show_dashboard",
    "demoArgs": ["12345678", "leo", 4, True, True],
    "title": "Fort Knocks security dashboard: 5 defense shields (green = locked down) + your score bar",
}


if __name__ == "__main__":
    import json
    print("pin_strong:", [pin_strong(p) for p in ["1234", "12345678", "1234567"]])
    print("buffer_ok:", [buffer_ok(t, 4) for t in ["leo", "abcd", "kitten"]])
    print("input_clean:", [input_clean(t) for t in ["leo", "' OR '1'='1"]])
    print("scores:", [
        security_score("12345678", "leo", 4, True, True),
        security_score("1234", "leo", 4, True, True),
        security_score("12345678", "' OR '1'='1", 4, True, True),
        security_score("12", "kitten", 4, False, False),
    ])
    print("dashboard:", json.dumps(__show_dashboard()))
