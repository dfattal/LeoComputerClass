# reference.py — answer key for networks/lesson-02 (Addresses).
#
# INERT: never served or built. WRITE THIS FIRST, then generate tests.json +
# viz.json with the scratchpad generator (gen_lesson.py).
#
# THE STORY: Your packets are ready to send — but send them WHERE? Every machine
# on the internet has an address, just like every house has a street address. It
# looks like 192.168.1.5: four numbers (called octets) from 0 to 255, separated
# by dots. The front of the address says which NEIGHBORHOOD (network) you're on;
# the end says which exact house. Two machines are "on the same network" when the
# fronts of their addresses match.


def to_octets(ip):
    # Split a dotted address like "192.168.1.5" into its four numbers.
    # Return a list of ints: [192, 168, 1, 5].
    return [int(part) for part in ip.split(".")]


def to_ip(octets):
    # The other direction: glue four numbers back into a dotted address string.
    # [192, 168, 1, 5] -> "192.168.1.5".
    return ".".join(str(n) for n in octets)


def same_network(a, b, prefix):
    # Are addresses a and b on the same network? Compare their first `prefix`
    # octets. If all of those match, they're neighbors (True). If any differ,
    # they live on different networks (False).
    oa = to_octets(a)
    ob = to_octets(b)
    return oa[:prefix] == ob[:prefix]


# === PAINTER START ===
# Hidden painter: each row compares two machines, octet by octet. The first
# `prefix` octets are the NETWORK part: green if they match, red if they don't.
# Octets past the prefix are the HOST part (gray — we don't care about them for
# "same network?"). A row that's all green across its network part means the two
# machines are neighbors. Driven by the student's to_octets().
MATCH = "green"
DIFFER = "red"
HOST = "gray"


def __row(a, b, prefix):
    try:
        oa = to_octets(a)
        ob = to_octets(b)
    except Exception:
        return ["gray", "gray", "gray", "gray"]
    row = []
    for i in range(4):
        if i < prefix:
            row.append(MATCH if oa[i] == ob[i] else DIFFER)
        else:
            row.append(HOST)
    return row


def __show_networks(cases=None):
    if cases is None:
        cases = [
            ["192.168.1.5", "192.168.1.9", 3],
            ["192.168.1.5", "192.168.40.5", 3],
            ["10.0.0.1", "192.168.0.1", 1],
        ]
    return [__row(a, b, p) for a, b, p in cases]
# === PAINTER END ===


TESTS_SPEC = [
    {"entry": "to_octets", "cases": [
        {"name": "a normal address", "args": ["192.168.1.5"]},
        {"name": "all zeros", "args": ["0.0.0.0"]},
        {"name": "the biggest octets", "args": ["255.255.255.255"]},
        {"name": "Fort Knocks' address", "args": ["93.184.7.42"]},
    ]},
    {"entry": "to_ip", "cases": [
        {"name": "rebuild a normal address", "args": [[192, 168, 1, 5]]},
        {"name": "rebuild all zeros", "args": [[0, 0, 0, 0]]},
        {"name": "round-trips back to the address", "args": [[93, 184, 7, 42]]},
    ]},
    {"entry": "same_network", "cases": [
        {"name": "same first 3 octets -> neighbors", "args": ["192.168.1.5", "192.168.1.9", 3]},
        {"name": "3rd octet differs -> different network", "args": ["192.168.1.5", "192.168.40.5", 3]},
        {"name": "only need first octet to match", "args": ["10.0.0.1", "10.255.255.9", 1]},
        {"name": "first octet differs -> far apart", "args": ["10.0.0.1", "192.168.0.1", 1]},
        {"name": "identical machines match at full length", "args": ["192.168.1.5", "192.168.1.5", 4]},
    ]},
]

VIZ_SPEC = {
    "type": "draw",
    "resultFn": "__show_networks",
    "demoArgs": [[
        ["192.168.1.5", "192.168.1.9", 3],
        ["192.168.1.5", "192.168.40.5", 3],
        ["10.0.0.1", "192.168.0.1", 1],
    ]],
    "title": "Two machines per row, compared octet by octet. Green network part = same network; one red octet = different networks",
}


if __name__ == "__main__":
    import json
    print("to_octets:", to_octets("192.168.1.5"))
    print("to_ip:", to_ip([192, 168, 1, 5]))
    print("same_network:", same_network("192.168.1.5", "192.168.40.5", 3))
    print("networks grid:", json.dumps(__show_networks()))
