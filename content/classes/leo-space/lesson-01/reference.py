# reference.py — answer key for leo-space/lesson-01 (Gravity Gets Weaker).
#
# INERT: never served or built. Used only by `npm run validate-class leo-space`
# to check tests.json values and to run the teaching graph against a real
# solution (the viz now calls gravity_accel by name).

G = 6.674e-11  # gravitational constant


def gravity_force(m1, m2, r):
    return G * m1 * m2 / r ** 2


def gravity_accel(M, r):
    return G * M / r ** 2


def times_weaker(r_near, r_far):
    return (r_far / r_near) ** 2
