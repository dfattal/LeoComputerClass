# Falling Around the World
# Put a satellite in orbit: find the speed, aim gravity, run the 2D loop.
#
# Reminder: an orbit is falling sideways fast enough to keep missing the planet.
# Update BOTH velocity parts first, then BOTH position parts.
#
# Tip: leave each "pass" as-is until you replace it with your code — don't just
# delete it, or Python will complain that a function is empty.

import math

G = 6.674e-11  # the gravitational constant


# Exercise 1: The Orbit Speed
# v = sqrt(G * M / r)
def orbital_speed(M, r):
    # Your code here
    pass


# Exercise 2: Gravity as a 2D Arrow
# Return [ax, ay] pointing from (x, y) back toward the planet at the center.
def gravity_xy(M, x, y):
    # 1. r = math.sqrt(x*x + y*y)
    # 2. ax = -G * M * x / r**3
    # 3. ay = -G * M * y / r**3
    # 4. return [ax, ay]
    pass


# Exercise 3: Put It in Orbit!
# Start at (r0, 0), launch sideways at (0, v), step, return final distance.
def orbit_sim(M, r0, v, dt, steps):
    x = r0
    y = 0.0
    vx = 0.0
    vy = v
    for _ in range(steps):
        r = math.sqrt(x * x + y * y)
        # 1. ax = -G*M*x/r**3 ,  ay = -G*M*y/r**3
        # 2. vx += ax*dt ,  vy += ay*dt   (velocity first!)
        # 3. x += vx*dt ,  y += vy*dt     (then position)
        pass
    return math.sqrt(x * x + y * y)


# Press Run to see the Graph panel: three launches from the same spot —
# circular (a clean ring), too slow (spirals in), and too fast (stretches out).
# Once you've filled in the functions above, uncomment these to test them:
# print(orbital_speed(5.972e24, 7e6))
# print(gravity_xy(5.972e24, 7e6, 0))
# print(orbit_sim(5.972e24, 7e6, 7546, 1, 1500))
print("Press Run to watch three satellites orbit (Graph panel)!")
