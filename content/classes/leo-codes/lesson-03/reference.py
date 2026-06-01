# reference.py — answer key for lesson-03 (The Substitution Cipher). INERT (see
# lesson-01/reference.py for why). Source of truth for tests.json.

ALPHA = "abcdefghijklmnopqrstuvwxyz"
KEY = "qwertyuiopasdfghjklzxcvbnm"


def substitute(message, key):
    out = []
    for c in message:
        if "a" <= c <= "z":
            out.append(key[ord(c) - 97])
        else:
            out.append(c)
    return "".join(out)


def invert_key(key):
    slots = [""] * 26
    for i in range(26):
        slots[ord(key[i]) - 97] = ALPHA[i]
    return "".join(slots)


def unsubstitute(message, key):
    return substitute(message, invert_key(key))
