# The Public Lock (Capstone) — tiny RSA
# A lock anyone can snap shut (the PUBLIC key), that only YOU can open (the
# PRIVATE key). This is the code that protects the whole internet — built here
# with tiny numbers so you can see every step.
#
# Messages are NUMBERS smaller than n. Lock with e, unlock with d.
# Use the fast three-argument pow(base, exp, mod) for the clock math.
#
# Tip: leave each "pass" as-is until you replace it with your code — don't just
# delete it, or Python will complain that a function is empty.


# ---------------------------------------------------------------------------
# GIVEN — the key setup. Don't change these.
#   Two primes -> n (the public clock) and phi (a secret helper).
# ---------------------------------------------------------------------------
p = 5
q = 11
n = p * q              # = 55, public
phi = (p - 1) * (q - 1)  # = 40, secret (needs the primes)
e = 3                  # public exponent (shares no factors with phi)


def gcd(a, b):
    # Greatest common divisor — handy for checking e shares no factors with phi.
    while b:
        a, b = b, a % b
    return a


# ---------------------------------------------------------------------------
# Exercise 1: Find the private key d (smallest d >= 1 with (e*d) % phi == 1)
# ---------------------------------------------------------------------------
def private_key(e, phi):
    # Try d = 1, 2, 3, ... until (e * d) % phi == 1, then return that d.
    pass


# ---------------------------------------------------------------------------
# Exercise 2: Lock a number with the PUBLIC key: m^e mod n
# ---------------------------------------------------------------------------
def encrypt(m, e, n):
    # return pow(m, e, n)
    pass


# ---------------------------------------------------------------------------
# Exercise 3: Unlock with the PRIVATE key: c^d mod n
# ---------------------------------------------------------------------------
def decrypt(c, d, n):
    # return pow(c, d, n)
    pass


# Press Run to see the Graph panel: locking scrambles every number, but unlocking
# with the private key lands each one right back on the diagonal (home again).
# Once you've filled in the functions above, uncomment these to test them:
# d = private_key(e, phi)
# print("public key:", (e, n), " private key:", d)
# locked = encrypt(9, e, n)
# print("locked:", locked, " unlocked:", decrypt(locked, d, n))
print("Press Run to watch the public lock and private key in action (Graph panel)!")
