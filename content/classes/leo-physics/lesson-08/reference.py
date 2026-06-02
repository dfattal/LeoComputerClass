# reference.py — answer key for leo-physics/lesson-08 (Design Optimizer / Capstone).
#
# INERT: never served or built. Used only by `npm run validate-class leo-physics`
# to check tests.json values and to run the teaching graph against a real
# solution (the viz now calls best_mass/max_range by name). blast_range is the
# GIVEN simulator from the starter — included so the search functions can run.

import math


def blast_range(m, x0, k, angle_deg, kdrag, dt):
    g = 9.8
    speed = x0 * math.sqrt(k / m)
    r = math.radians(angle_deg)
    vx = speed * math.cos(r)
    vy = speed * math.sin(r)
    x = 0.0
    y = 0.0
    while True:
        sp = math.sqrt(vx * vx + vy * vy)
        vx += -(kdrag / m) * sp * vx * dt
        vy += (-g - (kdrag / m) * sp * vy) * dt
        x += vx * dt
        y += vy * dt
        if y <= 0:
            break
    return x


def best_mass(x0, k, angle_deg, kdrag, dt):
    best_m = 0.0
    best_range = -1
    m = 0.005
    while m <= 0.06 + 1e-9:
        r = blast_range(m, x0, k, angle_deg, kdrag, dt)
        if r > best_range:
            best_range = r
            best_m = m
        m = m + 0.005
    return best_m


def max_range(x0, k, angle_deg, kdrag, dt):
    m = best_mass(x0, k, angle_deg, kdrag, dt)
    return blast_range(m, x0, k, angle_deg, kdrag, dt)


def best_possible_range(x0, k, kdrag, dt):
    best_range = -1
    m = 0.005
    while m <= 0.06 + 1e-9:
        angle = 15
        while angle <= 60 + 1e-9:
            r = blast_range(m, x0, k, angle, kdrag, dt)
            if r > best_range:
                best_range = r
            angle = angle + 5
        m = m + 0.005
    return best_range
