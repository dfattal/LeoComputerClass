# Ellipses & Kepler
# Real orbits are stretched ovals. Measure them, time them, simulate them.
#
# Reminder: perigee = closest, apogee = farthest. Bigger orbits take longer.
#
# Tip: leave each "pass" as-is until you replace it with your code — don't just
# delete it, or Python will complain that a function is empty.

import math

G = 6.674e-11  # the gravitational constant


# Exercise 1: How Stretched? (Eccentricity)
# e = (r_apo - r_peri) / (r_apo + r_peri)
def eccentricity(r_peri, r_apo):
    # Your code here
    pass


# Exercise 2: How Long Is a Lap? (Kepler's Third Law)
# T = 2 * pi * sqrt(a**3 / (G * M))
def orbital_period(M, a):
    # Your code here
    pass


# Exercise 3: Find the Apogee
# Launch sideways above circular speed, simulate, return the farthest distance.
def farthest_point(M, r0, v0, dt, steps):
    x = r0
    y = 0.0
    vx = 0.0
    vy = v0
    farthest = r0
    for _ in range(steps):
        r = math.sqrt(x * x + y * y)
        # 1. ax = -G*M*x/r**3 ,  ay = -G*M*y/r**3
        # 2. vx += ax*dt ,  vy += ay*dt
        # 3. x += vx*dt ,  y += vy*dt
        # 4. d = math.sqrt(x*x + y*y); if d > farthest: farthest = d
        pass
    return farthest


# Press Run to see the Graph panel: the same orbit launched at three speeds —
# a circle, a gentle ellipse, and a tall stretched ellipse.
# Once you've filled in the functions above, uncomment these to test them:
# print(eccentricity(7e6, 1.4e7))
# print(orbital_period(5.972e24, 7e6))
# print(farthest_point(5.972e24, 7e6, 8200, 1, 10000))
print("Press Run to see circles stretch into ellipses (Graph panel)!")
