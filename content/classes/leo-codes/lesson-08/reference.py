# reference.py — answer key for lesson-08 (tiny RSA, capstone). INERT (see
# lesson-01/reference.py for why). Source of truth for tests.json.

p = 5
q = 11
n = p * q                # = 55, public
phi = (p - 1) * (q - 1)  # = 40, secret
e = 3                    # public exponent


def gcd(a, b):
    while b:
        a, b = b, a % b
    return a


def private_key(e, phi):
    d = 1
    while (e * d) % phi != 1:
        d += 1
    return d


def encrypt(m, e, n):
    return pow(m, e, n)


def decrypt(c, d, n):
    return pow(c, d, n)
