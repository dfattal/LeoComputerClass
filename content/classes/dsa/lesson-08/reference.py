# reference.py — answer key for dsa/lesson-08 (Hash Tables).
#
# INERT: never served or built. Source of truth; gen_lesson.py reads TESTS_SPEC /
# VIZ_SPEC + the painter to emit tests.json + viz.json.
#
# Big idea: searching took time. What if you could JUMP straight to where a thing
# lives, with no searching at all? A HASH TABLE turns a key into a bucket NUMBER
# with a little math (the hash). To store: hash the key, drop it in that bucket.
# To find: hash the key, look only in that bucket. That's O(1) — lightning fast.
# Two different keys can hash to the SAME bucket (a COLLISION); we handle it by
# keeping a little list in each bucket (chaining). Callback: this is exactly the
# fingerprint idea from White Hat, where passwords were hashed.

BUCKETS = 4


def hash_key(key, buckets):
    # Add up the letter codes, then wrap into the bucket range with %.
    total = 0
    for ch in key:
        total += ord(ch)
    return total % buckets


def put(table, key, val):
    # table is a list of buckets; each bucket is a list of [key, value] pairs.
    n = len(table)
    table = [list(bucket) for bucket in table]   # copy so we don't mutate caller
    idx = hash_key(key, n)
    for pair in table[idx]:
        if pair[0] == key:        # key already here -> update its value
            pair[1] = val
            return table
    table[idx].append([key, val])  # new key -> add it to the bucket (chaining)
    return table


def get(table, key):
    # Hash to the bucket, then look only inside that one bucket.
    n = len(table)
    idx = hash_key(key, n)
    for pair in table[idx]:
        if pair[0] == key:
            return pair[1]
    return None


# === PAINTER START ===
# Hidden painter. Stage 1 "where keys land": one row per key, a purple cell in the
# COLUMN it hashes to — same column = collision. Stage 2 "buckets & chaining": one
# row per BUCKET, the first key purple and any collided (chained) key orange. Both
# are driven by the student's OWN hash_key / put.
SLOT = "purple"    # the first key in a bucket
CHAIN = "orange"   # a key that COLLIDED and got chained on after another
NB = 4
DEMO_KEYS = [["cat", 1], ["dog", 2], ["act", 3], ["fish", 4], ["bird", 5]]


def __show_hash():
    grid = []
    for k, _v in DEMO_KEYS:
        idx = hash_key(k, NB)
        row = ["" for _ in range(NB)]
        if isinstance(idx, int) and not isinstance(idx, bool) and 0 <= idx < NB:
            row[idx] = SLOT
        grid.append(row)
    return grid


def __show_table():
    table = [[] for _ in range(NB)]
    for k, v in DEMO_KEYS:
        table = put(table, k, v)
    width = 1
    for bucket in table:
        width = max(width, len(bucket))
    grid = []
    for bucket in table:
        row = []
        for j in range(width):
            if j < len(bucket):
                row.append(SLOT if j == 0 else CHAIN)
            else:
                row.append("")
        grid.append(row)
    return grid
# === PAINTER END ===


TESTS_SPEC = [
    {
        "entry": "hash_key",
        "cases": [
            {"name": 'hash_key("cat", 4)', "args": ["cat", 4]},
            {"name": 'hash_key("dog", 4)', "args": ["dog", 4]},
            {"name": 'hash_key("act", 4) — collides with "cat"', "args": ["act", 4]},
            {"name": 'hash_key("bird", 4)', "args": ["bird", 4]},
        ],
    },
    {
        "entry": "put",
        "cases": [
            {"name": 'put empty, "cat"->1', "args": [[[], [], [], []], "cat", 1]},
            {"name": 'put again, "act"->3 collides into bucket 0', "args": [[[["cat", 1]], [], [], []], "act", 3]},
            {"name": 'put updates an existing key', "args": [[[["cat", 1]], [], [], []], "cat", 9]},
        ],
    },
    {
        "entry": "get",
        "cases": [
            {"name": 'get "cat" from a chained bucket', "args": [[[["cat", 1], ["act", 3]], [], [], []], "cat"]},
            {"name": 'get "act" (the chained one)', "args": [[[["cat", 1], ["act", 3]], [], [], []], "act"]},
            {"name": 'get a missing key -> None', "args": [[[["cat", 1]], [], [], []], "dog"]},
        ],
    },
]

VIZ_SPEC = {
    "type": "draw",
    "title": "Keys hashing into buckets — same bucket means a collision (chained in orange)",
    "todo": "Finish hash_key to see where keys land, then put to fill the buckets.",
    "stages": [
        {
            "fn": "__show_hash",
            "args": [],
            "label": "Where keys land",
            "caption": "🎯 Each key's letters add up to a bucket number. See how 'cat' and 'act' land in the SAME column? That's a collision — different keys, same bucket.",
        },
        {
            "fn": "__show_table",
            "args": [],
            "label": "Buckets & chaining",
            "caption": "🪣 Now each row is a bucket. When two keys collide, we just keep a little list in that bucket — the orange one is chained on. Lookups still jump straight to the right bucket: O(1)!",
        },
    ],
}
