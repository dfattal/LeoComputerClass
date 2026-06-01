# reference.py — answer key for lesson-04 (Frequency Analysis). INERT (see
# lesson-01/reference.py for why). Source of truth for tests.json.

ALPHA = "abcdefghijklmnopqrstuvwxyz"
ENGLISH_FREQ_ORDER = "etaoinshrdlcumwfgypbvkjxqz"


def letter_counts(text):
    counts = [0] * 26
    for c in text:
        if "a" <= c <= "z":
            counts[ord(c) - 97] += 1
    return counts


def most_common_letter(text):
    counts = letter_counts(text)
    best_i = 0
    best_count = counts[0]
    for i in range(1, 26):
        if counts[i] > best_count:
            best_count = counts[i]
            best_i = i
    return ALPHA[best_i]


def crack_by_frequency(ciphertext):
    counts = letter_counts(ciphertext)
    order = sorted(range(26), key=lambda i: (-counts[i], i))
    mapping = {}
    for k in range(26):
        mapping[ALPHA[order[k]]] = ENGLISH_FREQ_ORDER[k]
    return "".join(mapping.get(c, c) for c in ciphertext)
