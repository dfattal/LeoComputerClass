# reference.py — answer key for whitehat/lesson-05 (Sneak Past the Login).
#
# INERT: never served or built. WRITE THIS FIRST, then generate tests.json +
# viz.json with the scratchpad generator.
#
# THE STORY: Fort Knocks checks your login by GLUING your typed-in name straight
# into a command, like:
#
#     find user where name = 'leo'
#
# The computer can't tell your DATA (the name) from its COMMAND (the find rule)
# — they're just one big string. So if you type a sneaky name with a quote in
# it, you can break out of the data part and change what the command MEANS:
#
#     name typed:  ' OR '1'='1
#     command:     find user where name = '' OR '1'='1'
#
# "1 = 1" is ALWAYS true, so the whole rule is always true and the door opens
# for anyone. That's an INJECTION attack. The fix: never trust glued-in input —
# check it for sneaky characters first.

REAL_USER = "leo"


def build_query(username):
    # The server builds its command by gluing your name inside quotes. Harmless
    # for a normal name, dangerous for a sneaky one.
    return "find user where name = '" + username + "'"


def login_ok(username, real_user):
    # The VULNERABLE check. It "runs" the glued command. If the command contains
    # the always-true trick OR '1'='1, it matches everyone. Otherwise it only
    # matches the real user.
    query = build_query(username)
    if "OR '1'='1" in query:
        return True
    return username == real_user


def safe_login(username, real_user):
    # The DEFENSE. Reject any input containing a quote — that's how an attacker
    # breaks out of the data. With sneaky characters refused, only the real
    # name gets in.
    if "'" in username:
        return False
    return username == real_user


# === PAINTER START ===
# Hidden painter: one row per login attempt. LEFT cell = the OLD vulnerable
# system (login_ok), RIGHT cell = the FIXED system (safe_login). Green = door
# opened, red = door stayed shut. The injection row shows the whole point: green
# on the left (it got in!), red on the right (blocked). Driven by the student's
# functions.
GRANTED = "green"
DENIED = "red"
REAL = "leo"


def __cell(ok):
    return GRANTED if ok else DENIED


def __row(username):
    try:
        vuln = login_ok(username, REAL)
    except Exception:
        vuln = False
    try:
        safe = safe_login(username, REAL)
    except Exception:
        safe = False
    return [__cell(vuln), "", __cell(safe)]


def __show_logins(attempts=None):
    if attempts is None:
        attempts = ["leo", "mallory", "' OR '1'='1"]
    return [__row(u) for u in attempts]
# === PAINTER END ===


TESTS_SPEC = [
    {"entry": "build_query", "cases": [
        {"name": "normal name 'leo'", "args": ["leo"]},
        {"name": "another name 'mallory'", "args": ["mallory"]},
        {"name": "the injection payload", "args": ["' OR '1'='1"]},
    ]},
    {"entry": "login_ok", "cases": [
        {"name": "real user gets in", "args": ["leo", "leo"]},
        {"name": "wrong user is denied", "args": ["mallory", "leo"]},
        {"name": "INJECTION breaks in as anyone", "args": ["' OR '1'='1", "leo"]},
    ]},
    {"entry": "safe_login", "cases": [
        {"name": "real user still gets in", "args": ["leo", "leo"]},
        {"name": "wrong user denied", "args": ["mallory", "leo"]},
        {"name": "injection is BLOCKED", "args": ["' OR '1'='1", "leo"]},
        {"name": "any quote is rejected", "args": ["leo's", "leo"]},
    ]},
]

VIZ_SPEC = {
    "type": "draw",
    "resultFn": "__show_logins",
    "demoArgs": [["leo", "mallory", "' OR '1'='1"]],
    "title": "Login attempts: LEFT = old vulnerable system, RIGHT = fixed system. Green = got in, red = blocked",
}


if __name__ == "__main__":
    import json
    print("build_query:", [build_query(u) for u in ["leo", "mallory", "' OR '1'='1"]])
    print("login_ok:", [login_ok(u, "leo") for u in ["leo", "mallory", "' OR '1'='1"]])
    print("safe_login:", [safe_login(u, "leo") for u in ["leo", "mallory", "' OR '1'='1", "leo's"]])
    print("logins:", json.dumps(__show_logins()))
