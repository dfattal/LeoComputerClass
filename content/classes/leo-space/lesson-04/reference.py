# reference.py — answer key for leo-space/lesson-04 (Escape!).
#
# INERT: never served or built. Used only by `npm run validate-class leo-space`
# to check tests.json values and to run the teaching graph against a real
# solution (the viz now calls escape_speed by name).

import math

G = 6.674e-11


def escape_speed(M, r):
    return math.sqrt(2 * G * M / r)


def total_energy(M, v, r):
    return 0.5 * v ** 2 - G * M / r


def will_escape(M, v, r):
    return (0.5 * v ** 2 - G * M / r) >= 0
