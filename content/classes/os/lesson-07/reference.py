# reference.py — answer key for os/lesson-07 (The Need for Speed).
# INERT: never served or built. Source of truth for tests.json.
# The cache is a list, most-recently-used item first. When it's full we drop
# the item at the BACK — the Least Recently Used one.


def access(cache, item, capacity):
    # Use `item`. Move it to the front (most recent). If the cache overflows,
    # drop the least-recently-used item off the back. Return the new cache.
    new = [x for x in cache if x != item]
    new.insert(0, item)
    if len(new) > capacity:
        new = new[:capacity]
    return new


def is_hit(cache, item):
    # True if `item` is already in the cache (a fast "cache hit").
    return item in cache


def total_cost(requests, capacity, hit_cost, miss_cost):
    # Play a whole sequence of reads through an empty cache and add up the
    # time cost: cheap on a hit, expensive on a miss.
    cache = []
    cost = 0
    for item in requests:
        if item in cache:
            cost += hit_cost
        else:
            cost += miss_cost
        cache = access(cache, item, capacity)
    return cost
