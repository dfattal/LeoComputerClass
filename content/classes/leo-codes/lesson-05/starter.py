# The XOR Trick
# Computers think in bits. XOR ("are these two bits different?") is the secret
# weapon of real cryptography. Its magic: XOR with the SAME key twice gets you
# back to where you started — so encrypt and decrypt are the SAME operation.
#
#   5 ^ 3 = 6     (in bits: 101 XOR 011 = 110)
#   (A ^ K) ^ K = A    <- the key undoes itself
#
# To XOR a letter, turn it into a number with ord(c); turn it back with chr(n).
#
# Tip: leave each "pass" as-is until you replace it with your code — don't just
# delete it, or Python will complain that a function is empty.


# ---------------------------------------------------------------------------
# Exercise 1: XOR two numbers (warm-up — it's the ^ operator)
# ---------------------------------------------------------------------------
def xor_num(a, b):
    # return a ^ b
    pass


# ---------------------------------------------------------------------------
# Exercise 2: Encrypt — XOR each letter's number with the key (returns numbers)
# ---------------------------------------------------------------------------
def xor_encrypt(message, key):
    # return [ord(c) ^ key for c in message]
    pass


# ---------------------------------------------------------------------------
# Exercise 3: Decrypt — XOR each number with the key again, back to letters
# ---------------------------------------------------------------------------
def xor_decrypt(numbers, key):
    # return "".join(chr(n ^ key) for n in numbers)
    pass


# Press Run to see the Graph panel: your letters as numbers, and the same letters
# after XOR — the cipher line jumps all over while the secret hides in the bits.
# Once you've filled in the functions above, uncomment these to test them:
# secret = xor_encrypt("top secret", 200)
# print(secret)
# print(xor_decrypt(secret, 200))
print("Press Run to see XOR scramble the bits (Graph panel)!")
