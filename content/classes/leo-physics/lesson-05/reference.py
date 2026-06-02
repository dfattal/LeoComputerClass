# reference.py — answer key for leo-physics/lesson-05 (Spring-Powered Blasters).
#
# INERT: never served or built. Used only by `npm run validate-class leo-physics`
# to check tests.json values and to run the teaching graph against a real
# solution (the viz now calls spring_force by name).

import math


def spring_force(compression, k):
    if compression > 0:
        return k * compression
    return 0.0


def muzzle_velocity(x0, k, m, barrel, dt):
    d = 0.0
    v = 0.0
    while d < barrel:
        s = x0 - d
        a = spring_force(s, k) / m
        v = v + a * dt
        d = d + v * dt
    return v


def ideal_muzzle_velocity(x0, k, m):
    return x0 * math.sqrt(k / m)
