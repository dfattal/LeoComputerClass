"use client";

// Pixel-grid drawing canvas for the beginner "Pixel Wizards" class. No charting
// library — just an <svg> grid of squares, so it's snappy and themeable. Driven
// by a lesson's viz "draw" config via the existing __VIZ__ stdout channel (see
// CourseShell): the student's resultFn returns a 2D grid and we paint it here.
//
// A grid is a list of rows; each row is a list of cells. A cell is one of:
//   - a named color  ("red", "blue", …) → filled square
//   - an emoji / any other string ("🌸") → centered glyph
//   - empty ("", ".", null/undefined)   → transparent (faint outline)
// Rows may be ragged; we pad to the widest row.

// Kid-friendly palette. Names are lowercased before lookup, so "Red" works too.
const COLORS: Record<string, string> = {
  red: "#ef4444",
  orange: "#f97316",
  yellow: "#facc15",
  green: "#22c55e",
  blue: "#3b82f6",
  purple: "#a855f7",
  pink: "#ec4899",
  brown: "#92400e",
  black: "#1c1917",
  white: "#ffffff",
  gray: "#9ca3af",
  grey: "#9ca3af",
};

// Cells that mean "nothing here".
const EMPTY = new Set(["", ".", " ", "_"]);

type Cell = string | number | null | undefined;

function normalize(data: unknown): Cell[][] | null {
  if (!Array.isArray(data) || data.length === 0) return null;
  // Every row must itself be an array (a 2D grid).
  if (!data.every((row) => Array.isArray(row))) return null;
  return data as Cell[][];
}

function cellKind(cell: Cell): { fill: string; glyph?: string } {
  if (cell == null) return { fill: "transparent" };
  const s = String(cell);
  if (EMPTY.has(s)) return { fill: "transparent" };
  const color = COLORS[s.toLowerCase()];
  if (color) return { fill: color };
  // Not a known color → treat the string as an emoji/glyph on a blank cell.
  return { fill: "transparent", glyph: s };
}

export default function PixelCanvas({
  data,
  title,
}: {
  data?: unknown;
  title?: string;
}) {
  const grid = normalize(data);

  if (!grid) {
    return (
      <div className="flex h-full min-h-[160px] items-center justify-center rounded-lg border border-stone-200 bg-stone-50 p-4 text-center text-sm text-stone-400 dark:border-stone-800 dark:bg-stone-900">
        Run your code to see the picture.
      </div>
    );
  }

  const rows = grid.length;
  const cols = grid.reduce((m, row) => Math.max(m, row.length), 0) || 1;

  // Fixed user-unit cell; the whole grid scales responsively via viewBox.
  const CELL = 24;
  const GAP = 2;
  const PAD = 6;
  const W = PAD * 2 + cols * CELL + (cols - 1) * GAP;
  const H = PAD * 2 + rows * CELL + (rows - 1) * GAP;

  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      {title && (
        <h4 className="shrink-0 text-xs font-semibold uppercase tracking-wider text-stone-500">
          {title}
        </h4>
      )}
      <div className="flex min-h-0 flex-1 items-center justify-center rounded-lg border border-stone-200 bg-white p-2 dark:border-stone-800 dark:bg-stone-950">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMid meet"
          className="h-full max-h-full w-full"
          role="img"
          aria-label={title ?? "Pixel drawing"}
        >
          {grid.map((row, r) =>
            Array.from({ length: cols }).map((_, c) => {
              const { fill, glyph } = cellKind(row[c]);
              const x = PAD + c * (CELL + GAP);
              const y = PAD + r * (CELL + GAP);
              const isEmpty = fill === "transparent" && !glyph;
              return (
                <g key={`${r}-${c}`}>
                  <rect
                    x={x}
                    y={y}
                    width={CELL}
                    height={CELL}
                    rx={4}
                    fill={isEmpty ? "transparent" : fill}
                    className={
                      isEmpty
                        ? "stroke-stone-100 dark:stroke-stone-800"
                        : "stroke-black/10 dark:stroke-white/10"
                    }
                    strokeWidth={1}
                  />
                  {glyph && (
                    <text
                      x={x + CELL / 2}
                      y={y + CELL / 2}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={CELL * 0.7}
                    >
                      {glyph}
                    </text>
                  )}
                </g>
              );
            })
          )}
        </svg>
      </div>
    </div>
  );
}
