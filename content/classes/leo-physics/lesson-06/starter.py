# Compressed-Air Blasters
# Compressed gas pushes the dart; the pressure fades as the gas expands.
# Find the sweet-spot barrel length!
#
# SI units: pressure in Pa, volume in m^3, area in m^2, distance in m.
# Barrel is horizontal, so we ignore gravity. Update velocity first, then position.

PATM = 100000.0  # atmospheric pressure (Pa)


# Exercise 1: Gas Pressure (Boyle's law)
# As the dart moves d, the gas fills V0 + A*d, so P*V stays constant.
def gas_pressure(P0, V0, A, d):
    # return P0 * V0 / (V0 + A * d)
    pass


# Exercise 2: Air Muzzle Velocity
# Net force is (P - PATM) * A. Simulate down the barrel; return exit speed.
def air_muzzle_velocity(P0, V0, A, m, barrel, dt):
    d = 0.0
    v = 0.0
    while d < barrel:
        P = gas_pressure(P0, V0, A, d)
        a = (P - PATM) * A / m
        # update v = v + a*dt, then d = d + v*dt
        # safety: if v <= 0: break   (dart stalled in a too-long barrel)
        pass
    return v


# Exercise 3: Find the Best Barrel Length (the sweet spot)
# Try barrels 0.05 .. 1.0 m and keep the fastest.
def best_barrel(P0, V0, A, m, dt):
    best_len = 0.0
    best_v = -1.0
    barrel = 0.05
    while barrel <= 1.0 + 1e-9:
        v = air_muzzle_velocity(P0, V0, A, m, barrel, dt)
        # if v > best_v: save best_v and best_len
        barrel = barrel + 0.05
    return round(best_len, 2)


# Press Run to see the Graph panel: muzzle speed vs barrel length, with the
# sweet spot at the peak (and how it shifts for a bigger tank).
# Once you've filled in the functions above, uncomment these to test them:
# print(gas_pressure(300000, 0.00004, 0.0002, 0))
# print(air_muzzle_velocity(300000, 0.00004, 0.0002, 0.02, 0.4, 0.00005))
# print(best_barrel(300000, 0.00004, 0.0002, 0.02, 0.0002))
print("Press Run to see the barrel-length sweet-spot graph (Graph panel)!")
