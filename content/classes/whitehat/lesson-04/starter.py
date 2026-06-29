# Smash the Stack 💥
# Memory is 5 cells: 4 buffer slots (start "_") and the return address (starts
# "H" for HOME). Copy input with no length check and watch it overwrite the
# return address — then write the one check that stops the attack.
#
# Tip: leave each "pass" as-is until you replace it with your code.


def store(text):
    # Copy text into memory one character at a time, with NO length check.
    # Start: mem = ["_", "_", "_", "_", "H"]
    # For i, ch in enumerate(text): if i < len(mem), set mem[i] = ch.
    # Return mem. (Characters past slot 3 spill into the return address!)
    pass


def return_address(text):
    # Store the text, then return what's in the last slot (the return address).
    # "H" = safe. Anything else = hijacked!
    pass


def is_safe(text):
    # The defense: True only if the text fits in the 4-slot buffer (len <= 4).
    pass


print("Press Run, then watch the return address turn red when you smash it! 💥")
