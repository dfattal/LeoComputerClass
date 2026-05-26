# Range, Height & Hang Time
# Measure your shots, then let the computer find the best launch angle.
#
# Reminder: up is positive, gravity -9.8, drag from Lesson 3.
# Update velocities first, then positions.

import math

g = 9.8


# Exercise 1: Measure the Whole Shot
# Return [range, peak_height, hang_time].
def simulate_shot(speed, angle_deg, k, m, dt):
    angle_rad = math.radians(angle_deg)
    vx = speed * math.cos(angle_rad)
    vy = speed * math.sin(angle_rad)
    x = 0.0
    y = 0.0
    t = 0.0
    peak = 0.0
    while True:
        spd = math.sqrt(vx * vx + vy * vy)
        ax = -(k / m) * spd * vx
        ay = -g - (k / m) * spd * vy
        # update vx, vy, then x, y
        # t = t + dt    (tick the clock)
        # if y > peak: peak = y   (track the highest point)
        # stop when y <= 0
        pass
    return [x, peak, t]


# Exercise 2: Find the Best Angle (the sweep!)
# Try angles 10..70 and return the one that flies farthest.
def best_angle(speed, k, m, dt):
    best_angle_so_far = None
    best_range = -1
    for angle in range(10, 71):
        r = simulate_shot(speed, angle, k, m, dt)[0]
        # if r > best_range: save best_range and best_angle_so_far
        pass
    return best_angle_so_far


# Exercise 3: How Much Range Does Air Steal?
# vacuum range (formula) minus the real drag range (simulation).
def range_lost_to_air(speed, angle_deg, k, m, dt):
    vacuum_range = speed**2 * math.sin(math.radians(2 * angle_deg)) / g
    drag_range = simulate_shot(speed, angle_deg, k, m, dt)[0]
    # return vacuum_range - drag_range
    pass


# Press Run to see the angle-sweep graph: each arc is a launch angle, and the
# farthest one (around 33 deg — way below 45!) is highlighted.
# Once you've filled in the functions above, uncomment these to test them:
# print(simulate_shot(20, 45, 0.01, 0.05, 0.002))
# print(best_angle(20, 0.01, 0.05, 0.005))
# print(range_lost_to_air(20, 45, 0.01, 0.05, 0.002))
print("Press Run to see the angle-sweep graph (Graph panel)!")
