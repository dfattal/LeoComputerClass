# reference.py — answer key for leo-physics/lesson-06 (Compressed-Air Blasters).
#
# INERT: never served or built. Used only by `npm run validate-class leo-physics`
# to check tests.json values and to run the teaching graph against a real
# solution (the viz now calls air_muzzle_velocity by name).

PATM = 100000.0  # atmospheric pressure (Pa)


def gas_pressure(P0, V0, A, d):
    return P0 * V0 / (V0 + A * d)


def air_muzzle_velocity(P0, V0, A, m, barrel, dt):
    d = 0.0
    v = 0.0
    while d < barrel:
        P = gas_pressure(P0, V0, A, d)
        a = (P - PATM) * A / m
        v = v + a * dt
        d = d + v * dt
        if v <= 0:
            break
    return v


def best_barrel(P0, V0, A, m, dt):
    best_len = 0.0
    best_v = -1.0
    barrel = 0.05
    while barrel <= 1.0 + 1e-9:
        v = air_muzzle_velocity(P0, V0, A, m, barrel, dt)
        if v > best_v:
            best_v = v
            best_len = barrel
        barrel = barrel + 0.05
    return round(best_len, 2)
