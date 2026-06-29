# reference.py — answer key for whitehat/lesson-07 (The Trick Email).
#
# INERT: never served or built. WRITE THIS FIRST, then generate tests.json +
# viz.json with the scratchpad generator.
#
# THE STORY: You've broken in five ways with code. But here's the secret the
# pros know: the EASIEST computer to hack is the human sitting in front of it.
# Why pick a lock when you can just trick someone into opening the door?
#
# That's SOCIAL ENGINEERING, and its most common weapon is PHISHING: a fake
# email with a fake link that looks just like the real Fort Knocks, designed to
# scare you into typing your password into the wrong place.
#
# Two giveaways you can teach to code:
#   1. A LOOK-ALIKE LINK. The real site is fortknocks.com. A phishing link is
#      something like fortknocks.com.evil.ru or fortkn0cks.com — close, but the
#      real domain is wrong if you read the WHOLE thing.
#   2. URGENT, SCARY WORDS. "Your account is SUSPENDED! VERIFY your PASSWORD NOW
#      or CLICK here!" Real companies don't panic you like that.

REAL_SITE = "fortknocks.com"
ALARM_WORDS = ["urgent", "verify", "password", "suspended", "now", "click"]


def domain_of(url):
    # Pull the domain out of a link: drop the "https://" part, then take
    # everything up to the first "/".
    s = url
    if "://" in s:
        s = s.split("://", 1)[1]
    return s.split("/", 1)[0]


def is_fake_link(url, real):
    # A link is fake if its real domain isn't EXACTLY the site you expect.
    # fortknocks.com.evil.ru and fortkn0cks.com both fail this test.
    return domain_of(url) != real


def is_phishing(url, message, real):
    # It's phishing if the link is fake, OR the message is packed with at least
    # two urgent/scary alarm words trying to panic you.
    if is_fake_link(url, real):
        return True
    low = message.lower()
    flags = 0
    for word in ALARM_WORDS:
        if word in low:
            flags += 1
    return flags >= 2


# === PAINTER START ===
# Hidden painter: one row per email in your inbox. LEFT cell = the link check
# (green = real domain, red = fake look-alike). RIGHT cell = the overall verdict
# (green = safe, red = PHISHING). The tricky middle case has a real link but a
# scary message — left green, right red. Driven by the student's functions.
SAFE = "green"
BAD = "red"
REAL = "fortknocks.com"


def __row(email):
    url, message = email[0], email[1]
    try:
        link_bad = is_fake_link(url, REAL)
    except Exception:
        link_bad = False
    try:
        phish = is_phishing(url, message, REAL)
    except Exception:
        phish = False
    return [BAD if link_bad else SAFE, "", BAD if phish else SAFE]


def __show_inbox(emails=None):
    if emails is None:
        emails = _EMAILS
    return [__row(e) for e in emails]
# === PAINTER END ===


_EMAILS = [
    ["https://fortknocks.com/login", "Hi Leo, here is your monthly summary."],
    ["https://fortknocks.com.evil.ru/login", "Welcome back to your account."],
    ["https://fortknocks.com/help", "URGENT: verify your password now or be suspended!"],
]

TESTS_SPEC = [
    {"entry": "domain_of", "cases": [
        {"name": "the real login link", "args": ["https://fortknocks.com/login"]},
        {"name": "a sneaky look-alike", "args": ["https://fortknocks.com.evil.ru/login"]},
        {"name": "zero instead of o", "args": ["http://fortkn0cks.com/login"]},
        {"name": "no https:// in front", "args": ["fortknocks.com/page"]},
    ]},
    {"entry": "is_fake_link", "cases": [
        {"name": "the real site is fine", "args": ["https://fortknocks.com/login", "fortknocks.com"]},
        {"name": "extra domain on the end is fake", "args": ["https://fortknocks.com.evil.ru/x", "fortknocks.com"]},
        {"name": "fortkn0cks is fake", "args": ["http://fortkn0cks.com", "fortknocks.com"]},
    ]},
    {"entry": "is_phishing", "cases": [
        {"name": "real link + calm message = safe", "args": ["https://fortknocks.com/login", "Here is your monthly summary.", "fortknocks.com"]},
        {"name": "fake link = phishing", "args": ["https://fortknocks.com.evil.ru/login", "Welcome back.", "fortknocks.com"]},
        {"name": "real link but scary message = phishing", "args": ["https://fortknocks.com/help", "URGENT: verify your password now!", "fortknocks.com"]},
        {"name": "one scary word alone is not enough", "args": ["https://fortknocks.com/help", "Click to read your summary.", "fortknocks.com"]},
    ]},
]

VIZ_SPEC = {
    "type": "draw",
    "resultFn": "__show_inbox",
    "demoArgs": [_EMAILS],
    "title": "Your inbox: LEFT = is the link real? RIGHT = is it phishing? Green = safe, red = danger",
}


if __name__ == "__main__":
    import json
    print("domain_of:", [domain_of(u) for u in
          ["https://fortknocks.com/login", "https://fortknocks.com.evil.ru/login",
           "http://fortkn0cks.com/login", "fortknocks.com/page"]])
    print("is_fake_link:", [is_fake_link(u, "fortknocks.com") for u in
          ["https://fortknocks.com/login", "https://fortknocks.com.evil.ru/x", "http://fortkn0cks.com"]])
    print("is_phishing safe:", is_phishing("https://fortknocks.com/login", "Here is your monthly summary.", "fortknocks.com"))
    print("is_phishing scary:", is_phishing("https://fortknocks.com/help", "URGENT: verify your password now!", "fortknocks.com"))
    print("inbox:", json.dumps(__show_inbox()))
