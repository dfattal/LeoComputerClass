# reference.py — answer key for chem/lesson-01 (Atom Builder).
#
# INERT: loadLesson.ts only reads fixed filenames (lesson.mdx, exercises.mdx,
# tests.json, rubric.json, starter.py, viz.json), so this file is never served
# or built. WRITE THIS FIRST, then generate tests.json expected values from it:
# reference.py is the source of truth; tests.json is generated from it.
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


# --- Given helpers: the hidden painter that turns numbers into a real atom. ---
# The student never sees or writes these. They also live in viz.json's "setup"
# so the live canvas can draw them; they are duplicated here so that
# `npm run validate-class` can run the draw stages against this answer key.

NUCLEUS = "red"      # the protons in the middle
ELECTRON = "blue"    # one electron dot

# Where electron dots sit on an 11x11 grid (center is row 5, col 5).
# Shell 1 has 2 spots; shell 2 has 8 spots ringed around the nucleus.
SHELL_SLOTS = [
    [(3, 5), (7, 5)],
    [(1, 5), (9, 5), (5, 1), (5, 9), (2, 2), (2, 8), (8, 2), (8, 8)],
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
            grid[10][j] = ELECTRON
    return grid


def __show_atom(protons=6):
    # Stage 2: the whole atom — nucleus in the middle, electrons arranged into
    # their shells as rings of dots.
    grid = __blank()
    grid[5][5] = NUCLEUS
    layout = shells(electron_count(protons))
    for i, count in enumerate(layout):
        if i >= len(SHELL_SLOTS):
            break
        slots = SHELL_SLOTS[i]
        for j in range(count):
            if j < len(slots):
                r, c = slots[j]
                grid[r][c] = ELECTRON
    return grid


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
