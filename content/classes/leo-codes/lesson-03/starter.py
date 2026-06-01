# The Substitution Cipher
# Scramble the WHOLE alphabet into a secret key. Now there are 26! keys
# (about 400,000,000,000,000,000,000,000,000) — far too many to brute-force.
#
# Your key is a 26-letter scrambled alphabet:
#   key[0] is what 'a' becomes, key[1] is what 'b' becomes, ... key[25] is 'z'.
#
# Tip: leave each "pass" as-is until you replace it with your code — don't just
# delete it, or Python will complain that a function is empty.


# GIVEN — the normal alphabet and a sample scrambled key to test with.
ALPHA = "abcdefghijklmnopqrstuvwxyz"
KEY = "qwertyuiopasdfghjklzxcvbnm"


# ---------------------------------------------------------------------------
# Exercise 1: Encrypt by substitution
# ---------------------------------------------------------------------------
def substitute(message, key):
    # For each character c in message:
    #   if "a" <= c <= "z": use key[ord(c) - 97]
    #   else: keep c unchanged
    pass


# ---------------------------------------------------------------------------
# Exercise 2: Build the reverse key (the decoding alphabet)
# ---------------------------------------------------------------------------
def invert_key(key):
    # Make 26 empty slots. For each position i, key[i] is a cipher letter;
    # put ALPHA[i] into that cipher letter's slot. Then join into a string.
    pass


# ---------------------------------------------------------------------------
# Exercise 3: Decrypt (substitute with the reverse key)
# ---------------------------------------------------------------------------
def unsubstitute(message, key):
    # return substitute(message, invert_key(key))
    pass


# Press Run to see the Graph panel: the scramble drawn as a mapping — every
# letter jumps to a brand-new spot, with no single shift to undo.
# Once you've filled in the functions above, uncomment these to test them:
# secret = substitute("meet me at noon", KEY)
# print(secret)
# print(unsubstitute(secret, KEY))
print("Press Run to see the scrambled alphabet mapping (Graph panel)!")
