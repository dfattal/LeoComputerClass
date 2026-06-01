# The One-Time Pad
# The only PROVABLY unbreakable code. The key is a list of random numbers, as
# long as the message, used exactly ONCE. XOR each letter with its own key number.
#
# Three rules make it unbreakable:
#   1. key as long as the message   2. key truly random   3. key used only once
#
# Python's zip pairs a message and key list together:
#   for c, k in zip(message, key_nums): ...   # c = a letter, k = its key number
#
# Tip: leave each "pass" as-is until you replace it with your code — don't just
# delete it, or Python will complain that a function is empty.


# ---------------------------------------------------------------------------
# Exercise 1: Encrypt — XOR each letter with its matching key number
# ---------------------------------------------------------------------------
def otp_encrypt(message, key_nums):
    # return [ord(c) ^ k for c, k in zip(message, key_nums)]
    pass


# ---------------------------------------------------------------------------
# Exercise 2: Decrypt — XOR each cipher number with its matching key number
# ---------------------------------------------------------------------------
def otp_decrypt(numbers, key_nums):
    # return "".join(chr(n ^ k) for n, k in zip(numbers, key_nums))
    pass


# ---------------------------------------------------------------------------
# Exercise 3: The two-time leak — XOR two ciphertexts that reused the same key.
# The key cancels out, so this leaks P1 XOR P2 (and that's why keys can't repeat).
# ---------------------------------------------------------------------------
def two_time_leak(cipher1, cipher2):
    # return [a ^ b for a, b in zip(cipher1, cipher2)]
    pass


# Press Run to see the Graph panel: two ciphertexts that reused one key, XOR'd
# together — they land exactly on the plaintexts XOR'd directly. The key vanished!
# Once you've filled in the functions above, uncomment these to test them:
# c = otp_encrypt("fire now", [7, 7, 7, 7, 7, 7, 7, 7])
# print(c)
# print(otp_decrypt(c, [7, 7, 7, 7, 7, 7, 7, 7]))
print("Press Run to watch a reused key vanish (Graph panel)!")
