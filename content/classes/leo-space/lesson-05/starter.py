# Off the Pad
# A rocket pushes itself by throwing mass backward — and gets faster as it
# lightens. Build the rocket equation, then match it with a step-by-step burn.
#
# Tip: leave each "pass" as-is until you replace it with your code — don't just
# delete it, or Python will complain that a function is empty.

import math

G = 6.674e-11  # the gravitational constant (not needed today, but here for later)


# Exercise 1: The Rocket Equation
# delta_v = v_exhaust * ln(m_full / m_empty)    (math.log is the natural log)
def rocket_dv(v_exhaust, m_full, m_empty):
    # Your code here
    pass


# Exercise 2: How Much Rocket Is Left?
# m = m0 - burn_rate * t
def mass_after(m0, burn_rate, t):
    # Your code here
    pass


# Exercise 3: Simulate the Burn
# Step through the burn until the fuel runs out; return the final speed.
def burn_sim(m_full, m_empty, v_exhaust, burn_rate, dt):
    m = m_full
    v = 0.0
    while m > m_empty:
        # 1. a = v_exhaust * burn_rate / m
        # 2. v = v + a * dt
        # 3. m = m - burn_rate * dt
        pass
    return v


# Press Run to see the Graph panel: a rocket's speed curving upward during the
# burn — steeper and steeper as it sheds fuel and gets lighter.
# Once you've filled in the functions above, uncomment these to test them:
# print(rocket_dv(3000, 100, 40))
# print(mass_after(100, 2, 30))
# print(burn_sim(100, 40, 3000, 2, 0.002))
print("Press Run to watch a rocket speed up as it burns (Graph panel)!")
