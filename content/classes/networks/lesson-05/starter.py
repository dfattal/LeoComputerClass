# DNS 📖
# You typed a name, but machines only understand numbers. DNS is the internet's
# phonebook: give it a name, it returns the address. Asking is slow, so your
# computer keeps a CACHE of names it already looked up. The phonebook and the
# cache are both lists of [name, ip] pairs.
#
# Tip: leave each "pass" until you replace it with your code.


def resolve(name, table):
    # Look name up in the phonebook (a list of [name, ip] pairs).
    # Return the ip, or "" if the name isn't there.
    pass


def is_cached(name, cache):
    # cache is a list of [name, ip] pairs we already know.
    # Return True if name is in it, else False.
    pass


def resolve_cached(name, table, cache):
    # Cache first, phonebook second. If cached, return [ip, True] (a hit).
    # Otherwise look it up in table and return [ip, False] (a miss).
    # Return a LIST, not a dict. Reuse resolve and is_cached.
    pass


print("Press Run to watch the cache glow green on a hit! 📖")
