# reference.py — answer key for lesson-06 (The One-Time Pad). INERT (see
# lesson-01/reference.py for why). Source of truth for tests.json.


def otp_encrypt(message, key_nums):
    return [ord(c) ^ k for c, k in zip(message, key_nums)]


def otp_decrypt(numbers, key_nums):
    return "".join(chr(n ^ k) for n, k in zip(numbers, key_nums))


def two_time_leak(cipher1, cipher2):
    return [a ^ b for a, b in zip(cipher1, cipher2)]
