# reference.py — answer key for networks/lesson-01 (Packets).
#
# INERT: loadLesson.ts only reads the fixed student filenames, so this file is
# never served or built. WRITE THIS FIRST, then generate tests.json + viz.json
# from it with the scratchpad generator (gen_lesson.py).
#
# THE STORY: You typed a web address and hit enter. Your message is too big to
# shove down the wire in one go — and even if it weren't, the internet would
# rather carry lots of little things than one giant one. So the very first thing
# that happens is your message gets CHOPPED into small numbered envelopes called
# PACKETS. Each packet travels on its own. At the other end they get snapped
# back together in order. That's the whole idea of this first lesson.


def chop(message, size):
    # Cut the message into pieces of length `size`, left to right. The last
    # piece is whatever's left over, so it can be shorter. Return the list of
    # pieces. An empty message makes zero packets.
    return [message[i:i + size] for i in range(0, len(message), size)]


def packet_count(message, size):
    # How many packets will it take to send this message? Just chop it and
    # count the pieces.
    return len(chop(message, size))


def reassemble(chunks):
    # The other side has all the packets, in order. Glue them back into the
    # original message.
    return "".join(chunks)


# === PAINTER START ===
# Hidden painter: draws each packet as its own row. The first cell shows the
# packet's number; the rest are colored squares, one per character, and each
# packet gets its own color — so you can watch the message split into numbered
# envelopes. The last packet is usually shorter: that's the leftover chunk.
# Driven by the student's chop(), so a wrong chop changes the picture.
PALETTE = ["blue", "green", "orange", "purple", "pink"]


def __show_packets(message="HELLO INTERNET", size=4):
    try:
        chunks = chop(message, size)
    except Exception:
        chunks = []
    grid = []
    for i, chunk in enumerate(chunks):
        color = PALETTE[i % len(PALETTE)]
        row = [str(i + 1)]                 # the packet number
        for _ch in chunk:
            row.append(color)              # one colored cell per character
        while len(row) < size + 1:         # pad short packets so rows line up
            row.append("")
        grid.append(row)
    if not grid:
        grid = [[""]]
    return grid
# === PAINTER END ===


TESTS_SPEC = [
    {"entry": "chop", "cases": [
        {"name": "'HELLO INTERNET' in size-4 packets", "args": ["HELLO INTERNET", 4]},
        {"name": "'PACKET' in size-3 packets", "args": ["PACKET", 3]},
        {"name": "message shorter than one packet", "args": ["HI", 4]},
        {"name": "even split, no leftover", "args": ["ABCDEF", 2]},
        {"name": "empty message makes no packets", "args": ["", 4]},
    ]},
    {"entry": "packet_count", "cases": [
        {"name": "'HELLO INTERNET' needs 4 packets", "args": ["HELLO INTERNET", 4]},
        {"name": "'PACKET' needs 2 packets", "args": ["PACKET", 3]},
        {"name": "tiny message is 1 packet", "args": ["HI", 4]},
        {"name": "empty message is 0 packets", "args": ["", 4]},
    ]},
    {"entry": "reassemble", "cases": [
        {"name": "the four packets become the message", "args": [["HELL", "O IN", "TERN", "ET"]]},
        {"name": "two packets become PACKET", "args": [["PAC", "KET"]]},
        {"name": "no packets become an empty message", "args": [[]]},
    ]},
]

VIZ_SPEC = {
    "type": "draw",
    "resultFn": "__show_packets",
    "demoArgs": ["HELLO INTERNET", 4],
    "title": "Your message chopped into numbered packets — each color is one packet, the short last one is the leftover",
}


if __name__ == "__main__":
    import json
    print("chop:", chop("HELLO INTERNET", 4))
    print("packet_count:", packet_count("HELLO INTERNET", 4))
    print("reassemble:", reassemble(["HELL", "O IN", "TERN", "ET"]))
    print("packets grid:", json.dumps(__show_packets()))
