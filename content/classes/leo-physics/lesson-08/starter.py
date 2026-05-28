# Design Optimizer (Capstone)
# Use your blaster simulator to DESIGN: search many designs, keep the best.
#
# Tip: leave each "pass" as-is until you replace it with your code — don't just
# delete it, or Python will complain that a function is empty.

import math


# ---------------------------------------------------------------------------
# GIVEN — your complete blaster from Lesson 7. Don't change this.
# Returns how far a dart of mass m flies (muzzle speed from the energy
# formula v = x0*sqrt(k/m), then the drag flight).
# ---------------------------------------------------------------------------
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


# ---------------------------------------------------------------------------
# Exercise 1: The Best Dart Mass — sweep masses, keep the farthest-flying.
# ---------------------------------------------------------------------------
def best_mass(x0, k, angle_deg, kdrag, dt):
    best_m = 0.0
    best_range = -1
    m = 0.005
    while m <= 0.06 + 1e-9:
        r = blast_range(m, x0, k, angle_deg, kdrag, dt)
        # if r > best_range: save best_range and best_m
        m = m + 0.005
    return best_m


# ---------------------------------------------------------------------------
# Exercise 2: Range of the best dart.
# ---------------------------------------------------------------------------
def max_range(x0, k, angle_deg, kdrag, dt):
    m = best_mass(x0, k, angle_deg, kdrag, dt)
    # return blast_range(m, x0, k, angle_deg, kdrag, dt)
    pass


# ---------------------------------------------------------------------------
# Exercise 3: The perfect blaster — tune mass AND angle (a loop in a loop).
# ---------------------------------------------------------------------------
def best_possible_range(x0, k, kdrag, dt):
    best_range = -1
    m = 0.005
    while m <= 0.06 + 1e-9:
        angle = 15
        while angle <= 60 + 1e-9:
            r = blast_range(m, x0, k, angle, kdrag, dt)
            # if r > best_range: save best_range
            angle = angle + 5
        m = m + 0.005
    return best_range


# Press Run to see the Graph panel: range vs dart mass, with the sweet-spot
# mass at the peak (and how it shifts when the air gets draggier).
# Once you've filled in the functions above, uncomment these to test them:
# print(best_mass(0.1, 200, 35, 0.002, 0.002))
# print(max_range(0.1, 200, 35, 0.002, 0.002))
# print(best_possible_range(0.1, 200, 0.002, 0.002))
print("Press Run to see the range-vs-mass graph (Graph panel)!")
