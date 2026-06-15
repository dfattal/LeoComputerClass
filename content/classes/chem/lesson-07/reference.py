# reference.py — answer key for chem/lesson-07 (Mixing Colors & Chromatography).
#
# INERT answer key. Write this FIRST; generate tests.json with /tmp/gen.py.
# Run `npm run validate-class chem` to check it.
#
# Chromatography is a way to UN-mix colors. Dab a marker dot near the bottom of
# a paper strip and let water creep up it. Each hidden pigment gets carried
# along at its OWN speed, so over time they spread into separate bands. The fast
# pigment ends up high; the slow one stays low. The paper is 7 squares tall.


MAX = 7  # the paper is only 7 squares tall, so nothing climbs past the top.


# --- The two functions the student writes ---

def travel(speed, time):
    # How far up a pigment has climbed: its speed times how long it's traveled.
    # But it can't climb off the paper, so cap it at MAX (7).
    return min(speed * time, MAX)


def highest(speeds, time):
    # Given a few pigments' speeds, how far up has the HIGHEST one climbed?
    return max(travel(s, time) for s in speeds)


# === PAINTER START ===
PAPER_H = 8   # rows 0 (top) .. 7 (bottom start line)
WIDTH = 5

# Three hidden pigments in a "black" marker, each with its own climbing speed.
PIGMENTS = [("yellow", 3), ("red", 2), ("blue", 1)]


def __show_strip(time):
    # Draw the paper after `time` steps. Each pigment sits in its own column,
    # climbed up by travel(speed, time). They start mixed at the bottom and
    # spread into separate bands as time goes on.
    grid = [["" for _ in range(WIDTH)] for _ in range(PAPER_H)]
    for i, (color, speed) in enumerate(PIGMENTS):
        dist = travel(speed, time)
        row = (PAPER_H - 1) - dist
        col = i + 1
        grid[row][col] = color
    return grid
# === PAINTER END ===


# --- generation spec (inert; read by /tmp/gen.py) ---
TESTS_SPEC = [
    {"entry": "travel", "cases": [
        {"name": "speed 3 for 2 steps -> 6", "args": [3, 2]},
        {"name": "speed 1 for 5 steps -> 5", "args": [1, 5]},
        {"name": "no time, no climbing -> 0", "args": [2, 0]},
        {"name": "can't climb past the top -> 7", "args": [3, 5]},
        {"name": "speed 2 for 3 steps -> 6", "args": [2, 3]},
    ]},
    {"entry": "highest", "cases": [
        {"name": "fastest of 1,2,3 after 2 steps", "args": [[1, 2, 3], 2]},
        {"name": "fastest of 1,2,3 after 1 step", "args": [[1, 2, 3], 1]},
        {"name": "two equal pigments after 3 steps", "args": [[2, 2], 3]},
        {"name": "one lonely pigment after 5 steps", "args": [[1], 5]},
    ]},
]

STAGES_SPEC = [
    {"fn": "__show_strip", "args": [0], "label": "Start",
     "caption": "⚫ Start: all three pigments are dabbed together at the bottom — looks like one color."},
    {"fn": "__show_strip", "args": [1], "label": "Climbing",
     "caption": "⬆️ The water creeps up and carries the pigments along — they're starting to pull apart."},
    {"fn": "__show_strip", "args": [2], "label": "Separated",
     "caption": "🌈 Separated! Fast yellow climbed highest, slow blue stayed low — one marker, three hidden colors."},
]

VIZ_META = {
    "title": "Pigments race up the paper at different speeds, so one marker splits into separate color bands",
    "todo": "Finish travel(speed, time) to climb each pigment up the paper and watch them separate.",
}


if __name__ == "__main__":
    for s, t in [(3, 2), (1, 5), (2, 0), (3, 5), (2, 3)]:
        print(f"travel({s}, {t}) = {travel(s, t)}")
    print("highest([1,2,3], 2) =", highest([1, 2, 3], 2))
