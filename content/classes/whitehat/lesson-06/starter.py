# Listening on the Wire 📡
# Messages hop computer to computer, and a snoop can read any that pass by.
# Build the sniffer that reads a password off the wire, then the encryption
# that turns it into useless gibberish.
#
# Tip: leave each "pass" as-is until you replace it with your code.


def password_from(packet):
    # Find "pass=" and return everything after it, up to the next ";" (or the
    # end). If there's no "pass=", return "".
    pass


def encrypt(text, shift):
    # Caesar cipher (from Secret Codes!): shift each lowercase letter forward by
    # `shift`, wrapping past z. Leave digits and symbols unchanged.
    #   chr((ord(ch) - ord("a") + shift) % 26 + ord("a"))
    pass


def safe_packet(packet, shift):
    # Encrypt the password inside the packet.
    # Get pw with password_from, encrypt it, then replace "pass="+pw with the
    # encrypted version.
    pass


print("Press Run, then compare the red (exposed) and green (safe) wire! 🔴🟢")
