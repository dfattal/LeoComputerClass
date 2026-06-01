# Transfer to Mars
# Plan a Hohmann transfer: a half-ellipse from one orbit to another.
#
# Reminder: you orbit the SUN now (mass 1.989e30). Two burns get you to Mars:
# speed up to leave Earth's orbit, then speed up again to match Mars's.
#
# Tip: leave each "pass" as-is until you replace it with your code — don't just
# delete it, or Python will complain that a function is empty.

import math

G = 6.674e-11   # the gravitational constant
M_SUN = 1.989e30  # the Sun's mass (in kg)


# Exercise 1: The Transfer Ellipse
# a = (r1 + r2) / 2
def transfer_axis(r1, r2):
    # Your code here
    pass


# Exercise 2: The Departure Burn
# Speed on the transfer ellipse minus your current circular speed.
def burn_one(M, r1, r2):
    # 1. a = (r1 + r2) / 2
    # 2. v_transfer = math.sqrt(G * M * (2/r1 - 1/a))
    # 3. v_circle = math.sqrt(G * M / r1)
    # 4. return v_transfer - v_circle
    pass


# Exercise 3: How Long to Get There?
# Half the transfer ellipse's period (Kepler's Third Law).
def transfer_time(M, r1, r2):
    # 1. a = (r1 + r2) / 2
    # 2. return math.pi * math.sqrt(a**3 / (G * M))
    pass


# Press Run to see the Graph panel: Earth's orbit, Mars's orbit, and the
# transfer ellipse that just touches both.
# Once you've filled in the functions above, uncomment these to test them:
# print(transfer_axis(1.496e11, 2.279e11))
# print(burn_one(1.989e30, 1.496e11, 2.279e11))
# print(transfer_time(1.989e30, 1.496e11, 2.279e11) / 86400, "days")
print("Press Run to see the Earth-to-Mars transfer ellipse (Graph panel)!")
