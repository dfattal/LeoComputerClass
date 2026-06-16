# reference.py — answer key for chem/lesson-03 (Sticking Atoms Together).
#
# INERT answer key. Write this FIRST; generate tests.json with /tmp/gen.py.
# Run `npm run validate-class chem` to check it.
#
# Atoms join into molecules by SHARING outer electrons. A shared pair is a
# BOND (a "stick"). An atom keeps making bonds until its outer shell is full:
# most atoms want 8 out there, but tiny hydrogen is happy with 2.


# --- The two functions the student writes ---

def bonds_needed(outer, wants):
    # How many bonds an atom makes = how many more electrons it needs to fill
    # its outer shell. That's (wants - outer).
    return wants - outer


def molecule_atoms(counts):
    # A molecule is a bunch of atoms. Given how many of each kind, add them up
    # to get the total number of atoms. counts is a list like [2, 1] for water.
    return sum(counts)


# === PAINTER START ===
# Atom colors. Bonds (shared electrons) are drawn as gray "sticks". Colors are
# chosen to stay visible on BOTH the light and dark canvas, so we avoid pure
# white (vanishes on white) and pure black (vanishes on dark).
H = "green"   # hydrogen
O = "red"     # oxygen
C = "brown"   # carbon
STICK = "gray"
WIDTH = 9


def __row(atoms, bonds):
    # Lay a molecule out in a line: atom, stick(s), atom, stick(s), atom...
    # The number of sticks between two atoms is how many bonds they share.
    cells = []
    for i, color in enumerate(atoms):
        cells.append(color)
        if i < len(bonds):
            for _ in range(bonds[i]):
                cells.append(STICK)
    pad = WIDTH - len(cells)
    left = pad // 2
    return [""] * left + cells + [""] * (WIDTH - left - len(cells))


def __mol(atoms, bonds):
    blank = [""] * WIDTH
    return [blank[:], __row(atoms, bonds), blank[:]]


def __show_water():
    # H — O — H. Each hydrogen makes 1 bond (it only wants 2 electrons).
    b = bonds_needed(1, 2)
    return __mol([H, O, H], [b, b])


def __show_o2():
    # O = O. Each oxygen wants 8 but has 6, so they share a DOUBLE bond.
    b = bonds_needed(6, 8)
    return __mol([O, O], [b])


def __show_co2():
    # O = C = O. Carbon links to two oxygens, a double bond on each side.
    b = bonds_needed(6, 8)
    return __mol([O, C, O], [b, b])
# === PAINTER END ===


# --- generation spec (inert; read by /tmp/gen.py) ---
TESTS_SPEC = [
    {"entry": "bonds_needed", "cases": [
        {"name": "hydrogen wants 2, has 1 -> 1 bond", "args": [1, 2]},
        {"name": "oxygen wants 8, has 6 -> 2 bonds", "args": [6, 8]},
        {"name": "carbon wants 8, has 4 -> 4 bonds", "args": [4, 8]},
        {"name": "nitrogen wants 8, has 5 -> 3 bonds", "args": [5, 8]},
        {"name": "chlorine wants 8, has 7 -> 1 bond", "args": [7, 8]},
    ]},
    {"entry": "molecule_atoms", "cases": [
        {"name": "water H2O has 3 atoms", "args": [[2, 1]]},
        {"name": "oxygen O2 has 2 atoms", "args": [[2]]},
        {"name": "carbon dioxide CO2 has 3 atoms", "args": [[1, 2]]},
        {"name": "methane CH4 has 5 atoms", "args": [[1, 4]]},
    ]},
]

STAGES_SPEC = [
    {"fn": "__show_water", "args": [], "label": "Water",
     "caption": "💧 Water! One oxygen (red) sharing a single bond with each hydrogen (green)."},
    {"fn": "__show_o2", "args": [], "label": "Oxygen",
     "caption": "🌬️ The oxygen you breathe — two O's holding on with a strong DOUBLE bond."},
    {"fn": "__show_co2", "args": [], "label": "Carbon dioxide",
     "caption": "🫧 Carbon dioxide — the fizz in soda! Carbon (brown) double-bonded to two oxygens."},
]

VIZ_META = {
    "title": "Snap atoms into molecules — every gray stick is a shared pair of electrons (a bond)",
    "todo": "Finish bonds_needed(outer, wants) to connect the atoms with the right number of sticks.",
}


if __name__ == "__main__":
    for o, w in [(1, 2), (6, 8), (4, 8), (5, 8), (7, 8)]:
        print(f"bonds_needed({o}, {w}) = {bonds_needed(o, w)}")
    for c in [[2, 1], [2], [1, 2], [1, 4]]:
        print(f"molecule_atoms({c}) = {molecule_atoms(c)}")
