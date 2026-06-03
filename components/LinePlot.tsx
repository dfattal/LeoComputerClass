"use client";

// Generic SVG line/trajectory plot. No charting library — just an <svg> with
// computed coordinates, so it's snappy and themeable. Driven by the lesson's
// viz "plot" config via the existing __VIZ__ stdout channel (see CourseShell).
//
// Accepts either a single series of points `[[x, y], ...]` or multiple series
// `[{ name, points, highlight? }, ...]`. The highlighted series is drawn in the
// warm accent color and on top; the rest are muted.

interface Series {
  name?: string;
  points: [number, number][];
  highlight?: boolean;
}

// SVG canvas in user units; scales responsively via viewBox.
const W = 640;
const H = 380;
const M = { top: 30, right: 18, bottom: 38, left: 52 };
const PLOT_W = W - M.left - M.right;
const PLOT_H = H - M.top - M.bottom;
const MAX_POINTS = 400; // downsample longer paths for a clean line

// Muted palette for non-highlighted series.
const PALETTE = ["#60a5fa", "#f472b6", "#34d399", "#c084fc", "#fbbf24"];

function normalize(data: unknown): Series[] | null {
  if (!Array.isArray(data) || data.length === 0) return null;
  const first = data[0];
  // Single series: [[x, y], ...]
  if (Array.isArray(first)) {
    return [{ points: data as [number, number][] }];
  }
  // Multi series: [{ name, points, highlight }, ...]
  if (first && typeof first === "object" && "points" in first) {
    return (data as Series[]).filter(
      (s) => Array.isArray(s.points) && s.points.length > 0
    );
  }
  return null;
}

// Accept either a bare series, or a progress-aware `{ series, caption }` object
// (the caption is the "where you are" message — see CourseShell's caption driver
// and PixelCanvas for the draw equivalent).
function unwrap(data: unknown): { series: Series[] | null; caption?: string } {
  if (
    data &&
    typeof data === "object" &&
    !Array.isArray(data) &&
    "series" in data
  ) {
    const d = data as { series: unknown; caption?: unknown };
    return {
      series: normalize(d.series),
      caption: typeof d.caption === "string" ? d.caption : undefined,
    };
  }
  return { series: normalize(data) };
}

function downsample(points: [number, number][]): [number, number][] {
  if (points.length <= MAX_POINTS) return points;
  const step = Math.ceil(points.length / MAX_POINTS);
  const out: [number, number][] = [];
  for (let i = 0; i < points.length; i += step) out.push(points[i]);
  if (out[out.length - 1] !== points[points.length - 1]) {
    out.push(points[points.length - 1]); // always keep the last point
  }
  return out;
}

function niceTicks(min: number, max: number, count = 4): number[] {
  if (min === max) return [min];
  const span = max - min;
  const raw = span / count;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  const stepNorm = norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10;
  const step = stepNorm * mag;
  const ticks: number[] = [];
  for (let t = Math.ceil(min / step) * step; t <= max + 1e-9; t += step) {
    ticks.push(Math.round(t * 1000) / 1000);
  }
  return ticks;
}

