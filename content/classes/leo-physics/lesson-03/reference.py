# reference.py — answer key for leo-physics/lesson-03 (Air Resistance).
#
# INERT: never served or built. Used only by `npm run validate-class leo-physics`
# to check tests.json values and to run the teaching graph against a real
# solution (the viz now calls drag_accel by name).

import math

g = 9.8


def drag_accel(v, k, m):
    return -(k / m) * abs(v) * v


def terminal_velocity(k, m, dt):
    v = 0.0
    while True:
        a = -g + drag_accel(v, k, m)
        v = v + a * dt
        if abs(a) < 0.001:
            break
    return abs(v)


def range_with_drag(speed, angle_deg, k, m, dt):
    angle_rad = math.radians(angle_deg)
    vx = speed * math.cos(angle_rad)
    vy = speed * math.sin(angle_rad)
    x = 0.0
    y = 0.0
    while True:
        spd = math.sqrt(vx * vx + vy * vy)
        ax = -(k / m) * spd * vx
        ay = -g - (k / m) * spd * vy
        vx += ax * dt
        vy += ay * dt
        x += vx * dt
        y += vy * dt
        if y <= 0:
            break
    return x
