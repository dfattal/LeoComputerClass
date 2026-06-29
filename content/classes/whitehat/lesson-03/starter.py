# The Locked-Up Password 🔐
# Smart sites store a scrambled "hash" of your password, not the real thing.
# Build the hash, the attack that cracks weak passwords, and the salt that
# defends them.
#
# Tip: leave each "pass" as-is until you replace it with your code.


def simple_hash(password):
    # Scramble the password into a one-way number.
    # Start h = 7. For each ch in password:
    #     h = (h * 31 + ord(ch)) % 1000000007
    # Return h at the end.
    pass


def dictionary_attack(target_hash, wordlist):
    # Hash each common word; if one matches target_hash, return that word.
    # If none match, return "".
    pass


def salted_hash(password, salt):
    # Mix the salt onto the front, THEN hash: simple_hash(salt + password).
    pass


print("Press Run, then find the matching fingerprint in the panel! 🎨")
