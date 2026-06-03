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
//
// Three input shapes (all flow through `parse`):
//   - bare grid                         → simple mode
//   - { grid, caption }                 → legacy single progressive stage
//   - { stages:[{fn,label,caption,grid,status}], auto, matchCount, todo }
//                                       → progressive multi-stage. The student
//     sees the furthest correct stage by default (`auto`), but can click a chip
//     to PIN an earlier stage and freely experiment with that function without
//     losing their place; the view re-snaps to `auto` whenever progress advances.

import { useState } from "react";

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

type StageResult = {
  fn: string;
  label?: string | null;
  caption: string;
  grid: unknown;
  status: "match" | "wip" | "todo";
};

type Parsed =
  | { mode: "empty" }
  | { mode: "single"; grid: Cell[][] | null; caption?: string }
  | {
      mode: "multi";
      stages: StageResult[];
      auto: number;
      matchCount: number;
      todo: string;
    };

function normalize(data: unknown): Cell[][] | null {
  if (!Array.isArray(data) || data.length === 0) return null;
  // Every row must itself be an array (a 2D grid).
  if (!data.every((row) => Array.isArray(row))) return null;
  return data as Cell[][];
}

function parse(data: unknown): Parsed {
  if (data == null) return { mode: "empty" };
  if (
    typeof data === "object" &&
    !Array.isArray(data) &&
    "stages" in data &&
    Array.isArray((data as { stages: unknown }).stages)
  ) {
    const d = data as {
      stages: StageResult[];
      auto?: number;
      matchCount?: number;
      todo?: string;
    };
    return {
      mode: "multi",
      stages: d.stages,
      auto: typeof d.auto === "number" ? d.auto : 0,
      matchCount: typeof d.matchCount === "number" ? d.matchCount : 0,
      todo: typeof d.todo === "string" ? d.todo : "",
    };
  }
  // Legacy single progressive stage, or a bare grid.
  if (
    typeof data === "object" &&
    !Array.isArray(data) &&
    "grid" in data
  ) {
    const d = data as { grid: unknown; caption?: unknown };
    return {
      mode: "single",
      grid: normalize(d.grid),
      caption: typeof d.caption === "string" ? d.caption : undefined,
    };
  }
  return { mode: "single", grid: normalize(data) };
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

// The actual grid drawing. Returns the placeholder when there's nothing to show.
function GridSvg({ grid, title }: { grid: Cell[][] | null; title?: string }) {
  if (!grid) {
    return (
      <div className="flex h-full min-h-[120px] items-center justify-center rounded-lg border border-stone-200 bg-stone-50 p-4 text-center text-sm dark:border-stone-800 dark:bg-stone-900">
        <span className="text-stone-400">Run your code to see the picture.</span>
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
  );
}

export default function PixelCanvas({
  data,
  title,
}: {
  data?: unknown;
  title?: string;
}) {
  const parsed = parse(data);

  // Which stage the student has pinned (null = "follow the furthest step").
  const [pinned, setPinned] = useState<number | null>(null);
  // The last `auto` we saw, kept in state so we can re-snap when it advances.
  const [prevAuto, setPrevAuto] = useState(-1);

  const auto = parsed.mode === "multi" ? parsed.auto : 0;
  // Adjust state during render (React's sanctioned pattern): when the student
  // pushes their progress further, drop the pin and follow the new furthest
  // step — so experimenting on an earlier step never strands them behind.
  let pinnedNow = pinned;
  if (parsed.mode === "multi" && auto !== prevAuto) {
    setPrevAuto(auto);
    if (auto > prevAuto && pinned !== null) {
      setPinned(null);
      pinnedNow = null;
    }
  }

  const header = title && (
    <h4 className="shrink-0 text-xs font-semibold uppercase tracking-wider text-stone-500">
      {title}
    </h4>
  );

  if (parsed.mode === "empty") {
    return (
      <div className="flex h-full min-h-[160px] flex-col items-center justify-center gap-2 rounded-lg border border-stone-200 bg-stone-50 p-4 text-center text-sm dark:border-stone-800 dark:bg-stone-900">
        <span className="text-stone-400">Run your code to see the picture.</span>
      </div>
    );
  }

  if (parsed.mode === "single") {
    return (
      <div className="flex h-full min-h-0 flex-col gap-2">
        {header}
        <GridSvg grid={parsed.grid} title={title} />
        {parsed.caption && (
          <p className="shrink-0 text-center text-sm font-medium text-stone-600 dark:text-stone-300">
            {parsed.caption}
          </p>
        )}
      </div>
    );
  }

  // --- Multi-stage progressive mode ---
  const { stages, matchCount, todo } = parsed;
  const following = pinnedNow === null;
  const selected = Math.min(
    Math.max(pinnedNow ?? auto, 0),
    stages.length - 1
  );
  const stage = stages[selected];
  const grid = normalize(stage?.grid);

  // Caption: a matched stage shows its own "you did it" line; anything else
  // (still tinkering, or not written yet) shows the lesson's todo nudge.
  const caption = stage?.status === "match" ? stage.caption : todo;

  // Only show chips when there's a real choice to make.
  const showChips = stages.length > 1;

  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      {header}

      {showChips && (
        <div className="flex shrink-0 flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setPinned(null)}
            aria-pressed={following}
            title="Follow the furthest step you've finished"
            className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${
              following
                ? "bg-stone-800 text-white dark:bg-stone-200 dark:text-stone-900"
                : "bg-stone-100 text-stone-500 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700"
            }`}
          >
            ▶ Auto
          </button>
          {stages.map((s, i) => {
            const isSelected = i === selected;
            const isMatch = s.status === "match" && i < matchCount;
            const label = s.label || `Step ${i + 1}`;
            return (
              <button
                key={s.fn + i}
                type="button"
                onClick={() => setPinned(i)}
                aria-pressed={isSelected}
                title={`Play with ${s.fn}()`}
                className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${
                  isSelected
                    ? "bg-sky-600 text-white"
                    : isMatch
                      ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:hover:bg-emerald-900/70"
                      : "bg-stone-100 text-stone-500 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700"
                }`}
              >
                {isMatch ? "✓ " : ""}
                {label}
              </button>
            );
          })}
        </div>
      )}

      <GridSvg grid={grid} title={title} />

      {caption && (
        <p className="shrink-0 text-center text-sm font-medium text-stone-600 dark:text-stone-300">
          {caption}
        </p>
      )}
    </div>
  );
}
