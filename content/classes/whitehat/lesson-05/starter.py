# Sneak Past the Login 🗝️
# Fort Knocks glues your name straight into its login command. Break out of the
# quotes with a sneaky name, then write the check that blocks the attack.
# The real user is "leo".
#
# Tip: leave each "pass" as-is until you replace it with your code.


def build_query(username):
    # Glue the username inside single quotes:
    #   "find user where name = '" + username + "'"
    pass


def login_ok(username, real_user):
    # The VULNERABLE check.
    # Build the query. If it contains "OR '1'='1", return True (anyone gets in).
    # Otherwise return whether username == real_user.
    pass


def safe_login(username, real_user):
    # The DEFENSE.
    # If username contains a quote ' return False (reject the sneaky input).
    # Otherwise return whether username == real_user.
    pass


print("Press Run, then watch the injection beat the LEFT door but not the RIGHT! 🟢🔴")
