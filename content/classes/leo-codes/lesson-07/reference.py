# reference.py — answer key for lesson-07 (Diffie-Hellman key exchange). INERT
# (see lesson-01/reference.py for why). Source of truth for tests.json.


def power_mod(base, exp, mod):
    return pow(base, exp, mod)


def public_key(g, secret, p):
    return power_mod(g, secret, p)


def shared_key(received, secret, p):
    return power_mod(received, secret, p)
