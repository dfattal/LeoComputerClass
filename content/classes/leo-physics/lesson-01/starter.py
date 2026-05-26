# From Calculus to Simulation
# Build a falling-ball simulator, one tiny time step at a time!
#
# Reminder: up is positive, so gravity's acceleration is -9.8.

g = 9.8  # gravity, in meters per second squared


# Exercise 1: One Velocity Step
# New velocity = old velocity + acceleration * dt
def step_velocity(v, a, dt):
    # Your code here
    pass


# Exercise 2: One Position Step
# New position = old position + velocity * dt
def step_position(x, v, dt):
    # Your code here
    pass


# Exercise 3: Drop the Ball!
# Loop the two steps to simulate a ball dropped from rest.
# Update velocity FIRST, then position.
def fall(h0, dt, steps):
    v = 0.0
    h = h0
    for _ in range(steps):
        # 1. update velocity (acceleration is -g)
        # 2. update height using the new velocity
        pass
    return h


# Press Run to see the Graph panel: your Euler simulation vs the exact formula
# (watch how big steps drift, but small steps hug the true curve).
# Once you've filled in the functions above, uncomment these to test them:
# (A ball dropped from 10 m should be near 5.1 m after 1 second.)
# print(step_velocity(0, -9.8, 0.1))
# print(step_position(10, -0.98, 0.1))
# print(fall(10, 0.005, 200))
print("Press Run to see the simulation-vs-formula graph (Graph panel)!")
