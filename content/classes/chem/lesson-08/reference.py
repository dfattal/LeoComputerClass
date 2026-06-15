# reference.py — answer key for chem/lesson-08 (Grow a Crystal).
#
# INERT answer key. Write this FIRST; generate tests.json with /tmp/gen.py.
# Run `npm run validate-class chem` to check it.
#
# A CRYSTAL is what you get when atoms line up into a perfect, repeating
# pattern — a lattice. Table salt is sodium and chlorine atoms taking turns in
# a neat checkerboard grid. It grows outward in square rings (layers) from a
# single seed. A crystal of `layers` rings is a square (2*layers + 1) on a side.


# --- The two functions the student writes ---

def lattice_side(layers):
    # How many atoms along one side of the square crystal. Start with 1 (the
    # seed), and every layer adds one atom on EACH side: 2 per layer.
    return 2 * layers + 1


def crystal_size(layers):
    # The TOTAL number of atoms in the square crystal: side times side.
    side = lattice_side(layers)
    return side * side


# === PAINTER START ===
# The two atoms that take turns in a salt crystal.
ION_A = "purple"   # sodium
ION_B = "green"    # chlorine


def __show_crystal(layers):
    # Build the square lattice, side = lattice_side(layers). Atoms alternate
    # like a checkerboard, so the pattern is perfectly symmetric.
    side = lattice_side(layers)
    grid = []
    for r in range(side):
        row = []
        for c in range(side):
            row.append(ION_A if (r + c) % 2 == 0 else ION_B)
        grid.append(row)
    return grid
# === PAINTER END ===


# --- generation spec (inert; read by /tmp/gen.py) ---
TESTS_SPEC = [
    {"entry": "lattice_side", "cases": [
        {"name": "0 layers: just the seed", "args": [0]},
        {"name": "1 layer: 3 across", "args": [1]},
        {"name": "2 layers: 5 across", "args": [2]},
        {"name": "3 layers: 7 across", "args": [3]},
    ]},
    {"entry": "crystal_size", "cases": [
        {"name": "0 layers: 1 atom", "args": [0]},
        {"name": "1 layer: 9 atoms", "args": [1]},
        {"name": "2 layers: 25 atoms", "args": [2]},
        {"name": "3 layers: 49 atoms", "args": [3]},
    ]},
]

STAGES_SPEC = [
    {"fn": "__show_crystal", "args": [0], "label": "Seed",
     "caption": "🔸 It all starts with a single seed atom."},
    {"fn": "__show_crystal", "args": [1], "label": "Growing",
     "caption": "✨ One layer added — a 3×3 patch, atoms taking turns like a checkerboard."},
    {"fn": "__show_crystal", "args": [2], "label": "Full crystal",
     "caption": "💎 A finished 5×5 crystal — perfectly symmetric, just like real salt. You did it!"},
]

VIZ_META = {
    "title": "Atoms line up into a perfect repeating pattern — watch a crystal grow ring by ring",
    "todo": "Finish lattice_side(layers) to set the crystal's width and grow it out layer by layer.",
}


if __name__ == "__main__":
    for L in [0, 1, 2, 3]:
        print(f"layers {L}: side={lattice_side(L)}  total={crystal_size(L)}")
