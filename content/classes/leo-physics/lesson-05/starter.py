# Spring-Powered Blasters
# Build the engine: a spring pushes the dart down the barrel.
#
# Work in meters / kilograms / newtons. The barrel is horizontal, so we ignore
# gravity here. Update velocity first, then position.

import math


# Exercise 1: The Spring's Push (Hooke's law)
# Push = k * compression while squished; 0 once the spring has let go.
def spring_force(compression, k):
    # if compression > 0: return k * compression
    # else: return 0.0
    pass


# Exercise 2: Muzzle Velocity
# Simulate the dart down the barrel; return its speed as it exits.
def muzzle_velocity(x0, k, m, barrel, dt):
    d = 0.0
    v = 0.0
    while d < barrel:
        s = x0 - d                       # squish left
        a = spring_force(s, k) / m       # a = F / m
        # update v = v + a*dt, then d = d + v*dt
        pass
    return v


# Exercise 3: The Ideal Muzzle Velocity (energy check)
# v = x0 * sqrt(k / m)
def ideal_muzzle_velocity(x0, k, m):
    # return x0 * math.sqrt(k / m)
    pass


# Press Run to see the Graph panel: the dart's speed building up the barrel
# for three spring stiffnesses (it flattens once the spring lets go).
# Once you've filled in the functions above, uncomment these to test them:
# (A long-enough barrel should match the energy formula!)
# print(spring_force(0.1, 200))
# print(muzzle_velocity(0.1, 200, 0.05, 0.3, 0.0001))
# print(ideal_muzzle_velocity(0.1, 200, 0.05))
print("Press Run to see the speed-up-the-barrel graph (Graph panel)!")
