# The Element Family 👨‍👩‍👧‍👦
# Last time you built atoms. Today you sort them into FAMILIES.
# The secret: only the OUTER shell matters. Atoms with the same number of
# outer electrons act alike — and that's why the periodic table has columns.
#
# Tip: leave each "pass" until you replace it with your code.


# Given to you (you wrote this last lesson!): stack electrons into shells.
def shells(electrons):
    caps = [2, 8, 8]
    layout = []
    remaining = electrons
    for cap in caps:
        if remaining <= 0:
            break
        put = min(cap, remaining)
        layout.append(put)
        remaining -= put
    return layout


def outer_electrons(electrons):
    # The outer shell is the LAST one in the shells list.
    # Get shells(electrons), then grab the last number with [-1].
    pass


def same_family(a, b):
    # Two atoms are family if they have the SAME number of outer electrons.
    # Compare outer_electrons(a) with outer_electrons(b) and return True/False.
    pass


print("Press Run to light up the outer shell — then see the families line up! 👨‍👩‍👧‍👦")
