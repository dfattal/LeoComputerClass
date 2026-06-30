# Packets 📦
# Your message is too big to send in one go, so chop it into small numbered
# envelopes called packets. Send the pieces, then snap them back together on
# the other side.
#
# Tip: leave each "pass" until you replace it with your code.


def chop(message, size):
    # Cut message into pieces of length `size`, left to right.
    # Walk through it with range(0, len(message), size) and slice
    # message[i:i+size] each time. Return the list of pieces.
    pass


def packet_count(message, size):
    # How many packets does this message need? Chop it and count the pieces.
    pass


def reassemble(chunks):
    # Glue the packets back into the original message.
    pass


print("Press Run to watch your message split into numbered packets! 📦")
