# While Loops & Bit Magic!
# The final Python skills you need before the real adventures begin

# Exercise 1: Treasure Hunt
# Search through a list of spots (0 = empty, 1 = treasure)
# Return the position of the treasure, or -1 if not found
# You MUST use a while loop!
def find_treasure(spots):
    # Your code here
    pass

# Try it out!
print(find_treasure([0, 0, 1, 0]))


# Exercise 2: Bitwise Spy Encoder
# Mix two numbers using bitwise operations:
# Step 1: XOR a and b  (a ^ b)
# Step 2: Shift left by 1  (<< 1)
# Step 3: OR with original a  (| a)
def secret_code(a, b):
    # Your code here
    pass

# Try it out!
print(secret_code(5, 3))


# Exercise 3: Bit Counter
# Count how many 1-bits are in the binary version of n
# Example: count_ones(7) returns 3 because 7 = 111 in binary
# Hint: use while loop, check n & 1, then n = n >> 1
def count_ones(n):
    # Your code here
    pass

# Try it out!
print(count_ones(7))
