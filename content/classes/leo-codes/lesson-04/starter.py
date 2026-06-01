# Frequency Analysis
# A substitution cipher hides WHICH symbol stands for each letter — but it can't
# hide HOW OFTEN each letter shows up. In English, 'e' is the most common letter,
# so the most common symbol in the secret message is probably a disguised 'e'.
# Count the symbols, and the disguises fall off.
#
# Tip: leave each "pass" as-is until you replace it with your code — don't just
# delete it, or Python will complain that a function is empty.


# GIVEN — the normal alphabet, and English letters from MOST to LEAST common.
ALPHA = "abcdefghijklmnopqrstuvwxyz"
ENGLISH_FREQ_ORDER = "etaoinshrdlcumwfgypbvkjxqz"


# ---------------------------------------------------------------------------
# Exercise 1: Count each letter (a list of 26 numbers)
# ---------------------------------------------------------------------------
def letter_counts(text):
    # Start with 26 zeros. For each letter a-z in text, add 1 to counts[ord(c)-97].
    pass


# ---------------------------------------------------------------------------
# Exercise 2: The most common letter (ties go to the earlier letter)
# ---------------------------------------------------------------------------
def most_common_letter(text):
    # Get letter_counts(text). Scan for the biggest count using strict > so a
    # tie keeps the earlier letter. Return ALPHA[that position].
    pass


# ---------------------------------------------------------------------------
# Exercise 3: Crack a substitution by matching frequencies
# ---------------------------------------------------------------------------
def crack_by_frequency(ciphertext):
    # 1. counts = letter_counts(ciphertext)
    # 2. order = sorted(range(26), key=lambda i: (-counts[i], i))  # most common first
    # 3. mapping: ALPHA[order[k]] -> ENGLISH_FREQ_ORDER[k] for k in range(26)
    # 4. translate ciphertext through mapping (keep spaces and other chars)
    pass


# Press Run to see the Graph panel: a bar for how often each letter appears in a
# secret message, next to the typical English shape — the tallest bars give away
# the most common letters.
# Once you've filled in the functions above, uncomment these to test them:
# secret = "zit ltektz dtllqut iortl of hsqof louiz"
# print(most_common_letter(secret))
# print(crack_by_frequency(secret))
print("Press Run to see the letter-frequency bars (Graph panel)!")
