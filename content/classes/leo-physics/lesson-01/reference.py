# reference.py — answer key for leo-physics/lesson-01 (From Calculus to Simulation).
#
# INERT: never served or built. loadLesson.ts only reads the fixed student files,
# so this is used solely by `npm run validate-class leo-physics` to (a) check the
# tests.json expected values and (b) run the teaching graph against a real
# solution (the viz now calls these functions by name).

g = 9.8  # gravity, m/s^2


def step_velocity(v, a, dt):
    return v + a * dt


def step_position(x, v, dt):
    return x + v * dt


def fall(h0, dt, steps):
    v = 0.0
    h = h0
    for _ in range(steps):
        v = step_velocity(v, -g, dt)
        h = step_position(h, v, dt)
    return h
