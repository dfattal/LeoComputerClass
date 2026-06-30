# reference.py — answer key for networks/lesson-04 (Ports & Sockets).
#
# INERT: never served or built. WRITE THIS FIRST, then generate tests.json +
# viz.json with the scratchpad generator (gen_lesson.py).
#
# THE STORY: Your packet finally lands on the right machine — but that machine
# is running a dozen programs at once: a web server, an email server, a login
# service. Which one gets the packet?? The address got the packet to the right
# BUILDING; the PORT number gets it to the right DOOR. Every program waiting for
# traffic sits behind a numbered door. Some port numbers are famous: 80 is the
# web, 443 is the secure web (the padlock!), 22 is remote login. A machine keeps
# a map of which door leads to which program. No program behind a door? The
# packet is turned away — the port is closed.


# A few world-famous port numbers everyone agrees on.
def well_known(port):
    # Return the standard program for a famous port number, or "unknown".
    if port == 22:
        return "login"
    if port == 80:
        return "web"
    if port == 443:
        return "secure web"
    if port == 53:
        return "dns"
    return "unknown"


def route_to_app(port, port_map):
    # port_map is a list of [port, app] doors this machine has open. Return the
    # program behind the matching door, or "closed" if no door has that number.
    for door_port, app in port_map:
        if door_port == port:
            return app
    return "closed"


def is_open(port, port_map):
    # Is there a program listening on this port? True if some door matches.
    return route_to_app(port, port_map) != "closed"


# This machine's open doors, used by the painter and the tests.
PORT_MAP = [
    [22, "login"],
    [80, "web"],
    [443, "secure web"],
]


# === PAINTER START ===
# Hidden painter: one machine with three numbered doors [22, 80, 443]. Each row
# is an incoming packet aimed at a port. The door it enters lights up green; if
# no door has that number the packet is turned away and the last cell glows red
# (blocked). Driven by the student's route_to_app() / is_open().
DOOR_PORTS = [22, 80, 443]
PORT_MAP_DEMO = [
    [22, "login"],
    [80, "web"],
    [443, "secure web"],
]


def __row(port):
    try:
        open_here = is_open(port, PORT_MAP_DEMO)
    except Exception:
        open_here = False
    row = ["green" if (d == port and open_here) else "gray" for d in DOOR_PORTS]
    row.append("red" if not open_here else "")   # blocked indicator
    return row


def __show_doors(incoming=None):
    if incoming is None:
        incoming = [80, 443, 22, 8080]
    return [__row(p) for p in incoming]
# === PAINTER END ===


TESTS_SPEC = [
    {"entry": "well_known", "cases": [
        {"name": "80 is the web", "args": [80]},
        {"name": "443 is the secure web", "args": [443]},
        {"name": "22 is login", "args": [22]},
        {"name": "53 is dns", "args": [53]},
        {"name": "9999 is unknown", "args": [9999]},
    ]},
    {"entry": "route_to_app", "cases": [
        {"name": "port 80 -> web", "args": [80, PORT_MAP]},
        {"name": "port 22 -> login", "args": [22, PORT_MAP]},
        {"name": "port 443 -> secure web", "args": [443, PORT_MAP]},
        {"name": "port 8080 is closed here", "args": [8080, PORT_MAP]},
    ]},
    {"entry": "is_open", "cases": [
        {"name": "80 is open", "args": [80, PORT_MAP]},
        {"name": "22 is open", "args": [22, PORT_MAP]},
        {"name": "8080 is closed", "args": [8080, PORT_MAP]},
    ]},
]

VIZ_SPEC = {
    "type": "draw",
    "resultFn": "__show_doors",
    "demoArgs": [[80, 443, 22, 8080]],
    "title": "One machine, three numbered doors (22, 80, 443). Each packet lights the door it enters — or glows red if the port is closed",
}


if __name__ == "__main__":
    import json
    print("well_known:", [well_known(p) for p in [80, 443, 22, 53, 9999]])
    print("route_to_app:", [route_to_app(p, PORT_MAP) for p in [80, 22, 443, 8080]])
    print("is_open:", [is_open(p, PORT_MAP) for p in [80, 8080]])
    print("doors grid:", json.dumps(__show_doors()))
