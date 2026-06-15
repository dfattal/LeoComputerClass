# Atom Builder ⚛️
# Welcome to your lab! Today you build the tiniest thing there is: an atom.
# An atom has a NUCLEUS of protons in the middle, with ELECTRONS spinning around
# it in rings called SHELLS. Finish these two functions to draw a real atom.
#
# Tip: leave each "pass" as-is until you replace it with your code — don't just
# delete it, or Python will complain that a function is empty.


def electron_count(protons):
    # A neutral atom is balanced: one electron for every proton.
    # So just hand back the same number you were given.
    pass


def shells(electrons):
    # Stack the electrons into shells, in order. The first shell holds up to 2,
    # the next holds up to 8, the next holds up to 8.
    # Build a list like [2, 4] (2 in the first shell, 4 in the next).
    #
    # Idea: keep a "remaining" count. For each cap in [2, 8, 8], put in the
    # smaller of (cap, remaining), add it to your list, and subtract it. Stop
    # when nothing is left.
    pass


print("Press Run, then watch your atom appear in the panel! ⚛️")
