# reference.py — answer key for leo-space/lesson-07 (Transfer to Mars).
#
# INERT: never served or built. Used only by `npm run validate-class leo-space`
# to check tests.json values and to run the teaching graph against a real
# solution (the viz now draws the transfer ellipse from transfer_axis by name).

import math

G = 6.674e-11
M_SUN = 1.989e30


def transfer_axis(r1, r2):
    return (r1 + r2) / 2


def burn_one(M, r1, r2):
    a = (r1 + r2) / 2
    v_transfer = math.sqrt(G * M * (2 / r1 - 1 / a))
    v_circle = math.sqrt(G * M / r1)
    return v_transfer - v_circle


def transfer_time(M, r1, r2):
    a = (r1 + r2) / 2
    return math.pi * math.sqrt(a ** 3 / (G * M))
