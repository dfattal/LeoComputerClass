# Escape!
# Energy decides your fate: crash, orbit, or fly away forever.
#
# Reminder: total energy = kinetic (0.5*v**2) plus potential (-G*M/r).
# Negative = bound. Zero or positive = escapes.
#
# Tip: leave each "pass" as-is until you replace it with your code — don't just
# delete it, or Python will complain that a function is empty.

import math

G = 6.674e-11  # the gravitational constant


# Exercise 1: Escape Speed
# v_esc = sqrt(2 * G * M / r)
def escape_speed(M, r):
    # Your code here
    pass


# Exercise 2: Total Energy (per kilogram)
# E = 0.5 * v**2 - G * M / r
def total_energy(M, v, r):
    # Your code here
    pass


# Exercise 3: Will It Escape?
# Return True if the total energy is zero or positive, else False.
def will_escape(M, v, r):
    # 1. energy = 0.5 * v**2 - G * M / r
    # 2. return energy >= 0
    pass


# Press Run to see the Graph panel: launches just below, at, and above escape
# speed — and how only the fast ones break free.
# Once you've filled in the functions above, uncomment these to test them:
# print(escape_speed(5.972e24, 6.371e6))
# print(total_energy(5.972e24, 7546, 7e6))
# print(will_escape(5.972e24, 15000, 6.371e6))
print("Press Run to see who escapes and who falls back (Graph panel)!")
