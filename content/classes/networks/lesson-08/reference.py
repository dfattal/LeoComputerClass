# reference.py — answer key for networks/lesson-08 (The Whole Stack).
#
# INERT: never served or built. WRITE THIS FIRST, then generate tests.json +
# viz.json with the scratchpad generator (gen_lesson.py).
#
# THE STORY: This is it — everything you built, working together in one run. You
# type a web address and press enter, and here's the ACTUAL journey: the name
# becomes an address (DNS), you build the request (HTTP), and the page comes back
# in packets that you snap together (reassembly). You'll re-build the three key
# steps, then write the CONDUCTOR — load_page — that runs them in order and hands
# back the whole trip. One function call; the entire internet underneath it.


def resolve(name, dns_table):
    # DNS step: turn a name into an address using the phonebook
    # (a list of [name, ip] pairs). Return the ip, or "" if not found.
    for entry_name, ip in dns_table:
        if entry_name == name:
            return ip
    return ""


def build_request(method, path):
    # HTTP step: build the one-line request "<METHOD> <PATH> HTTP/1.1".
    return method + " " + path + " HTTP/1.1"


def reassemble(packets):
    # Reassembly step: the page arrives in packets; glue them back in order.
    return "".join(packets)


def load_page(name, path, dns_table, packets):
    # THE CONDUCTOR. Run the whole journey and report each step's result as a
    # list [ip, request, page]:
    #   1. resolve the name to an address (DNS)
    #   2. build the request line for the path (HTTP)
    #   3. reassemble the page from its packets
    ip = resolve(name, dns_table)
    request = build_request("GET", path)
    page = reassemble(packets)
    return [ip, request, page]


# The world this page lives in — used by the painter and the tests.
DNS_TABLE = [
    ["fortknocks.com", "93.184.7.42"],
    ["leo.net", "10.0.0.7"],
]
PACKETS = ["FORT ", "KNOCKS", " HOME"]


# === PAINTER START ===
# Hidden painter: the whole journey as four lights, left to right —
# DNS, REQUEST, PAGE, DONE. Each lights GREEN when that step produced a result
# and RED when it didn't. Type a name that isn't in the phonebook and watch the
# very first light go red — the trip breaks at step one. Driven by the student's
# load_page().
TABLE_DEMO = [
    ["fortknocks.com", "93.184.7.42"],
    ["leo.net", "10.0.0.7"],
]
PACKETS_DEMO = ["FORT ", "KNOCKS", " HOME"]


def __show_journey(name="fortknocks.com", path="/index.html"):
    try:
        ip, request, page = load_page(name, path, TABLE_DEMO, PACKETS_DEMO)
    except Exception:
        ip, request, page = "", "", ""
    dns = "green" if ip != "" else "red"
    req = "green" if request != "" else "red"
    pg = "green" if page != "" else "red"
    done = "green" if (ip != "" and request != "" and page != "") else "red"
    return [[dns, req, pg, done]]
# === PAINTER END ===


TESTS_SPEC = [
    {"entry": "resolve", "cases": [
        {"name": "fortknocks.com resolves", "args": ["fortknocks.com", DNS_TABLE]},
        {"name": "an unknown name gives ''", "args": ["ghost.com", DNS_TABLE]},
    ]},
    {"entry": "build_request", "cases": [
        {"name": "GET the home page", "args": ["GET", "/index.html"]},
    ]},
    {"entry": "reassemble", "cases": [
        {"name": "packets become the page", "args": [["FORT ", "KNOCKS", " HOME"]]},
        {"name": "no packets -> empty page", "args": [[]]},
    ]},
    {"entry": "load_page", "cases": [
        {"name": "the whole journey, end to end", "args": ["fortknocks.com", "/index.html", DNS_TABLE, PACKETS]},
        {"name": "a name that won't resolve breaks step one", "args": ["ghost.com", "/index.html", DNS_TABLE, PACKETS]},
    ]},
]

VIZ_SPEC = {
    "type": "draw",
    "resultFn": "__show_journey",
    "demoArgs": ["fortknocks.com", "/index.html"],
    "title": "The whole journey: DNS · REQUEST · PAGE · DONE. Green = that step worked. The name becomes a page in one run",
}


if __name__ == "__main__":
    import json
    print("resolve:", resolve("fortknocks.com", DNS_TABLE))
    print("build_request:", build_request("GET", "/index.html"))
    print("reassemble:", reassemble(PACKETS))
    print("load_page:", load_page("fortknocks.com", "/index.html", DNS_TABLE, PACKETS))
    print("journey grid:", json.dumps(__show_journey()))
