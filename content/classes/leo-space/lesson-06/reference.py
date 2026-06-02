# reference.py — answer key for leo-space/lesson-06 (The Lunar Lander).
#
# INERT: never served or built. Used only by `npm run validate-class leo-space`
# to check tests.json values and to run the teaching graph against a real
# solution (the viz now steps each descent with lander_step by name).

g_moon = 1.62  # the Moon's surface gravity


def lander_step(h, v, thrust, g, dt):
    v2 = v + (thrust - g) * dt
    h2 = h + v2 * dt
    return [h2, v2]


def land(h0, v0, thrust, g, dt, steps):
    h = h0
    v = v0
    for _ in range(steps):
        v = v + (thrust - g) * dt
        h = h + v * dt
        if h <= 0:
            break
    return v


def is_safe(touchdown_speed):
    return abs(touchdown_speed) <= 2.0
