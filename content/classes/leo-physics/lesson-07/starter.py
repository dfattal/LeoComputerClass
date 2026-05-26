# The Whole Blaster
# Chain your spring engine (inside the barrel) into your drag flight (outside)
# to predict a real shot from end to end.

import math


# ---------------------------------------------------------------------------
# GIVEN — your external engine from Lessons 3-4. Don't change this.
# It flies a dart with drag and returns [range, peak_height].
# ---------------------------------------------------------------------------
def drag_flight(speed, angle_deg, m, kdrag, dt):
    g = 9.8
    r = math.radians(angle_deg)
    vx = speed * math.cos(r)
    vy = speed * math.sin(r)
    x = 0.0
    y = 0.0
    peak = 0.0
    while True:
        sp = math.sqrt(vx * vx + vy * vy)
        ax = -(kdrag / m) * sp * vx
        ay = -g - (kdrag / m) * sp * vy
        vx += ax * dt
        vy += ay * dt
        x += vx * dt
        y += vy * dt
        if y > peak:
            peak = y
        if y <= 0:
            break
    return [x, peak]


# ---------------------------------------------------------------------------
# Exercise 1: The Engine — muzzle speed from the spring (your Lesson 5 code).
# ---------------------------------------------------------------------------
def muzzle_speed(x0, k, m, barrel, dt):
    d = 0.0
    v = 0.0
    while d < barrel:
        s = x0 - d
        F = k * s if s > 0 else 0.0
        # update v = v + (F/m)*dt, then d = d + v*dt
        pass
    return v


# ---------------------------------------------------------------------------
# Exercise 2: The Whole Blast — chain the engine into the flight, return range.
# ---------------------------------------------------------------------------
def blast_range(x0, k, m, barrel, angle_deg, kdrag, dt):
    speed = muzzle_speed(x0, k, m, barrel, dt)
    # return drag_flight(speed, angle_deg, m, kdrag, dt)[0]
    pass


# ---------------------------------------------------------------------------
# Exercise 3: The Full Report — return [muzzle_speed, range, peak_height].
# ---------------------------------------------------------------------------
def blast_report(x0, k, m, barrel, angle_deg, kdrag, dt):
    speed = muzzle_speed(x0, k, m, barrel, dt)
    flight = drag_flight(speed, angle_deg, m, kdrag, dt)   # [range, peak]
    # return [speed, flight[0], flight[1]]
    pass


# Press Run to see the Graph panel: the full-blast trajectory for three dart
# masses — watch which one flies farthest (the capstone in a picture!).
# Once you've filled in the functions above, uncomment these to test them:
# print(muzzle_speed(0.1, 200, 0.02, 0.3, 0.0001))
# print(blast_range(0.1, 200, 0.02, 0.3, 35, 0.002, 0.0001))
# print(blast_report(0.1, 200, 0.02, 0.3, 35, 0.002, 0.0001))
print("Press Run to see the three-dart-mass blast graph (Graph panel)!")
