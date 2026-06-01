# reference.py — answer key for lesson-01 (The Caesar Cipher).
#
# INERT: loadLesson.ts only reads fixed filenames (lesson.mdx, exercises.mdx,
# tests.json, rubric.json, starter.py, viz.json), so this file is never served
# or built. It exists so scripts/validate-class.mjs can generate the exact
# expected values in tests.json from a real solution. reference.py is the source
# of truth; tests.json is generated from it.


def shift_letter(letter, n):
    if "a" <= letter <= "z":
        return chr((ord(letter) - 97 + n) % 26 + 97)
    return letter


def caesar_encrypt(message, n):
    return "".join(shift_letter(c, n) for c in message)


def caesar_decrypt(message, n):
    return "".join(shift_letter(c, -n) for c in message)
