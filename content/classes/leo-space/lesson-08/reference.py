# reference.py — answer key for leo-space/lesson-08 (Mission Control / Capstone).
#
# INERT: never served or built. Used only by `npm run validate-class leo-space`
# to check tests.json values and to run the teaching graph against a real
# solution (the viz now plots roundness/best_factor by name). v_circle and
# sim_orbit are the GIVEN tools from the starter — included so the search
# functions can run.

import math

G = 6.674e-11


def v_circle(M, r0):
    return math.sqrt(G * M / r0)


def sim_orbit(M, r0, v, dt, steps):
    x = r0
    y = 0.0
    vx = 0.0
    vy = v
    min_r = r0
    max_r = r0
    for _ in range(steps):
        r = math.sqrt(x * x + y * y)
        f = G * M / (r * r * r)
        vx += -f * x * dt
        vy += -f * y * dt
        x += vx * dt
        y += vy * dt
        d = math.sqrt(x * x + y * y)
        if d < min_r:
            min_r = d
        if d > max_r:
            max_r = d
    return [min_r, max_r]


def roundness(M, r0, v, dt, steps):
    min_r, max_r = sim_orbit(M, r0, v, dt, steps)
    return max_r - min_r


def best_factor(M, r0, dt, steps):
    vc = v_circle(M, r0)
    best_f = 0
    best_score = 1e99
    f = 0.80
    while f <= 1.20 + 1e-9:
        score = roundness(M, r0, f * vc, dt, steps)
        if score < best_score:
            best_score = score
            best_f = f
        f = f + 0.02
    return round(best_f, 2)


def best_speed(M, r0, dt, steps):
    return best_factor(M, r0, dt, steps) * v_circle(M, r0)
