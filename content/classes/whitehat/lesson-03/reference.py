# reference.py — answer key for whitehat/lesson-03 (The Locked-Up Password).
#
# INERT: never served or built. WRITE THIS FIRST, then generate tests.json +
# viz.json with the scratchpad generator.
#
# THE STORY: Smart sites NEVER store your real password. They store a scrambled
# "hash" — a number you can make from the password but can't turn back. So if a
# thief steals the whole database, they get a pile of numbers, not passwords.
#
# But there's a catch: hashing is the SAME every time, so if your password is a
# common word, an attacker can hash a whole dictionary of common words and look
# for a match. That's a DICTIONARY ATTACK. The fix is SALT: mix a few extra
# letters into each password before hashing, so two people with the same
# password get totally different hashes and the attacker's pre-hashed list is
# useless.


def simple_hash(password):
    # A toy one-way scramble: roll through the letters mixing them into a number.
    # Easy to compute forwards, practically impossible to run backwards. (Real
    # sites use SHA-256, but the idea is exactly this.)
    h = 7
    for ch in password:
        h = (h * 31 + ord(ch)) % 1000000007
    return h


def dictionary_attack(target_hash, wordlist):
    # The attacker has a stolen hash and a list of common passwords. Hash each
    # word; if one matches, that's the cracked password. Return it, or "" if no
    # common word matches (a strong password beats this attack).
    for word in wordlist:
        if simple_hash(word) == target_hash:
            return word
    return ""


def salted_hash(password, salt):
    # The defense: glue a salt onto the front before hashing. Same password with
    # a different salt -> a completely different hash.
    return simple_hash(salt + password)


# === PAINTER START ===
# Hidden painter: draws each password as a colorful "fingerprint" — the digits
# of its hash turned into a row of colored squares. The top row is the stolen
# target; each row below is a common word the attacker tries. The cracked
# password is the row whose fingerprint exactly matches the target. Driven by
# the student's simple_hash, so wrong hashing makes the fingerprints not line up.
PAL = ["red", "orange", "yellow", "green", "blue",
       "purple", "pink", "brown", "gray", "black"]


def __fingerprint(h):
    # Turn a hash number into 7 colored squares, one per digit.
    s = str(h).zfill(7)[-7:]
    return [PAL[int(d)] for d in s]


def __show_attack(secret_word="dragon", wordlist=None):
    if wordlist is None:
        wordlist = ["password", "123456", "dragon", "qwerty", "leo"]
    try:
        rows = [__fingerprint(simple_hash(secret_word))]   # the stolen target
        rows.append(["" for _ in range(7)])                # gap row
        for word in wordlist:
            rows.append(__fingerprint(simple_hash(word)))
    except Exception:
        rows = [["gray" for _ in range(7)]]
    return rows
# === PAINTER END ===


# Precompute real hashes so the test args are genuine targets.
_DRAGON = simple_hash("dragon")
_WORDS = ["password", "123456", "dragon", "qwerty", "leo"]

TESTS_SPEC = [
    {"entry": "simple_hash", "cases": [
        {"name": "hashes 'leo'", "args": ["leo"]},
        {"name": "hashes 'dragon'", "args": ["dragon"]},
        {"name": "hashes 'password'", "args": ["password"]},
        {"name": "empty password still hashes", "args": [""]},
    ]},
    {"entry": "dictionary_attack", "cases": [
        {"name": "cracks the common word 'dragon'", "args": [_DRAGON, _WORDS]},
        {"name": "strong password isn't in the list", "args": [simple_hash("xQ9!vzt"), _WORDS]},
        {"name": "cracks 'password'", "args": [simple_hash("password"), _WORDS]},
    ]},
    {"entry": "salted_hash", "cases": [
        {"name": "salt 'a1' + dragon", "args": ["dragon", "a1"]},
        {"name": "different salt 'z9' + same password", "args": ["dragon", "z9"]},
        {"name": "salt the word 'leo'", "args": ["leo", "k3"]},
    ]},
]

VIZ_SPEC = {
    "type": "draw",
    "resultFn": "__show_attack",
    "demoArgs": ["dragon", _WORDS],
    "title": "Password fingerprints: top row is the stolen hash — find the common word whose fingerprint matches it",
}


if __name__ == "__main__":
    import json
    print("simple_hash:", [simple_hash(w) for w in ["leo", "dragon", "password", ""]])
    print("dictionary_attack:", dictionary_attack(_DRAGON, _WORDS))
    print("salted:", salted_hash("dragon", "a1"), salted_hash("dragon", "z9"))
    print("attack rows:", len(__show_attack("dragon", _WORDS)))
