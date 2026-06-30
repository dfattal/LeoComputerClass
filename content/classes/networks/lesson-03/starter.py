# Routing 🚦
# A packet hops router to router across the planet. Each router reads the
# destination and picks the best next hop from its routing table — a list of
# [prefix, gateway] rules. The rule whose prefix matches the MOST of the
# address wins (longest-prefix match). The "" prefix is the catch-all default.
#
# Tip: leave each "pass" until you replace it with your code.


def matches(prefix, dest):
    # Does this rule apply? "" matches everything (catch-all). Otherwise dest
    # must equal prefix, or start with prefix + "." (so "10" matches "10.0.0.5"
    # but NOT "100.0.0.1").
    pass


def next_hop(dest, table):
    # Among the matching rules, return the gateway with the LONGEST prefix.
    # Track best_gateway and best_len (start best_len at -1). Reuse matches().
    pass


def default_route(table):
    # Return the gateway whose prefix is "". If there's no default rule, return "".
    pass


print("Press Run to watch each destination light up its next router! 🚦")
