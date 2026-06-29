# Lock It All Down 🔵🔒
# Blue team time! Patch every hole you found and score the fortress. Each
# defense is worth 20 points; a perfect lockdown is 100.
#
# Tip: leave each "pass" as-is until you replace it with your code.


def pin_strong(pin):
    # Strong = long. True when the PIN has 8 or more digits.
    pass


def buffer_ok(text, size):
    # Overflow fix: True when text fits in the buffer (len <= size).
    pass


def input_clean(text):
    # Injection fix: True when text has no quote ' in it.
    pass


def security_score(pin, text, size, salted, encrypted):
    # Add 20 for each defense in place:
    #   pin_strong(pin), buffer_ok(text, size), input_clean(text),
    #   salted (True/False), encrypted (True/False).
    # Return the total (0 to 100).
    pass


print("Press Run, then light up all five shields on the dashboard! 🛡️🟩")
