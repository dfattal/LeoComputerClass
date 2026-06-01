# The Lunar Lander
# Fight gravity with your engine and touch down softly on the Moon.
#
# Reminder: up is positive, so a falling lander has a NEGATIVE velocity.
# Net acceleration = thrust - g. Keep thrust below g (1.62) so you come down.
#
# Tip: leave each "pass" as-is until you replace it with your code — don't just
# delete it, or Python will complain that a function is empty.

import math

g_moon = 1.62  # the Moon's surface gravity (you found this in Lesson 1!)


# Exercise 1: One Landing Step
# Return the new [h, v] after one Euler step.
def lander_step(h, v, thrust, g, dt):
    # 1. v2 = v + (thrust - g) * dt
    # 2. h2 = h + v2 * dt
    # 3. return [h2, v2]
    pass


# Exercise 2: Land It!
# Step until you reach the ground (h <= 0); return the touchdown speed.
def land(h0, v0, thrust, g, dt, steps):
    h = h0
    v = v0
    for _ in range(steps):
        # 1. v = v + (thrust - g) * dt
        # 2. h = h + v * dt
        # 3. if h <= 0: break
        pass
    return v


# Exercise 3: Safe or Crash?
# Return True if the touchdown speed is gentle enough (2 m/s or slower).
def is_safe(touchdown_speed):
    # Return abs(touchdown_speed) <= 2.0
    pass


# Press Run to see the Graph panel: the same lander coming down with different
# engine powers — a weak engine crashes, a strong one glides in gently.
# Once you've filled in the functions above, uncomment these to test them:
# print(lander_step(100, -10, 1.5, 1.62, 0.5))
# print(land(8, -1, 1.55, 1.62, 0.01, 20000))
# print(is_safe(land(8, -1, 1.55, 1.62, 0.01, 20000)))
print("Press Run to watch landers come down at different thrusts (Graph panel)!")
