# reference.py — answer key for leo-physics/lesson-02 (Launch! Projectiles in 2D).
#
# INERT: never served or built. Used only by `npm run validate-class leo-physics`
# to check tests.json values and to run the teaching graph (which already calls
# velocity_components by name) against a real solution.

import math

g = 9.8


def velocity_components(speed, angle_deg):
    angle_rad = math.radians(angle_deg)
    return [speed * math.cos(angle_rad), speed * math.sin(angle_rad)]


def peak_height(speed, angle_deg, dt):
    vx, vy = velocity_components(speed, angle_deg)
    y = 0.0
    highest = 0.0
    while True:
        vy = vy + (-g) * dt
        y = y + vy * dt
        if y > highest:
            highest = y
        if vy <= 0:
            break
    return highest


def throw_range(speed, angle_deg, dt):
    vx, vy = velocity_components(speed, angle_deg)
    x = 0.0
    y = 0.0
    while True:
        vy = vy + (-g) * dt
        x = x + vx * dt
        y = y + vy * dt
        if y <= 0:
            break
    return x
