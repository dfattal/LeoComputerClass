# reference.py — answer key for lesson-02 (Crack It: Brute Force). INERT (see
# lesson-01/reference.py for why). Source of truth for tests.json.


def shift_letter(letter, n):
    if "a" <= letter <= "z":
        return chr((ord(letter) - 97 + n) % 26 + 97)
    return letter


def caesar_decrypt(message, n):
    return "".join(shift_letter(c, -n) for c in message)


COMMON_WORDS = [
    "the", "and", "you", "that", "was", "for", "are", "with", "his", "they",
    "this", "have", "from", "one", "had", "not", "but", "what", "all", "when",
    "your", "can", "there", "use", "each", "she", "how", "their", "will",
    "about", "out", "them", "then", "some", "her", "would", "make", "like",
    "him", "into", "time", "has", "two", "more", "see", "way", "could", "who",
    "its", "now", "did", "get", "come", "is", "to", "of", "in", "it", "he",
    "on", "as", "at", "be", "we", "or", "by", "a", "i", "an", "my", "so", "up",
]
COMMON_SET = set(COMMON_WORDS)


def all_shifts(message):
    return [caesar_decrypt(message, n) for n in range(26)]


def english_score(text):
    return sum(1 for word in text.split() if word in COMMON_SET)


def crack_caesar(message):
    best_shift = 0
    best_score = -1
    for n in range(26):
        score = english_score(caesar_decrypt(message, n))
        if score > best_score:
            best_score = score
            best_shift = n
    return best_shift
