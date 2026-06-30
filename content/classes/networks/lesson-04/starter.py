# Ports & Sockets 🚪
# The address got your packet to the right machine — but that machine runs many
# programs. The PORT number is the apartment number that picks the right one.
# 80 = web, 443 = secure web, 22 = login. A machine's open doors are a list of
# [port, app] pairs; a port with no program behind it is "closed".
#
# Tip: leave each "pass" until you replace it with your code.


def well_known(port):
    # Return the standard program for a famous port (22, 80, 443, 53),
    # or "unknown" for anything else.
    pass


def route_to_app(port, port_map):
    # port_map is a list of [door_port, app] pairs. Return the app whose door
    # matches `port`, or "closed" if none match.
    pass


def is_open(port, port_map):
    # True if some program is listening on this port. Reuse route_to_app.
    pass


print("Press Run to watch each packet find its door! 🚪")