export default function LinePlot({
  data,
  title,
  xLabel,
  yLabel,
}: {
  data?: unknown;
  title?: string;
  xLabel?: string;
  yLabel?: string;
}) {
  const { series, caption } = unwrap(data);

  if (!series) {
    return (
      <div className="flex h-full min-h-[160px] flex-col items-center justify-center gap-2 rounded-lg border border-stone-200 bg-stone-50 p-4 text-center text-sm dark:border-stone-800 dark:bg-stone-900">
        <span className="text-stone-400">Run your code to see the graph.</span>
        {caption && (
          <span className="font-medium text-stone-600 dark:text-stone-300">
            {caption}
          </span>
        )}
      </div>
    );
  }

  const drawn = series.map((s) => ({ ...s, points: downsample(s.points) }));

  // Bounds across all points.
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const s of drawn) {
    for (const [x, y] of s.points) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  // Always include the ground (y = 0) and pad the top a little.
  minY = Math.min(minY, 0);
  minX = Math.min(minX, 0);
  const padY = (maxY - minY) * 0.08 || 1;
  maxY += padY;
  const spanX = maxX - minX || 1;
  const spanY = maxY - minY || 1;

  const sx = (x: number) => M.left + ((x - minX) / spanX) * PLOT_W;
  const sy = (y: number) => M.top + PLOT_H - ((y - minY) / spanY) * PLOT_H;

  const xTicks = niceTicks(minX, maxX);
  const yTicks = niceTicks(minY, maxY);

  // Assign each series a stable id and color once (warm accent for the
  // highlight, palette otherwise). Reused for both the lines and the legend.
  let paletteCursor = 0;
  const prepared = drawn.map((s, id) => ({
    ...s,
    id,
    color: s.highlight
      ? "var(--warm, #f59e0b)"
      : PALETTE[paletteCursor++ % PALETTE.length],
  }));

  // Draw non-highlighted first, highlighted last (on top). Keys stay tied to
  // each series' stable id, not its post-sort position.
  const ordered = [...prepared].sort(
    (a, b) => (a.highlight ? 1 : 0) - (b.highlight ? 1 : 0)
  );

  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      {title && (
        <h4 className="shrink-0 text-xs font-semibold uppercase tracking-wider text-stone-500">
          {title}
        </h4>
      )}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        className="min-h-0 w-full flex-1 rounded-lg border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-950"
        role="img"
        aria-label={title ?? "Plot"}
      >
        {/* Gridlines + tick labels */}
        {xTicks.map((t) => (
          <g key={`x${t}`}>
            <line
              x1={sx(t)} y1={M.top} x2={sx(t)} y2={M.top + PLOT_H}
              className="stroke-stone-100 dark:stroke-stone-800"
            />
            <text
              x={sx(t)} y={M.top + PLOT_H + 16}
              textAnchor="middle"
              className="fill-stone-400 text-[10px]"
            >
              {t}
            </text>
          </g>
        ))}
        {yTicks.map((t) => (
          <g key={`y${t}`}>
            <line
              x1={M.left} y1={sy(t)} x2={M.left + PLOT_W} y2={sy(t)}
              className="stroke-stone-100 dark:stroke-stone-800"
            />
            <text
              x={M.left - 8} y={sy(t) + 3}
              textAnchor="end"
              className="fill-stone-400 text-[10px]"
            >
              {t}
            </text>
          </g>
        ))}

        {/* Ground line (y = 0) drawn stronger */}
        <line
          x1={M.left} y1={sy(0)} x2={M.left + PLOT_W} y2={sy(0)}
          className="stroke-stone-300 dark:stroke-stone-700"
        />

        {/* Series */}
        {ordered.map((s) => {
          const d = s.points.map(([x, y]) => `${sx(x)},${sy(y)}`).join(" ");
          return (
            <polyline
              key={s.id}
              points={d}
              fill="none"
              stroke={s.color}
              strokeWidth={s.highlight ? 3 : 1.75}
              strokeOpacity={s.highlight ? 1 : 0.65}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          );
        })}

        {/* Axis labels */}
        {xLabel && (
          <text
            x={M.left + PLOT_W / 2} y={H - 4}
            textAnchor="middle"
            className="fill-stone-500 text-[11px] font-medium"
          >
            {xLabel}
          </text>
        )}
        {yLabel && (
          <text
            x={14} y={M.top + PLOT_H / 2}
            textAnchor="middle"
            transform={`rotate(-90 14 ${M.top + PLOT_H / 2})`}
            className="fill-stone-500 text-[11px] font-medium"
          >
            {yLabel}
          </text>
        )}
      </svg>

      {/* Legend (only when series are named) */}
      {prepared.some((s) => s.name) && (
        <div className="flex shrink-0 flex-wrap gap-x-4 gap-y-1 text-xs">
          {prepared.map((s) => (
            <span key={s.id} className="inline-flex items-center gap-1.5">
              <span
                className="inline-block h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: s.color }}
              />
              <span
                className={
                  s.highlight
                    ? "font-semibold text-stone-700 dark:text-stone-200"
                    : "text-stone-500"
                }
              >
                {s.name}
                {s.highlight ? " ★" : ""}
              </span>
            </span>
          ))}
        </div>
      )}

      {/* Progress-aware caption (where the student is) */}
      {caption && (
        <p className="shrink-0 text-center text-sm font-medium text-stone-600 dark:text-stone-300">
          {caption}
        </p>
      )}
    </div>
  );
}
