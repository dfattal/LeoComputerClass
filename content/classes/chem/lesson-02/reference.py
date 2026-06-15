# reference.py — answer key for chem/lesson-02 (The Element Family).
#
# INERT: loadLesson.ts only reads fixed filenames, so this is never served or
# built. WRITE THIS FIRST, then generate tests.json from it with /tmp/gen.py.
# Run `npm run validate-class chem` to check tests.json against this answer key.
#
# Electrons stack in shells: the first holds 2, the next 8, the next 8. The
# OUTER shell — the one furthest out — is what decides how an atom behaves.
# Atoms with the SAME number of outer electrons act like a family, and that's
# why the periodic table has repeating columns.


# --- Given helper (the student already wrote this in Lesson 1) ---

def shells(electrons):
    # Stack electrons into shells of 2, 8, 8. Returns a list like [2, 8, 1].
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


# --- The two functions the student writes ---

def outer_electrons(electrons):
    # How many electrons are in the OUTERMOST shell — the last number in the
    # shells list. That's the atom's "family number."
    return shells(electrons)[-1]


def same_family(a, b):
    # Two atoms are in the same family if they have the same number of outer
    # electrons. Give back True or False.
    return outer_electrons(a) == outer_electrons(b)


# === PAINTER START ===
NUCLEUS = "red"      # the protons in the middle
INNER = "blue"       # an electron tucked in an inner shell
OUTER = "yellow"     # an electron in the outer shell — the family marker

# Electron slots on a 13x13 grid (center is row 6, col 6): three rings.
SHELL_SLOTS = [
    [(4, 6), (8, 6)],
    [(2, 6), (10, 6), (6, 2), (6, 10), (3, 3), (3, 9), (9, 3), (9, 9)],
    [(0, 6), (12, 6), (6, 0), (6, 12), (1, 1), (1, 11), (11, 1), (11, 11)],
]

# One color per family number 1..8, so the table's columns light up.
FAMILY_COLORS = ["red", "orange", "yellow", "green", "blue", "purple", "pink", "brown"]


def __blank(n=13):
    return [["" for _ in range(n)] for _ in range(n)]


def __show_outer(electrons=11):
    # Draw the whole atom, but paint the OUTER shell's electrons yellow so the
    # family marker pops out. (Sodium, 11 electrons, has just 1 outer.)
    grid = __blank()
    grid[6][6] = NUCLEUS
    layout = shells(electrons)
    last = len(layout) - 1
    n_outer = outer_electrons(electrons)
    for i, count in enumerate(layout):
        if i >= len(SHELL_SLOTS):
            break
        slots = SHELL_SLOTS[i]
        for j in range(count):
            if j < len(slots):
                r, c = slots[j]
                # Light up the outer shell yellow (n_outer of them).
                if i == last and j < n_outer:
                    grid[r][c] = OUTER
                else:
                    grid[r][c] = INNER
    return grid


def __show_table(n=18):
    # Lay the first n elements into the periodic table: row = period (how many
    # shells), column = family number (outer electrons). Color by column, so
    # the families line up as vertical stripes.
    grid = [["" for _ in range(8)] for _ in range(3)]
    for el in range(1, n + 1):
        period = len(shells(el))
        col = outer_electrons(el)
        grid[period - 1][col - 1] = FAMILY_COLORS[col - 1]
    return grid
# === PAINTER END ===


# --- generation spec (inert; read by /tmp/gen.py) ---
TESTS_SPEC = [
    {"entry": "outer_electrons", "cases": [
        {"name": "hydrogen (1) has 1 outer", "args": [1]},
        {"name": "lithium (3) has 1 outer", "args": [3]},
        {"name": "carbon (6) has 4 outer", "args": [6]},
        {"name": "oxygen (8) has 6 outer", "args": [8]},
        {"name": "neon (10) fills its outer shell", "args": [10]},
        {"name": "sodium (11) has 1 outer", "args": [11]},
        {"name": "argon (18) fills its outer shell", "args": [18]},
    ]},
    {"entry": "same_family", "cases": [
        {"name": "lithium & sodium are family", "args": [3, 11]},
        {"name": "oxygen & sulfur are family", "args": [8, 16]},
        {"name": "neon & argon are family", "args": [10, 18]},
        {"name": "carbon & oxygen are not", "args": [6, 8]},
        {"name": "hydrogen & helium are not", "args": [1, 2]},
    ]},
]

STAGES_SPEC = [
    {"fn": "__show_outer", "args": [11], "label": "Outer shell",
     "caption": "✨ Sodium has just 1 electron in its outer shell (the yellow one) — that's its family number!"},
    {"fn": "__show_table", "args": [18], "label": "The Table",
     "caption": "⚛️ Look — the columns line up by color! Same column = same family = same outer electrons."},
]

VIZ_META = {
    "title": "Outer electrons decide an atom's family — and that's why the periodic table repeats",
    "todo": "Finish outer_electrons(electrons) to light up sodium's outer shell and color the periodic table.",
}


if __name__ == "__main__":
    for e in [1, 3, 6, 8, 10, 11, 18]:
        print(f"outer_electrons({e}) = {outer_electrons(e)}  shells={shells(e)}")
    print("same_family(3, 11) =", same_family(3, 11))
    print("same_family(6, 8)  =", same_family(6, 8))
