# reference.py — answer key for chem/lesson-04 (Solid, Liquid, Gas).
#
# INERT answer key. Write this FIRST; generate tests.json with /tmp/gen.py.
# Run `npm run validate-class chem` to check it.
#
# Same molecules, different amounts of ENERGY. Cold = particles packed tight in
# a neat block (SOLID). Warmer = they loosen up and slide around (LIQUID).
# Hot = they fly apart with big gaps (GAS). The PARTICLES never change — only
# how far apart they sit. Temperature here runs 0 (freezing) to 100 (boiling).


# --- The two functions the student writes ---

def spacing(temp):
    # How big the gap between particles is. Cold -> 0 (packed). Warm -> 1.
    # Hot -> 2 (lots of space).
    if temp < 34:
        return 0
    elif temp < 67:
        return 1
    else:
        return 2


def state_name(temp):
    # Name the state of matter from the spacing: 0 packed = "solid",
    # 1 loose = "liquid", 2 spread out = "gas".
    gap = spacing(temp)
    if gap == 0:
        return "solid"
    elif gap == 1:
        return "liquid"
    else:
        return "gas"


# === PAINTER START ===
PARTICLE = "blue"
GRID = 7


def __blank(n=GRID):
    return [["" for _ in range(n)] for _ in range(n)]


def __show_state(temp):
    # Always the SAME 9 particles (3 rows of 3) — matter is never created or
    # destroyed. The only thing that changes is the gap between them, which is
    # spacing(temp). Cold packs them tight; hot spreads them out.
    grid = __blank()
    gap = spacing(temp)
    step = gap + 1
    span = 2 * step
    start = (GRID - 1 - span) // 2
    for i in range(3):
        for j in range(3):
            r = start + i * step
            c = start + j * step
            grid[r][c] = PARTICLE
    return grid
# === PAINTER END ===


# --- generation spec (inert; read by /tmp/gen.py) ---
TESTS_SPEC = [
    {"entry": "spacing", "cases": [
        {"name": "freezing (0) is packed", "args": [0]},
        {"name": "cold (20) is packed", "args": [20]},
        {"name": "warm (50) loosens up", "args": [50]},
        {"name": "hot (90) spreads out", "args": [90]},
        {"name": "boiling (100) spreads out", "args": [100]},
    ]},
    {"entry": "state_name", "cases": [
        {"name": "10 degrees is solid", "args": [10]},
        {"name": "50 degrees is liquid", "args": [50]},
        {"name": "90 degrees is gas", "args": [90]},
        {"name": "freezing is solid", "args": [0]},
        {"name": "boiling is gas", "args": [100]},
    ]},
]

STAGES_SPEC = [
    {"fn": "__show_state", "args": [10], "label": "❄️ Cold",
     "caption": "❄️ Cold! The 9 particles are packed into a tight block — that's a SOLID, like ice."},
    {"fn": "__show_state", "args": [50], "label": "💧 Warm",
     "caption": "💧 Warmer! The same 9 particles loosen up and slide around — that's a LIQUID, like water."},
    {"fn": "__show_state", "args": [90], "label": "🔥 Hot",
     "caption": "🔥 Hot! The same 9 particles fly apart with big gaps — that's a GAS, like steam."},
]

VIZ_META = {
    "title": "Heat it up: the same particles go from packed (solid) to loose (liquid) to flying (gas)",
    "todo": "Finish spacing(temp) to set the gap between particles — watch the block melt and boil.",
}


if __name__ == "__main__":
    for t in [0, 20, 50, 90, 100]:
        print(f"temp {t}: spacing={spacing(t)}  state={state_name(t)}")
