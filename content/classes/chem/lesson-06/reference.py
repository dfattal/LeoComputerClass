# reference.py — answer key for chem/lesson-06 (Acids, Bases & the Color Spy).
#
# INERT answer key. Write this FIRST; generate tests.json with /tmp/gen.py.
# Run `npm run validate-class chem` to check it.
#
# Every liquid has a pH from 0 to 14. Low (0-6) = ACID (lemon, vinegar).
# 7 = neutral (pure water). High (8-14) = BASE (soap, baking soda). Red-cabbage
# juice is a "color spy": it turns a different color at each pH, so you can SEE
# whether something is an acid or a base.


# --- The two functions the student writes ---

def cabbage_color(pH):
    # The color red-cabbage juice turns at each pH:
    #   very acidic (0-3) -> "red"
    #   mild acid   (4-6) -> "purple"
    #   neutral     (7)   -> "blue"
    #   mild base   (8-11)-> "green"
    #   strong base (12+) -> "yellow"
    if pH <= 3:
        return "red"
    elif pH <= 6:
        return "purple"
    elif pH == 7:
        return "blue"
    elif pH <= 11:
        return "green"
    else:
        return "yellow"


def is_acid(pH):
    # Anything below 7 is an acid.
    return pH < 7


# === PAINTER START ===
def __show_tube(pH):
    # A little test tube of cabbage juice at one pH. The top row is the empty
    # rim; the rest is filled with whatever color this pH turns.
    color = cabbage_color(pH)
    grid = [["", "", ""]]
    for _ in range(4):
        grid.append([color, color, color])
    return grid


def __show_scale():
    # The whole pH scale, 0 on the left to 14 on the right, each column painted
    # the color cabbage juice turns there. A rainbow from acid to base!
    return [[cabbage_color(pH) for pH in range(15)] for _ in range(3)]
# === PAINTER END ===


# --- generation spec (inert; read by /tmp/gen.py) ---
TESTS_SPEC = [
    {"entry": "cabbage_color", "cases": [
        {"name": "pH 0 (battery acid) is red", "args": [0]},
        {"name": "pH 2 (lemon) is red", "args": [2]},
        {"name": "pH 5 (coffee) is purple", "args": [5]},
        {"name": "pH 7 (pure water) is blue", "args": [7]},
        {"name": "pH 9 (baking soda) is green", "args": [9]},
        {"name": "pH 11 (ammonia) is green", "args": [11]},
        {"name": "pH 13 (bleach) is yellow", "args": [13]},
        {"name": "pH 14 (drain cleaner) is yellow", "args": [14]},
    ]},
    {"entry": "is_acid", "cases": [
        {"name": "pH 2 is an acid", "args": [2]},
        {"name": "pH 6 is an acid", "args": [6]},
        {"name": "pH 7 is NOT an acid", "args": [7]},
        {"name": "pH 10 is NOT an acid", "args": [10]},
        {"name": "pH 0 is an acid", "args": [0]},
    ]},
]

STAGES_SPEC = [
    {"fn": "__show_tube", "args": [2], "label": "One test",
     "caption": "🔴 pH 2 is a strong acid (like lemon juice) — the cabbage juice flashes red!"},
    {"fn": "__show_scale", "args": [], "label": "The whole scale",
     "caption": "🌈 The full pH scale: red & purple acids on the left, blue water in the middle, green & yellow bases on the right."},
]

VIZ_META = {
    "title": "Red-cabbage juice is a color spy — it turns acids and bases into different colors",
    "todo": "Finish cabbage_color(pH) to paint the test tube and light up the whole pH rainbow.",
}


if __name__ == "__main__":
    for pH in range(0, 15):
        print(f"pH {pH:2d}: {cabbage_color(pH):7s} acid={is_acid(pH)}")
