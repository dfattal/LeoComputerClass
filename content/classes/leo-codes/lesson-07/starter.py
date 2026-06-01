# Key Exchange by Color-Mixing (Diffie-Hellman)
# How do two spies agree on a secret key while everyone is listening? With an
# operation that's EASY to do but nearly impossible to undo — like mixing paint.
#
# Everything happens on a "clock" with a prime number of hours p: do the math,
# then take the remainder mod p. Python's three-argument pow does it in one step:
#   pow(base, exp, mod)  ==  (base ** exp) % mod, but fast and exact.
#
# Public (shout them out): base g = 5, prime p = 23.
#
# Tip: leave each "pass" as-is until you replace it with your code — don't just
# delete it, or Python will complain that a function is empty.


# ---------------------------------------------------------------------------
# Exercise 1: The mix machine — base ** exp, wrapped mod mod
# ---------------------------------------------------------------------------
def power_mod(base, exp, mod):
    # return pow(base, exp, mod)
    pass


# ---------------------------------------------------------------------------
# Exercise 2: Your public mix — g^secret mod p (safe to send out loud)
# ---------------------------------------------------------------------------
def public_key(g, secret, p):
    # return power_mod(g, secret, p)
    pass


# ---------------------------------------------------------------------------
# Exercise 3: The shared secret — stir YOUR secret into the mix you RECEIVED
# ---------------------------------------------------------------------------
def shared_key(received, secret, p):
    # return power_mod(received, secret, p)
    pass


# Press Run to see the Graph panel: the "mix" g^x mod p for each secret x — it
# bounces all over the clock, which is why no one can run it backwards.
# Once you've filled in the functions above, uncomment these to test them:
# g, p = 5, 23
# A = public_key(g, 6, p)    # Alice sends A
# B = public_key(g, 15, p)   # Bob sends B
# print(shared_key(B, 6, p), shared_key(A, 15, p))   # same secret!
print("Press Run to see the one-way mix bounce around the clock (Graph panel)!")
