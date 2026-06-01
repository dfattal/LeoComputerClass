# reference.py — answer key for lesson-05 (The XOR Trick). INERT (see
# lesson-01/reference.py for why). Source of truth for tests.json.


def xor_num(a, b):
    return a ^ b


def xor_encrypt(message, key):
    return [ord(c) ^ key for c in message]


def xor_decrypt(numbers, key):
    return "".join(chr(n ^ key) for n in numbers)
