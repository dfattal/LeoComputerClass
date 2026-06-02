# reference.py — answer key for leo-physics/lesson-07 (The Whole Blaster).
#
# INERT: never served or built. Used only by `npm run validate-class leo-physics`
# to check tests.json values and to run the teaching graph against a real
# solution (the viz now calls muzzle_speed by name). drag_flight is the GIVEN
# engine from the starter — included here so blast_range/blast_report can run.

import math


def drag_flight(speed, angle_deg, m, kdrag, dt):
    g = 9.8
    r = math.radians(angle_deg)
    vx = speed * math.cos(r)
    vy = speed * math.sin(r)
    x = 0.0
    y = 0.0
    peak = 0.0
    while True:
        sp = math.sqrt(vx * vx + vy * vy)
        ax = -(kdrag / m) * sp * vx
        ay = -g - (kdrag / m) * sp * vy
        vx += ax * dt
        vy += ay * dt
        x += vx * dt
        y += vy * dt
        if y > peak:
            peak = y
        if y <= 0:
            break
    return [x, peak]


def muzzle_speed(x0, k, m, barrel, dt):
    d = 0.0
    v = 0.0
    while d < barrel:
        s = x0 - d
        F = k * s if s > 0 else 0.0
        v = v + (F / m) * dt
        d = d + v * dt
    return v


def blast_range(x0, k, m, barrel, angle_deg, kdrag, dt):
    speed = muzzle_speed(x0, k, m, barrel, dt)
    return drag_flight(speed, angle_deg, m, kdrag, dt)[0]


def blast_report(x0, k, m, barrel, angle_deg, kdrag, dt):
    speed = muzzle_speed(x0, k, m, barrel, dt)
    flight = drag_flight(speed, angle_deg, m, kdrag, dt)
    return [speed, flight[0], flight[1]]
