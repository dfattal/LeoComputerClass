# HTTP 💬
# You've reached the server — now ASK for the page in the web's language, HTTP.
# A request is one line: a METHOD (GET = "give me") and a PATH (which page). The
# server reads it and answers with a STATUS CODE: 200 = OK, 404 = Not Found.
#
# Tip: leave each "pass" until you replace it with your code.


def build_request(method, path):
    # Build the request line "<METHOD> <PATH> HTTP/1.1".
    # e.g. build_request("GET", "/index.html") -> "GET /index.html HTTP/1.1"
    pass


def parse_request(line):
    # The server's side: split the line and return [method, path].
    # "GET /index.html HTTP/1.1" -> ["GET", "/index.html"]
    pass


def status_text(code):
    # Translate a status code to words: 200 OK, 301 Moved Permanently,
    # 403 Forbidden, 404 Not Found, 500 Server Error. Anything else -> "Unknown".
    pass


print("Press Run to watch requests get their answers! 💬")
