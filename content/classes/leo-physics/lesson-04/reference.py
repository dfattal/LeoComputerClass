# reference.py — answer key for leo-physics/lesson-04 (Range, Height & Hang Time).
#
# INERT: never served or built. Used only by `npm run validate-class leo-physics`
# to check tests.json values and to run the teaching graph against a real
# solution (the viz now calls best_angle by name).

import math

g = 9.8


def simulate_shot(speed, angle_deg, k, m, dt):
    angle_rad = math.radians(angle_deg)
    vx = speed * math.cos(angle_rad)
    vy = speed * math.sin(angle_rad)
    x = 0.0
    y = 0.0
    t = 0.0
    peak = 0.0
    while True:
        spd = math.sqrt(vx * vx + vy * vy)
        ax = -(k / m) * spd * vx
        ay = -g - (k / m) * spd * vy
        vx += ax * dt
        vy += ay * dt
        x += vx * dt
        y += vy * dt
        t += dt
        if y > peak:
            peak = y
        if y <= 0:
            break
    return [x, peak, t]


def best_angle(speed, k, m, dt):
    best_angle_so_far = None
    best_range = -1
    for angle in range(10, 71):
        r = simulate_shot(speed, angle, k, m, dt)[0]
        if r > best_range:
            best_range = r
            best_angle_so_far = angle
    return best_angle_so_far


def range_lost_to_air(speed, angle_deg, k, m, dt):
    vacuum_range = speed ** 2 * math.sin(math.radians(2 * angle_deg)) / g
    drag_range = simulate_shot(speed, angle_deg, k, m, dt)[0]
    return vacuum_range - drag_range
