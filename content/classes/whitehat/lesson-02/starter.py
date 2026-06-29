# Guess the Password 🔨
# This door is a plain secret PIN — no rule to figure out. Crack it the blunt
# way: try every code in order until one works. Then prove why a longer PIN
# would have saved them.
#
# Tip: leave each "pass" as-is until you replace it with your code.


def crack_pin(secret):
    # `secret` is a string of digits like "0042".
    # Try "0000", "0001", "0002", ... until you find the match, and return it.
    #
    # Idea: n = len(secret). Loop for i in range(10 ** n). Build each guess with
    # str(i).zfill(n) so it has the right number of leading zeros. Return the
    # guess as soon as it equals secret.
    pass


def combos(num_digits):
    # How many different PINs exist with this many digits?
    # 10 choices per slot, all multiplied together.
    pass


print("Press Run, then watch the brute-force attack sweep the board! 🔴🟢")
