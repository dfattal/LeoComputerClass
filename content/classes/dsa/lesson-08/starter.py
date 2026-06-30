# Hash Tables — turn a key into a bucket number, then jump straight to it.
#
# A table is a list of buckets; each bucket is a list of [key, value] pairs.
# Tip: leave each "pass" until you replace it with your code.


def hash_key(key, buckets):
    # Add up ord(ch) for each letter, then % buckets to wrap into range.
    pass


def put(table, key, val):
    # idx = hash_key(key, len(table)). If key is already in table[idx], update it;
    # otherwise append [key, val] to that bucket. Return the table.
    pass


def get(table, key):
    # Hash to the bucket, look only in table[idx], return the value or None.
    pass


print("Press Run to watch keys drop into buckets on the Canvas!")
