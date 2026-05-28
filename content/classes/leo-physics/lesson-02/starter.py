# Launch! Projectiles in 2D
# Build a dart launcher: split the launch, find how high, find how far.
#
# Reminder: up is positive, gravity's acceleration is -9.8, and launch
# from the ground (x = 0, y = 0). Python trig needs RADIANS!
#
# Tip: leave each "pass" as-is until you replace it with your code — don't just
# delete it, or Python will complain that a function is empty.

import math

g = 9.8  # gravity, meters per second squared


# Exercise 1: Split the Launch
# Turn speed + angle (degrees) into [vx, vy].
def velocity_components(speed, angle_deg):
    # 1. angle_rad = math.radians(angle_deg)
    # 2. vx = speed * math.cos(angle_rad)
    # 3. vy = speed * math.sin(angle_rad)
    # 4. return [vx, vy]
    pass


# Exercise 2: How High Does It Go?
# Simulate the rise and return the highest point reached.
def peak_height(speed, angle_deg, dt):
    vx, vy = velocity_components(speed, angle_deg)
    y = 0.0
    highest = 0.0
    while True:
        # update vy with gravity, then y
        # track the highest y, and stop once vy <= 0
        pass
    return highest


# Exercise 3: How Far Does It Fly? (the range)
# Simulate the whole flight and return the horizontal distance.
def throw_range(speed, angle_deg, dt):
    vx, vy = velocity_components(speed, angle_deg)
    x = 0.0
    y = 0.0
    while True:
        # update vy (gravity), then x (sideways), then y (up/down)
        # stop when y <= 0 (landed)
        pass
    return x


# Once you've written velocity_components, press Run to watch your dart fly
# in the "Graph" tab! Then finish the rest and uncomment these to test:
# print(velocity_components(20, 45))
# print(peak_height(20, 45, 0.001))
# print(throw_range(20, 45, 0.001))
print("Write velocity_components, then press Run to see your dart fly (Graph tab)!")
