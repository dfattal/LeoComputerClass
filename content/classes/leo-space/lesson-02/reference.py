# reference.py — answer key for leo-space/lesson-02 (Falling Around the World).
#
# INERT: never served or built. Used only by `npm run validate-class leo-space`
# to check tests.json values and to run the teaching graph against a real
# solution (the viz now calls orbital_speed by name).

import math

G = 6.674e-11


def orbital_speed(M, r):
    return math.sqrt(G * M / r)


def gravity_xy(M, x, y):
    r = math.sqrt(x * x + y * y)
    return [-G * M * x / r ** 3, -G * M * y / r ** 3]


def orbit_sim(M, r0, v, dt, steps):
    x = r0
    y = 0.0
    vx = 0.0
    vy = v
    for _ in range(steps):
        r = math.sqrt(x * x + y * y)
        ax = -G * M * x / r ** 3
        ay = -G * M * y / r ** 3
        vx += ax * dt
        vy += ay * dt
        x += vx * dt
        y += vy * dt
    return math.sqrt(x * x + y * y)
