# reference.py — answer key for chem/lesson-05 (Reactions = Rearranging).
#
# INERT answer key. Write this FIRST; generate tests.json with /tmp/gen.py.
# Run `npm run validate-class chem` to check it.
#
# A chemical reaction doesn't make atoms appear or vanish — it just RE-ARRANGES
# the ones you already have. Example: 2 H2 + 1 O2  ->  2 H2O. Count the atoms
# on each side and they MATCH. That rule is called conservation of mass.


# --- The two functions the student writes ---

def atoms_of(num, each):
    # How many atoms in total: number of molecules times atoms in each.
    # 2 molecules of H2 (2 atoms each) -> 4 hydrogen atoms.
    return num * each


def is_balanced(left, right):
    # A reaction is balanced when the count BEFORE equals the count AFTER.
    return left == right


# === PAINTER START ===
H = "white"
O = "red"
STICK = "gray"
WIDTH = 9


def __mol_row(atoms, bonds):
    cells = []
    for i, color in enumerate(atoms):
        cells.append(color)
        if i < len(bonds):
            for _ in range(bonds[i]):
                cells.append(STICK)
    pad = WIDTH - len(cells)
    left = pad // 2
    return [""] * left + cells + [""] * (WIDTH - left - len(cells))


def __blank_row():
    return [""] * WIDTH


def __pad_to(rows, n):
    while len(rows) < n:
        rows.append(__blank_row())
    return rows


def __show_before():
    # The starting stuff: 2 hydrogen molecules (H2) and 1 oxygen molecule (O2).
    nH = atoms_of(2, 2)   # 2 molecules of H2 -> 4 H atoms
    nO = atoms_of(1, 2)   # 1 molecule of O2 -> 2 O atoms
    rows = [__blank_row()]
    for _ in range(nH // 2):
        rows.append(__mol_row([H, H], [1]))
        rows.append(__blank_row())
    for _ in range(nO // 2):
        rows.append(__mol_row([O, O], [2]))
        rows.append(__blank_row())
    return __pad_to(rows, 7)


def __show_after():
    # The same atoms, rearranged into 2 water molecules (H2O). Count them:
    # still 4 white H and 2 red O — nothing was lost.
    nO = atoms_of(1, 2)   # one water per oxygen atom -> 2 waters
    rows = [__blank_row()]
    for _ in range(nO):
        rows.append(__mol_row([H, O, H], [1, 1]))
        rows.append(__blank_row())
    return __pad_to(rows, 7)
# === PAINTER END ===


# --- generation spec (inert; read by /tmp/gen.py) ---
TESTS_SPEC = [
    {"entry": "atoms_of", "cases": [
        {"name": "2 H2 molecules -> 4 H atoms", "args": [2, 2]},
        {"name": "1 O2 molecule -> 2 O atoms", "args": [1, 2]},
        {"name": "2 waters, 1 O each -> 2 O atoms", "args": [2, 1]},
        {"name": "3 molecules of 2 -> 6 atoms", "args": [3, 2]},
        {"name": "1 molecule of 3 -> 3 atoms", "args": [1, 3]},
    ]},
    {"entry": "is_balanced", "cases": [
        {"name": "4 H before and after -> balanced", "args": [4, 4]},
        {"name": "2 O before and after -> balanced", "args": [2, 2]},
        {"name": "4 vs 2 -> NOT balanced", "args": [4, 2]},
        {"name": "6 vs 6 -> balanced", "args": [6, 6]},
    ]},
]

STAGES_SPEC = [
    {"fn": "__show_before", "args": [], "label": "Before",
     "caption": "⚗️ Before: 2 hydrogen molecules + 1 oxygen molecule. Count them — 4 white H and 2 red O."},
    {"fn": "__show_after", "args": [], "label": "After",
     "caption": "💧 After: 2 water molecules. Still 4 white H and 2 red O — nothing vanished, it just rearranged!"},
]

VIZ_META = {
    "title": "A reaction only rearranges atoms — count Before and After and they always match",
    "todo": "Finish atoms_of(num, each) to count the atoms, then check Before and After are equal.",
}


if __name__ == "__main__":
    for n, e in [(2, 2), (1, 2), (2, 1), (3, 2)]:
        print(f"atoms_of({n}, {e}) = {atoms_of(n, e)}")
    print("is_balanced(4, 4) =", is_balanced(4, 4))
    print("is_balanced(4, 2) =", is_balanced(4, 2))
