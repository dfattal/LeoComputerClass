# Air Resistance
# Add drag to your simulator and watch a real dart fall short.
#
# Reminder: up is positive, gravity is -9.8, and drag ALWAYS opposes motion.
# k = drag constant (bigger = draggier),  m = dart mass in kg.

import math

g = 9.8


# Exercise 1: The Drag Force
# Drag opposes motion and grows with speed squared.
def drag_accel(v, k, m):
    # return -(k/m) * abs(v) * v
    pass


# Exercise 2: Terminal Velocity
# Drop from rest; return the top speed where drag balances gravity.
def terminal_velocity(k, m, dt):
    v = 0.0
    while True:
        a = -g + drag_accel(v, k, m)
        # update v = v + a*dt, then stop once abs(a) < 0.001
        pass
    return abs(v)


# Exercise 3: Launch Through Real Air
# Your Lesson 2 launcher, now with drag slowing the dart in both directions.
def range_with_drag(speed, angle_deg, k, m, dt):
    angle_rad = math.radians(angle_deg)
    vx = speed * math.cos(angle_rad)
    vy = speed * math.sin(angle_rad)
    x = 0.0
    y = 0.0
    while True:
        spd = math.sqrt(vx * vx + vy * vy)   # speed through the air
        ax = -(k / m) * spd * vx             # drag, sideways
        ay = -g - (k / m) * spd * vy         # gravity + drag, vertical
        # update vx, vy, then x, y; stop when y <= 0
        pass
    return x


# Press Run to see the Graph panel: the same shot with and without air —
# watch how much range the drag steals!
# Once you've filled in the functions above, uncomment these to test them:
# print(drag_accel(10, 0.1, 0.5))
# print(terminal_velocity(0.1, 0.5, 0.001))
# print(range_with_drag(20, 45, 0.01, 0.05, 0.001))
print("Press Run to see the air-vs-no-air graph (Graph panel)!")
