# Addresses 🏠
# Every machine on the internet has an address like 192.168.1.5 — four numbers
# (octets) from 0 to 255. The front is the network (neighborhood), the back is
# the exact machine (house). Split addresses, rebuild them, and tell whether two
# machines are neighbors.
#
# Tip: leave each "pass" until you replace it with your code.


def to_octets(ip):
    # Split "192.168.1.5" into [192, 168, 1, 5].
    # Use ip.split(".") to get the parts, then int(...) each one.
    pass


def to_ip(octets):
    # Glue [192, 168, 1, 5] back into "192.168.1.5".
    # Turn each number into a string, then join with ".".
    pass


def same_network(a, b, prefix):
    # Compare the first `prefix` octets of both addresses.
    # Return True if they all match (neighbors), False if any differ.
    pass


print("Press Run to compare machines octet by octet! 🟩")
