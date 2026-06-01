# Crack It: Brute Force
# A Caesar cipher has only 26 keys — so a computer can try them ALL and spot
# the one that turns gibberish into real English.
#
# Tip: leave each "pass" as-is until you replace it with your code — don't just
# delete it, or Python will complain that a function is empty.


# ---------------------------------------------------------------------------
# GIVEN — your Lesson 1 tools, ready to use. Don't change these.
# ---------------------------------------------------------------------------
def shift_letter(letter, n):
    if "a" <= letter <= "z":
        return chr((ord(letter) - 97 + n) % 26 + 97)
    return letter


def caesar_decrypt(message, n):
    return "".join(shift_letter(c, -n) for c in message)


# GIVEN — the most common little words in English, and a fast lookup set.
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


# ---------------------------------------------------------------------------
# Exercise 1: Every possible decryption (a list of 26 strings)
# ---------------------------------------------------------------------------
def all_shifts(message):
    # Return [caesar_decrypt(message, n) for n in range(26)]
    pass


# ---------------------------------------------------------------------------
# Exercise 2: How English does this text look? (count common words)
# ---------------------------------------------------------------------------
def english_score(text):
    # Split text into words; count how many are in COMMON_SET.
    pass


# ---------------------------------------------------------------------------
# Exercise 3: Crack it — return the shift that scores the most like English
# ---------------------------------------------------------------------------
def crack_caesar(message):
    # Try every shift 0..25. Score each decryption with english_score.
    # Keep the shift with the highest score and return it.
    # Start best_score at -1 so the first shift can win.
    pass


# Press Run to see the Graph panel: the English-score for each of the 26 shifts,
# with one shift spiking far above the rest — that spike is the secret key.
# Once you've filled in the functions above, uncomment these to test them:
# secret = "aol xbpjr iyvdu mve huk aol shgf kvn"
# key = crack_caesar(secret)
# print("key =", key)
# print(caesar_decrypt(secret, key))
print("Press Run to watch one shift spike above the rest (Graph panel)!")
