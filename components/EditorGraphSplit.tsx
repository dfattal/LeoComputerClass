"use client";

import { useCallback, useState, type ReactNode } from "react";
import VerticalResizeHandle from "./VerticalResizeHandle";

const HEIGHT_KEY = "editor-graph-height";
const COLLAPSED_KEY = "editor-graph-collapsed";
const DEFAULT_HEIGHT = 300;
const MIN_HEIGHT = 140;
const HEADER_H = 36;

/**
 * Right-column layout for lessons that have a graph: the code editor on top and
 * a resizable, collapsible graph panel beneath it — so students see their code
 * and the resulting trajectory at the same time. Mirrors BottomDrawer's
 * resize/collapse pattern. Rendered only client-side (behind CourseShell's
 * `mounted` guard), so lazy localStorage init is safe.
 */
export default function EditorGraphSplit({
  editor,
  graph,
  label = "📈 Graph",
}: {
  editor: ReactNode;
  graph: ReactNode;
  /** Header label — e.g. "📈 Graph" for plots, "🎨 Canvas" for pixel drawings. */
  label?: ReactNode;
}) {
  const [height, setHeight] = useState(() => {
    const saved = localStorage.getItem(HEIGHT_KEY);
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed >= MIN_HEIGHT) return parsed;
    }
    return DEFAULT_HEIGHT;
  });
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(COLLAPSED_KEY) === "true"
  );

  const clampHeight = useCallback(
    (h: number) => Math.min(Math.max(h, MIN_HEIGHT), window.innerHeight * 0.6),
    []
  );

  // Drag up = taller graph (negative deltaY grows it).
  const handleResize = useCallback(
    (deltaY: number) => setHeight((prev) => clampHeight(prev - deltaY)),
    [clampHeight]
  );

  const handleResizeEnd = useCallback(() => {
    setHeight((current) => {
      localStorage.setItem(HEIGHT_KEY, current.toString());
      return current;
    });
  }, []);

  const handleStepResize = useCallback(
    (direction: number) => {
      setHeight((prev) => {
        const next = clampHeight(prev - direction * 20);
        localStorage.setItem(HEIGHT_KEY, next.toString());
        return next;
      });
    },
    [clampHeight]
  );

  const toggleCollapsed = useCallback(() => {
    setCollapsed((c) => {
      localStorage.setItem(COLLAPSED_KEY, (!c).toString());
      return !c;
    });
  }, []);

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Editor (top) */}
      <div className="min-h-0 flex-1 overflow-hidden">{editor}</div>

      {/* Resize handle — only when the graph is expanded */}
      {!collapsed && (
        <VerticalResizeHandle
          onResize={handleResize}
          onResizeEnd={handleResizeEnd}
          onStepResize={handleStepResize}
        />
      )}

      {/* Graph panel (bottom) */}
      <div
        className="shrink-0 border-t border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-950"
        style={{ height: collapsed ? HEADER_H : height }}
      >
        <div className="flex h-9 shrink-0 items-center gap-2 border-b border-stone-200 px-3 dark:border-stone-800">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            {label}
          </span>
          <div className="flex-1" />
          <button
            onClick={toggleCollapsed}
            className="rounded-md p-1 text-stone-400 transition-colors hover:text-stone-600 dark:hover:text-stone-200"
            aria-label={collapsed ? "Expand graph" : "Collapse graph"}
          >
            <svg
              className={`h-4 w-4 transition-transform ${collapsed ? "" : "rotate-180"}`}
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 8.25l-7.5 7.5-7.5-7.5"
              />
            </svg>
          </button>
        </div>

        {!collapsed && (
          <div
            className="overflow-auto p-3"
            style={{ height: `calc(100% - ${HEADER_H}px)` }}
          >
            {graph}
          </div>
        )}
      </div>
    </div>
  );
}
