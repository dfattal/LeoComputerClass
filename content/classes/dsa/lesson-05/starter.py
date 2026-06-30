# Recursion — a base case (stop here) + one call to itself (on something smaller).
#
# The base case is filled in for you. Replace each "pass" with the recursive step.


def countdown(n):
    if n == 0:
        return []               # base case
    # recursive step: this number, then the countdown of one less
    # return [n] + countdown(...)
    pass


def factorial(n):
    if n == 0:
        return 1                # base case
    # recursive step: n times the factorial of one less
    # return n * factorial(...)
    pass


def sum_to(n):
    if n == 0:
        return 0                # base case
    # recursive step: n plus the sum of everything below it
    # return n + sum_to(...)
    pass


print("Press Run to watch countdown's call stack grow and unwind on the Canvas!")
