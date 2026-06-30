# Reliability 📦✅
# The internet loses packets all the time. TCP fixes it simply: number every
# packet, the other side sends back a "got it!" receipt (an ACK) for each one it
# received, and you resend whatever was never acked. `sent` and `acked` are
# lists of sequence numbers.
#
# Tip: leave each "pass" until you replace it with your code.


def missing_acks(sent, acked):
    # Return the seq numbers that were sent but NOT acked, sorted.
    # These are the packets to resend.
    pass


def all_received(sent, acked):
    # True when nothing is missing. Reuse missing_acks.
    pass


def resend_count(sent, acked):
    # How many packets need resending? Reuse missing_acks.
    pass


print("Press Run to watch the lost packets glow red! 📦")
