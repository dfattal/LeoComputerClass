# reference.py — answer key for chem/lesson-01 (Atom Builder).
#
# INERT: loadLesson.ts only reads fixed filenames (lesson.mdx, exercises.mdx,
# tests.json, rubric.json, starter.py, viz.json), so this file is never served
# or built. WRITE THIS FIRST, then generate tests.json expected values from it
# with /tmp/gen.py: reference.py is the source of truth.
#
# Run `npm run validate-class chem` to check tests.json against this answer key.
#
# An atom has a NUCLEUS in the middle (protons — the protons are what make it
# gold vs oxygen vs carbon) and ELECTRONS that zoom around it in rings called
# SHELLS. A neutral atom has exactly as many electrons as protons. Shells fill
# up in order: the first holds 2, the next holds 8.


# --- The two functions the student writes ---


def electron_count(protons):
    # A neutral atom is balanced: it has one electron for every proton.
    return protons


def shells(electrons):
    # Stack the electrons into shells. The first shell holds up to 2, the next
    # up to 8, the next up to 8. Keep filling until we run out of electrons.
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


# === PAINTER START ===
# The hidden painter that turns numbers into a real atom. The student never
# sees or writes these; they also live in viz.json's "setup" so the live canvas
# can draw them, and are duplicated here so validate-class can run them.
NUCLEUS = "red"      # the protons in the middle
INNER = "blue"       # an electron tucked in an inner shell
OUTER = "yellow"     # an electron in the OUTER shell — the ones that do chemistry

# Where electron dots sit on an 11x11 grid (center is row 5, col 5).
# Inner shell: a close pair directly above & below the nucleus.
# Outer shell: a ring of up to 8, starting at the four diagonal corners so a
# small atom like carbon shows a clean square ring (no overlap with the inner
# pair), then the four edge midpoints once the shell is fuller.
SHELL_SLOTS = [
    [(3, 5), (7, 5)],
    [(2, 2), (2, 8), (8, 2), (8, 8), (5, 1), (5, 9), (1, 5), (9, 5)],
]


def __blank():
    return [["" for _ in range(11)] for _ in range(11)]


def __show_count(protons=6):
    # Stage 1: the nucleus, plus a row of the electrons you counted (not yet
    # tucked into shells) lined up along the bottom.
    grid = __blank()
    grid[5][5] = NUCLEUS
    n = electron_count(protons)
    for j in range(n):
        if j < 11:
            grid[10][j] = INNER
    return grid


def __show_atom(protons=6):
    # Stage 2: the whole atom — nucleus in the middle, electrons arranged into
    # their shells as rings of dots. The OUTER shell glows yellow, because those
    # outer electrons are the ones that decide how the atom behaves.
    grid = __blank()
    grid[5][5] = NUCLEUS
    layout = shells(electron_count(protons))
    last = len(layout) - 1
    for i, count in enumerate(layout):
        if i >= len(SHELL_SLOTS):
            break
        slots = SHELL_SLOTS[i]
        for j in range(count):
            if j < len(slots):
                r, c = slots[j]
                grid[r][c] = OUTER if i == last else INNER
    return grid
# === PAINTER END ===


# --- generation spec (inert; read by /tmp/gen.py) ---
TESTS_SPEC = [
    {"entry": "electron_count", "cases": [
        {"name": "hydrogen has 1 proton", "args": [1]},
        {"name": "carbon has 6 protons", "args": [6]},
        {"name": "neon has 10 protons", "args": [10]},
    ]},
    {"entry": "shells", "cases": [
        {"name": "hydrogen: 1 electron", "args": [1]},
        {"name": "helium fills shell 1", "args": [2]},
        {"name": "carbon: 2 then 4", "args": [6]},
        {"name": "oxygen: 2 then 6", "args": [8]},
        {"name": "neon fills both shells", "args": [10]},
    ]},
]

STAGES_SPEC = [
    {"fn": "__show_count", "args": [6], "label": "Count",
     "caption": "✅ Carbon has 6 protons, so you counted 6 electrons. Now tuck them into shells!"},
    {"fn": "__show_atom", "args": [6], "label": "Atom",
     "caption": "⚛️ A carbon atom! 2 blue electrons in the inner shell, and 4 yellow ones in the outer shell — the outer ones do all the chemistry."},
]

VIZ_META = {
    "title": "Your atom — a nucleus of protons with electrons ringed around it in shells",
    "todo": "Finish electron_count(protons) to count the electrons for a carbon atom (6 protons).",
}


if __name__ == "__main__":
    import json

    print("electron_count:")
    for p in [1, 6, 10]:
        print(f"  {p} -> {electron_count(p)}")

    print("shells:")
    for e in [1, 2, 6, 8, 10]:
        print(f"  {e} -> {shells(e)}")

    print("stage __show_count(6):")
    print(json.dumps(__show_count(6)))
    print("stage __show_atom(6):")
    print(json.dumps(__show_atom(6)))
