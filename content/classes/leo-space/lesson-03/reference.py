# reference.py — answer key for leo-space/lesson-03 (Ellipses & Kepler).
#
# INERT: never served or built. Used only by `npm run validate-class leo-space`
# to check tests.json values and to run the teaching graph against a real
# solution (the viz now calls farthest_point by name to draw the ellipse).

import math

G = 6.674e-11


def eccentricity(r_peri, r_apo):
    return (r_apo - r_peri) / (r_apo + r_peri)


def orbital_period(M, a):
    return 2 * math.pi * math.sqrt(a ** 3 / (G * M))


def farthest_point(M, r0, v0, dt, steps):
    x = r0
    y = 0.0
    vx = 0.0
    vy = v0
    farthest = r0
    for _ in range(steps):
        r = math.sqrt(x * x + y * y)
        ax = -G * M * x / r ** 3
        ay = -G * M * y / r ** 3
        vx += ax * dt
        vy += ay * dt
        x += vx * dt
        y += vy * dt
        d = math.sqrt(x * x + y * y)
        if d > farthest:
            farthest = d
    return farthest
