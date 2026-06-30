# The Whole Stack 🌍
# Everything you built, in one run. A web address makes the whole journey:
#   1. DNS       — the name becomes an address
#   2. HTTP      — you build the request for the page
#   3. reassemble — the page comes back in packets; glue them together
# Rebuild the three steps, then write load_page — the conductor that runs them
# in order and returns [ip, request, page].
#
# Tip: leave each "pass" until you replace it with your code.


def resolve(name, dns_table):
    # DNS: look name up in the phonebook (list of [name, ip] pairs).
    # Return the ip, or "" if not found.
    pass


def build_request(method, path):
    # HTTP: build "<METHOD> <PATH> HTTP/1.1".
    pass


def reassemble(packets):
    # Glue the page's packets back together in order.
    pass


def load_page(name, path, dns_table, packets):
    # The conductor: run resolve, build_request("GET", path), and reassemble,
    # then return [ip, request, page].
    pass


print("Press Run to watch the whole journey light up! 🌍")
