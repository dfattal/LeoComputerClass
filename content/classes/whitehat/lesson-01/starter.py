# Think Like a Hacker 🕵️
# You're a white-hat hacker, hired to test Fort Knocks. Its keypad opens only
# when every digit is even. Teach your code that secret rule!
#
# Tip: leave each "pass" as-is until you replace it with your code — don't just
# delete it, or Python will complain that a function is empty.


def all_even(code):
    # `code` is a string of digits like "2468".
    # Return True only if EVERY digit is even, False if even one is odd.
    #
    # Idea: loop over each character `ch` in `code`. If int(ch) % 2 != 0 you
    # found an odd digit, so return False. If the loop finishes, return True.
    pass


def responds(code):
    # What the keypad does: "CLICK" if the code is all even, else "BEEP".
    # Tip: call your own all_even(code) and decide from its answer.
    pass


print("Press Run, then watch the keypad locks in the panel! 🔓")
