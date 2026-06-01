# Gravity Gets Weaker
# Build a gravity engine — the toolkit for every space mission ahead!
#
# Reminder: gravity follows Newton's law, F = G * m1 * m2 / r**2.
# The distance r is SQUARED — that's the inverse-square law.
#
# Tip: leave each "pass" as-is until you replace it with your code — don't just
# delete it, or Python will complain that a function is empty.

G = 6.674e-11  # the gravitational constant (tiny — gravity is a weak force)


# Exercise 1: The Gravity Handshake
# Pull between two masses = G * m1 * m2 / r**2
def gravity_force(m1, m2, r):
    # Your code here
    pass


# Exercise 2: Acceleration Near a Planet
# The small object's mass cancels out, leaving a = G * M / r**2
def gravity_accel(M, r):
    # Your code here
    pass


# Exercise 3: How Much Weaker?
# Moving from r_near out to r_far weakens gravity by (r_far / r_near)**2
def times_weaker(r_near, r_far):
    # Your code here
    pass


# Press Run to see the Graph panel: gravity collapsing as you move away from
# Earth — twice as far really is four times weaker.
# Once you've filled in the functions above, uncomment these to test them:
# (Earth's surface should give about 9.8 — the number you already know!)
# print(gravity_accel(5.972e24, 6.371e6))
# print(gravity_force(5.972e24, 7.342e22, 3.844e8))
# print(times_weaker(1, 2))
print("Press Run to see how gravity collapses with distance (Graph panel)!")
