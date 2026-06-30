# reference.py — answer key for networks/lesson-07 (Reliability).
#
# INERT: never served or built. WRITE THIS FIRST, then generate tests.json +
# viz.json with the scratchpad generator (gen_lesson.py).
#
# THE STORY: Here's a scary truth — the internet LOSES packets all the time.
# Wires hiccup, routers get busy, packets vanish. So how does a whole web page
# ever arrive in one piece? The trick is called TCP, and it's beautifully simple:
# every packet gets a NUMBER, and the other side sends back a little "got it!"
# receipt for each number it received — an ACK (short for acknowledgement). The
# sender looks at which numbers were NOT acked... and sends just those again.
# That's it. Number them, watch the receipts, resend the missing ones.


def missing_acks(sent, acked):
    # You sent packets with these sequence numbers (`sent`). The other side
    # acked these (`acked`). Return the numbers that were sent but NEVER acked —
    # the ones to resend — in sorted order.
    return sorted([seq for seq in sent if seq not in acked])


def all_received(sent, acked):
    # Did everything make it? True when nothing is missing.
    return missing_acks(sent, acked) == []


def resend_count(sent, acked):
    # How many packets do we need to send again?
    return len(missing_acks(sent, acked))


# === PAINTER START ===
# Hidden painter: one cell per packet you sent, in order. GREEN means the other
# side acked it (it arrived). RED means it was lost and needs resending. Driven
# by the student's missing_acks().
def __show_acks(sent=None, acked=None):
    if sent is None:
        sent = [1, 2, 3, 4, 5]
    if acked is None:
        acked = [1, 2, 4]
    try:
        missing = missing_acks(sent, acked)
    except Exception:
        missing = list(sent)
    row = ["red" if seq in missing else "green" for seq in sorted(sent)]
    return [row]
# === PAINTER END ===


TESTS_SPEC = [
    {"entry": "missing_acks", "cases": [
        {"name": "packets 3 and 5 were lost", "args": [[1, 2, 3, 4, 5], [1, 2, 4]]},
        {"name": "everything arrived", "args": [[1, 2, 3], [1, 2, 3]]},
        {"name": "nothing got through", "args": [[1, 2, 3], []]},
        {"name": "out-of-order acks still work", "args": [[10, 11, 12], [12, 10]]},
    ]},
    {"entry": "all_received", "cases": [
        {"name": "all acked -> True", "args": [[1, 2, 3], [1, 2, 3]]},
        {"name": "one missing -> False", "args": [[1, 2, 3], [1, 2]]},
        {"name": "none acked -> False", "args": [[1, 2, 3], []]},
    ]},
    {"entry": "resend_count", "cases": [
        {"name": "two to resend", "args": [[1, 2, 3, 4, 5], [1, 2, 4]]},
        {"name": "nothing to resend", "args": [[1, 2, 3], [1, 2, 3]]},
        {"name": "resend all three", "args": [[1, 2, 3], []]},
    ]},
]

VIZ_SPEC = {
    "type": "draw",
    "resultFn": "__show_acks",
    "demoArgs": [[1, 2, 3, 4, 5], [1, 2, 4]],
    "title": "Each packet you sent: green = acked (arrived), red = lost and needs resending",
}


if __name__ == "__main__":
    import json
    print("missing_acks:", missing_acks([1, 2, 3, 4, 5], [1, 2, 4]))
    print("all_received:", all_received([1, 2, 3], [1, 2, 3]), all_received([1, 2, 3], [1, 2]))
    print("resend_count:", resend_count([1, 2, 3, 4, 5], [1, 2, 4]))
    print("acks grid:", json.dumps(__show_acks()))
