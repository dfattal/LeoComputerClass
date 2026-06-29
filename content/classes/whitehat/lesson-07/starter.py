# The Trick Email 🎣
# The easiest computer to hack is the human. Build a phishing detector that
# catches fake look-alike links AND panic-words scams.
# The real site is "fortknocks.com".
#
# Tip: leave each "pass" as-is until you replace it with your code.

ALARM_WORDS = ["urgent", "verify", "password", "suspended", "now", "click"]


def domain_of(url):
    # Drop the "https://" part, then take everything up to the first "/".
    # If "://" in url: take url.split("://", 1)[1]. Then split on "/" and take [0].
    pass


def is_fake_link(url, real):
    # True if the link's domain isn't EXACTLY the real site.
    pass


def is_phishing(url, message, real):
    # True if the link is fake, OR the message has at least 2 alarm words.
    # First: if is_fake_link(url, real): return True
    # Then: lowercase the message, count how many ALARM_WORDS are in it,
    # and return whether the count is >= 2.
    pass


print("Press Run, then watch your detector flag the trick emails! 🟢🔴")
