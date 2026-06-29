# reference.py — answer key for whitehat/lesson-06 (Listening on the Wire).
#
# INERT: never served or built. WRITE THIS FIRST, then generate tests.json +
# viz.json with the scratchpad generator.
#
# THE STORY: A message you send across a network doesn't fly straight to Fort
# Knocks. It hops from computer to computer along the way — and any of those can
# LISTEN. That's sniffing. If your password travels as plain text, a snoop reads
# it right off the wire.
#
# Packets look like this:   user=leo;pass=hunter2
#
# The fix is ENCRYPTION (you met it in Secret Codes!). Scramble the password
# before it leaves, so the snoop captures gibberish they can't use. The real
# Fort Knocks (and every real website) does this — that's what the lock 🔒 next
# to a web address means.


def password_from(packet):
    # The snoop's tool: pull the password out of a captured packet. Find "pass="
    # and return everything after it, up to the next ";" (or the end).
    key = "pass="
    i = packet.find(key)
    if i == -1:
        return ""
    rest = packet[i + len(key):]
    end = rest.find(";")
    if end == -1:
        return rest
    return rest[:end]


def encrypt(text, shift):
    # Scramble letters by shifting them along the alphabet (a Caesar cipher,
    # like Secret Codes). Wrap around past z. Leave digits and symbols alone.
    out = ""
    for ch in text:
        if "a" <= ch <= "z":
            out += chr((ord(ch) - ord("a") + shift) % 26 + ord("a"))
        else:
            out += ch
    return out


def safe_packet(packet, shift):
    # The defense: encrypt the password inside the packet before sending it, so
    # a sniffer captures only gibberish.
    pw = password_from(packet)
    return packet.replace("pass=" + pw, "pass=" + encrypt(pw, shift))


# === PAINTER START ===
# Hidden painter: shows the password as it sits on the wire. Top row = plaintext
# (every character RED — fully readable by a snoop). Bottom row = after
# encryption (every character GREEN — safe gibberish). Same length, totally
# different safety. Driven by the student's password_from / encrypt / safe_packet.
EXPOSED = "red"
PROTECTED = "green"


def __show_wire(packet="user=leo;pass=hunter2", shift=3):
    try:
        plain = password_from(packet)
        safe = password_from(safe_packet(packet, shift))
    except Exception:
        plain, safe = "?????", "?????"
    top = [EXPOSED for _ in plain]
    bottom = [PROTECTED for _ in safe]
    return [top, bottom]
# === PAINTER END ===


TESTS_SPEC = [
    {"entry": "password_from", "cases": [
        {"name": "pulls pass from a full packet", "args": ["user=leo;pass=hunter2"]},
        {"name": "password at the start", "args": ["pass=secret"]},
        {"name": "password with stuff after it", "args": ["user=bob;pass=abc;ip=10"]},
        {"name": "no password in the packet", "args": ["just a hello message"]},
    ]},
    {"entry": "encrypt", "cases": [
        {"name": "scrambles hunter2 (shift 3)", "args": ["hunter2", 3]},
        {"name": "abc shifts to bcd (shift 1)", "args": ["abc", 1]},
        {"name": "xyz wraps to abc (shift 3)", "args": ["xyz", 3]},
        {"name": "shift 0 changes nothing", "args": ["leo", 0]},
    ]},
    {"entry": "safe_packet", "cases": [
        {"name": "encrypts the password in place", "args": ["user=leo;pass=hunter2", 3]},
        {"name": "short packet", "args": ["pass=abc", 1]},
    ]},
]

VIZ_SPEC = {
    "type": "draw",
    "resultFn": "__show_wire",
    "demoArgs": ["user=leo;pass=hunter2", 3],
    "title": "The password on the wire: top = plain text (red, a snoop reads it), bottom = encrypted (green, safe)",
}


if __name__ == "__main__":
    import json
    print("password_from:", [password_from(p) for p in
          ["user=leo;pass=hunter2", "pass=secret", "user=bob;pass=abc;ip=10", "hi"]])
    print("encrypt:", [encrypt(t, s) for t, s in [("hunter2", 3), ("abc", 1), ("xyz", 3), ("leo", 0)]])
    print("safe_packet:", safe_packet("user=leo;pass=hunter2", 3))
    print("wire:", json.dumps(__show_wire()))
