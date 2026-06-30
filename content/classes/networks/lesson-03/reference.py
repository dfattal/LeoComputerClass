# reference.py — answer key for networks/lesson-03 (Routing).
#
# INERT: never served or built. WRITE THIS FIRST, then generate tests.json +
# viz.json with the scratchpad generator (gen_lesson.py).
#
# THE STORY: Your packet has an address, but the machine you want is on the
# other side of the planet — way too far to reach in one jump. So packets travel
# in HOPS. Each router along the way looks at the destination address and asks:
# "of all the roads I know, which one points closest to there?" It hands the
# packet to that next router, who asks the same question, again and again, until
# the packet arrives. A router keeps a little ROUTING TABLE: a list of
# [prefix, gateway] rules. The rule whose prefix matches the MOST of the
# destination wins — that's "longest-prefix match." The "" prefix is the
# catch-all default: "anything I don't recognize, send out this door."


def matches(prefix, dest):
    # Does this routing rule apply to the destination? The empty prefix "" is the
    # catch-all and matches everything. Otherwise the rule matches when dest is
    # exactly the prefix, or starts with the prefix followed by a dot (so "10"
    # matches "10.0.0.5" but NOT "100.0.0.1").
    if prefix == "":
        return True
    return dest == prefix or dest.startswith(prefix + ".")


def next_hop(dest, table):
    # Look at every [prefix, gateway] rule. Keep the matching one with the
    # LONGEST prefix (the most specific road). Return its gateway. With a "" rule
    # present there's always an answer.
    best_gateway = ""
    best_len = -1
    for prefix, gateway in table:
        if matches(prefix, dest) and len(prefix) > best_len:
            best_len = len(prefix)
            best_gateway = gateway
    return best_gateway


def default_route(table):
    # The catch-all: the gateway whose prefix is "" (where unknown packets go).
    # Return "" if the table has no default rule.
    for prefix, gateway in table:
        if prefix == "":
            return gateway
    return ""


# A demo router's table, used by the painter below.
TABLE = [
    ["", "R0"],            # default: send unknown traffic to R0
    ["10", "R1"],          # the 10.x.x.x network goes to R1
    ["10.0", "R2"],        # but the 10.0.x.x part specifically goes to R2
    ["192.168.1", "R3"],   # the 192.168.1.x network goes to R3
]


# === PAINTER START ===
# Hidden painter: a row of router doors [R0, R1, R2, R3]. For each destination,
# the door the packet is handed to lights up green; the rest stay gray. Watch
# "10.0.0.5" pick R2 (the most specific rule) even though R1 also matches —
# that's longest-prefix match. Driven by the student's next_hop().
GATEWAYS = ["R0", "R1", "R2", "R3"]
TABLE_DEMO = [
    ["", "R0"],
    ["10", "R1"],
    ["10.0", "R2"],
    ["192.168.1", "R3"],
]


def __row(dest):
    try:
        chosen = next_hop(dest, TABLE_DEMO)
    except Exception:
        chosen = ""
    return ["green" if g == chosen else "gray" for g in GATEWAYS]


def __show_routes(dests=None):
    if dests is None:
        dests = ["10.0.0.5", "10.9.9.9", "192.168.1.20", "8.8.8.8"]
    return [__row(d) for d in dests]
# === PAINTER END ===


TESTS_SPEC = [
    {"entry": "matches", "cases": [
        {"name": "'10' matches 10.0.0.5", "args": ["10", "10.0.0.5"]},
        {"name": "'10.0' matches 10.0.0.5", "args": ["10.0", "10.0.0.5"]},
        {"name": "'192.168.1' does not match 10.0.0.5", "args": ["192.168.1", "10.0.0.5"]},
        {"name": "the catch-all matches anything", "args": ["", "8.8.8.8"]},
        {"name": "'10' does NOT match 100.0.0.1", "args": ["10", "100.0.0.1"]},
    ]},
    {"entry": "next_hop", "cases": [
        {"name": "10.0.0.5 takes the most specific road (R2)", "args": ["10.0.0.5", TABLE]},
        {"name": "10.9.9.9 falls back to R1", "args": ["10.9.9.9", TABLE]},
        {"name": "192.168.1.20 goes to R3", "args": ["192.168.1.20", TABLE]},
        {"name": "an unknown address takes the default R0", "args": ["8.8.8.8", TABLE]},
    ]},
    {"entry": "default_route", "cases": [
        {"name": "the demo table's default is R0", "args": [TABLE]},
        {"name": "a table with no default returns ''", "args": [[["10", "R1"], ["192.168.1", "R3"]]]},
    ]},
]

VIZ_SPEC = {
    "type": "draw",
    "resultFn": "__show_routes",
    "demoArgs": [["10.0.0.5", "10.9.9.9", "192.168.1.20", "8.8.8.8"]],
    "title": "Doors R0–R3. Each destination lights the next router it's handed to — the most specific matching rule wins",
}


if __name__ == "__main__":
    import json
    print("matches:", matches("10", "10.0.0.5"), matches("10", "100.0.0.1"))
    print("next_hop:", [next_hop(d, TABLE) for d in ["10.0.0.5", "10.9.9.9", "192.168.1.20", "8.8.8.8"]])
    print("default_route:", default_route(TABLE))
    print("routes grid:", json.dumps(__show_routes()))
