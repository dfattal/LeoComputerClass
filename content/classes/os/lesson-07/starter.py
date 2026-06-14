# The Need for Speed
# Disk is slow. A cache keeps recently-used items handy. When it's full, throw
# out the Least Recently Used one. The cache is a list, newest item first.


def access(cache, item, capacity):
    # Use `item`. Move it to the FRONT (it's the most recent now). If the cache
    # is over `capacity`, drop the item at the BACK (least recently used).
    # Return the new cache list.
    # Hint: build a new list without `item`, put `item` at the front, then trim
    # to `capacity` items.
    pass


def is_hit(cache, item):
    # True if `item` is already in the cache (a fast "hit").
    pass


def total_cost(requests, capacity, hit_cost, miss_cost):
    # Play the whole list of reads through an empty cache and add up the time:
    # `hit_cost` when the item is already cached, `miss_cost` when it isn't.
    # Hint: start with cache = []; for each item, add the right cost, then call
    # access() to update the cache.
    pass


print("Press Run to watch the cache fill up!")
