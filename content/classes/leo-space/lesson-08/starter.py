# Mission Control (Capstone)
# Turn your orbit simulator into a DESIGNER: search many launch speeds and let
# the computer find the one that makes a perfect circle — rediscovering the
# Lesson 2 orbital-speed law all by itself.
#
# Tip: leave each "pass" as-is until you replace it with your code — don't just
# delete it, or Python will complain that a function is empty.

import math

G = 6.674e-11  # the gravitational constant


# ---------------------------------------------------------------------------
# GIVEN — don't change these. Your Lesson 2 tools, ready to use.
# v_circle: the formula speed for a circular orbit.
# sim_orbit: launches sideways from (r0, 0) at speed v and returns
#            [min_r, max_r] — the closest and farthest distance reached.
# ---------------------------------------------------------------------------
def v_circle(M, r0):
    return math.sqrt(G * M / r0)


def sim_orbit(M, r0, v, dt, steps):
    x = r0
    y = 0.0
    vx = 0.0
    vy = v
    min_r = r0
    max_r = r0
    for _ in range(steps):
        r = math.sqrt(x * x + y * y)
        f = G * M / (r * r * r)
        vx += -f * x * dt
        vy += -f * y * dt
        x += vx * dt
        y += vy * dt
        d = math.sqrt(x * x + y * y)
        if d < min_r:
            min_r = d
        if d > max_r:
            max_r = d
    return [min_r, max_r]


# ---------------------------------------------------------------------------
# Exercise 1: How Circular? (apogee minus perigee; smaller = rounder)
# ---------------------------------------------------------------------------
def roundness(M, r0, v, dt, steps):
    # 1. min_r, max_r = sim_orbit(M, r0, v, dt, steps)
    # 2. return max_r - min_r
    pass


# ---------------------------------------------------------------------------
# Exercise 2: Sweep speeds 0.80x..1.20x the formula and keep the roundest.
# ---------------------------------------------------------------------------
def best_factor(M, r0, dt, steps):
    vc = v_circle(M, r0)
    best_f = 0
    best_score = 1e99
    f = 0.80
    while f <= 1.20 + 1e-9:
        # 1. score = roundness(M, r0, f * vc, dt, steps)
        # 2. if score < best_score: save best_score and best_f
        f = f + 0.02
    return round(best_f, 2)


# ---------------------------------------------------------------------------
# Exercise 3: Turn the winning factor into an actual speed.
# ---------------------------------------------------------------------------
def best_speed(M, r0, dt, steps):
    # Return best_factor(M, r0, dt, steps) * v_circle(M, r0)
    pass


# Press Run to see the Graph panel: roundness for each speed factor, dropping to
# a sharp minimum right at 1.0 — your simulator pointing straight at the law.
# Once you've filled in the functions above, uncomment these to test them:
# print(roundness(5.972e24, 7e6, 7545.78, 3, 2000))
# print(best_factor(5.972e24, 7e6, 3, 2000))
# print(best_speed(5.972e24, 7e6, 3, 2000))
print("Press Run to watch the search pinpoint the perfect orbit (Graph panel)!")
