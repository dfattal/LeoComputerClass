# reference.py — answer key for networks/lesson-05 (DNS).
#
# INERT: never served or built. WRITE THIS FIRST, then generate tests.json +
# viz.json with the scratchpad generator (gen_lesson.py).
#
# THE STORY: You typed "fortknocks.com" — but everything so far needed a NUMBER,
# an address like 93.184.7.42. Machines don't know names. So the very first
# thing your computer does is look the name up in the internet's phonebook:
# DNS, the Domain Name System. Give it a name, it hands back the address. And
# because asking the phonebook takes time, your computer keeps a little CACHE of
# names it already looked up — so the second time you visit a site, it's instant.
#
# CONVENTION: resolve_cached returns a LIST [ip, was_a_cache_hit] — not a dict —
# so it stays JSON-clean and the order is fixed and obvious.


def resolve(name, table):
    # The phonebook lookup. table is a list of [name, ip] pairs. Return the ip
    # for `name`, or "" if the name isn't in the phonebook.
    for entry_name, ip in table:
        if entry_name == name:
            return ip
    return ""


def is_cached(name, cache):
    # Have we looked this name up before? cache is a list of [name, ip] pairs we
    # already know. Return True if `name` is in it.
    for entry_name, ip in cache:
        if entry_name == name:
            return True
    return False


def resolve_cached(name, table, cache):
    # Smart lookup. If the name is already in our cache, use that (a HIT — fast!)
    # and return [ip, True]. Otherwise ask the full phonebook (a MISS) and return
    # [ip, False]. The ip is "" if the name isn't found anywhere.
    if is_cached(name, cache):
        return [resolve(name, cache), True]
    return [resolve(name, table), False]


# The phonebook and what we've already cached — used by the painter and tests.
DNS_TABLE = [
    ["fortknocks.com", "93.184.7.42"],
    ["leo.net", "10.0.0.7"],
    ["bank.com", "8.8.4.4"],
]
CACHE = [
    ["fortknocks.com", "93.184.7.42"],
]


# === PAINTER START ===
# Hidden painter: one row per lookup (top to bottom, a call log). The cell glows
# GREEN when the name was already in the cache (a fast hit), ORANGE when we had
# to ask the full phonebook (a miss, but found), and RED when the name isn't
# anywhere. Driven by the student's is_cached() / resolve().
TABLE_DEMO = [
    ["fortknocks.com", "93.184.7.42"],
    ["leo.net", "10.0.0.7"],
    ["bank.com", "8.8.4.4"],
]
CACHE_DEMO = [
    ["fortknocks.com", "93.184.7.42"],
]


def __row(name):
    try:
        hit = is_cached(name, CACHE_DEMO)
        ip = resolve(name, TABLE_DEMO)
    except Exception:
        hit, ip = False, ""
    if hit:
        return ["green"]
    if ip != "":
        return ["orange"]
    return ["red"]


def __show_lookups(names=None):
    if names is None:
        names = ["fortknocks.com", "leo.net", "fortknocks.com", "ghost.com"]
    return [__row(n) for n in names]
# === PAINTER END ===


TESTS_SPEC = [
    {"entry": "resolve", "cases": [
        {"name": "fortknocks.com is in the phonebook", "args": ["fortknocks.com", DNS_TABLE]},
        {"name": "leo.net resolves too", "args": ["leo.net", DNS_TABLE]},
        {"name": "an unknown name gives ''", "args": ["ghost.com", DNS_TABLE]},
    ]},
    {"entry": "is_cached", "cases": [
        {"name": "fortknocks.com is already cached", "args": ["fortknocks.com", CACHE]},
        {"name": "leo.net is not cached yet", "args": ["leo.net", CACHE]},
    ]},
    {"entry": "resolve_cached", "cases": [
        {"name": "cached name is a HIT", "args": ["fortknocks.com", DNS_TABLE, CACHE]},
        {"name": "uncached name is a MISS but resolves", "args": ["leo.net", DNS_TABLE, CACHE]},
        {"name": "unknown name: empty ip, and a miss", "args": ["ghost.com", DNS_TABLE, CACHE]},
    ]},
]

VIZ_SPEC = {
    "type": "draw",
    "resultFn": "__show_lookups",
    "demoArgs": [["fortknocks.com", "leo.net", "fortknocks.com", "ghost.com"]],
    "title": "A log of DNS lookups: green = cache hit (instant), orange = had to ask the phonebook, red = name not found",
}


if __name__ == "__main__":
    import json
    print("resolve:", resolve("fortknocks.com", DNS_TABLE), "|", resolve("ghost.com", DNS_TABLE))
    print("is_cached:", is_cached("fortknocks.com", CACHE), is_cached("leo.net", CACHE))
    print("resolve_cached:", resolve_cached("fortknocks.com", DNS_TABLE, CACHE),
          resolve_cached("leo.net", DNS_TABLE, CACHE))
    print("lookups grid:", json.dumps(__show_lookups()))
