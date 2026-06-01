# The Caesar Cipher
# Build your first secret code — slide every letter the same number of steps.
#
# The rules:
#   - Work on lowercase letters a-z.
#   - Leave spaces and other characters unchanged.
#   - The alphabet WRAPS AROUND: after z comes a again (that's what % 26 does).
#
# The one-line trick for shifting a single letter by n:
#   chr((ord(letter) - 97 + n) % 26 + 97)
#
# Tip: leave each "pass" as-is until you replace it with your code — don't just
# delete it, or Python will complain that a function is empty.


# Exercise 1: Shift one letter (wrap around; leave non-letters alone)
def shift_letter(letter, n):
    # If "a" <= letter <= "z": return the shifted letter (wrap with % 26).
    # Otherwise: return letter unchanged.
    pass


# Exercise 2: Encrypt a whole message by shifting every letter forward
def caesar_encrypt(message, n):
    # Shift each character with shift_letter(c, n) and join them back together.
    pass


# Exercise 3: Decrypt by shifting back the other way (shift by -n)
def caesar_decrypt(message, n):
    # Same idea as encrypt, but shift each character by -n.
    pass


# Press Run to see the Graph panel: the cipher wheel turned by your key, showing
# where every letter lands.
# Once you've filled in the functions above, uncomment these to test them:
# (Encrypt, then decrypt with the same key — you should get the original back!)
# secret = caesar_encrypt("attack at dawn", 5)
# print(secret)
# print(caesar_decrypt(secret, 5))
print("Press Run to see the cipher wheel turn (Graph panel)!")
