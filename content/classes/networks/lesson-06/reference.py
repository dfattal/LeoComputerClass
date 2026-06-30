# reference.py — answer key for networks/lesson-06 (HTTP).
#
# INERT: never served or built. WRITE THIS FIRST, then generate tests.json +
# viz.json with the scratchpad generator (gen_lesson.py).
#
# THE STORY: Your packet reached the right machine, the right door (port 80, the
# web), through the right route, after the name became a number. Now what? You
# have to actually ASK for the page — politely, in the web's language: HTTP. A
# request is a single line: a METHOD (what you want to do — GET means "give me")
# and a PATH (which page). The server reads it and answers with a STATUS CODE: a
# little number that says how it went. 200 means OK. 404 means Not Found. You've
# seen these your whole life — now you'll speak them.


def build_request(method, path):
    # Build the one-line request a browser sends. The shape is always:
    #   "<METHOD> <PATH> HTTP/1.1"
    # e.g. build_request("GET", "/index.html") -> "GET /index.html HTTP/1.1"
    return method + " " + path + " HTTP/1.1"


def parse_request(line):
    # The server's side: read a request line and pull out the method and path.
    # Return them as a list [method, path].
    # "GET /index.html HTTP/1.1" -> ["GET", "/index.html"]
    parts = line.split(" ")
    return [parts[0], parts[1]]


def status_text(code):
    # Translate a status code number into its human words.
    if code == 200:
        return "OK"
    if code == 301:
        return "Moved Permanently"
    if code == 403:
        return "Forbidden"
    if code == 404:
        return "Not Found"
    if code == 500:
        return "Server Error"
    return "Unknown"


# === PAINTER START ===
# Hidden painter: one row per request/response. The left cell (blue) is the
# request you sent; the right cell is the server's answer, colored by its status:
# green = OK, orange = a redirect (Moved Permanently), red = an error
# (Not Found / Forbidden / Server Error). Driven by the student's build_request()
# and status_text().
def __status_color(code):
    text = status_text(code)
    if text == "OK":
        return "green"
    if text == "Moved Permanently":
        return "orange"
    if text in ("Not Found", "Forbidden", "Server Error"):
        return "red"
    return "gray"


def __row(method, path, code):
    try:
        sent = build_request(method, path)
        req_color = "blue" if sent else "gray"
        resp_color = __status_color(code)
    except Exception:
        req_color, resp_color = "gray", "gray"
    return [req_color, resp_color]


def __show_exchanges(exchanges=None):
    if exchanges is None:
        exchanges = [
            ["GET", "/index.html", 200],
            ["GET", "/moved", 301],
            ["GET", "/secret", 403],
            ["GET", "/missing", 404],
        ]
    return [__row(m, p, c) for m, p, c in exchanges]
# === PAINTER END ===


TESTS_SPEC = [
    {"entry": "build_request", "cases": [
        {"name": "GET the home page", "args": ["GET", "/index.html"]},
        {"name": "GET a deeper page", "args": ["GET", "/pages/about"]},
        {"name": "POST to log in", "args": ["POST", "/login"]},
    ]},
    {"entry": "parse_request", "cases": [
        {"name": "read a GET request", "args": ["GET /index.html HTTP/1.1"]},
        {"name": "read a POST request", "args": ["POST /login HTTP/1.1"]},
    ]},
    {"entry": "status_text", "cases": [
        {"name": "200 is OK", "args": [200]},
        {"name": "301 moved permanently", "args": [301]},
        {"name": "403 forbidden", "args": [403]},
        {"name": "404 not found", "args": [404]},
        {"name": "500 server error", "args": [500]},
        {"name": "a code we don't know", "args": [418]},
    ]},
]

VIZ_SPEC = {
    "type": "draw",
    "resultFn": "__show_exchanges",
    "demoArgs": [[
        ["GET", "/index.html", 200],
        ["GET", "/moved", 301],
        ["GET", "/secret", 403],
        ["GET", "/missing", 404],
    ]],
    "title": "Request (blue) and the server's answer: green = OK, orange = redirect, red = error",
}


if __name__ == "__main__":
    import json
    print("build_request:", build_request("GET", "/index.html"))
    print("parse_request:", parse_request("GET /index.html HTTP/1.1"))
    print("status_text:", [status_text(c) for c in [200, 301, 403, 404, 500, 418]])
    print("exchanges grid:", json.dumps(__show_exchanges()))
