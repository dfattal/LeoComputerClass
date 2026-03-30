"use client";

import { useCallback, useRef } from "react";
import { useAccent } from "./AccentContext";

export default function VerticalResizeHandle({
  onResize,
  onResizeEnd,
  onStepResize,
  ratio,
}: {
  onResize: (deltaY: number) => void;
  onResizeEnd: () => void;
  onStepResize?: (direction: number) => void;
  ratio?: number;
}) {
  const accent = useAccent();
  const startY = useRef(0);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      startY.current = e.clientY;
      const target = e.currentTarget as HTMLElement;
      target.setPointerCapture(e.pointerId);

      const onMove = (ev: PointerEvent) => {
        const delta = ev.clientY - startY.current;
        startY.current = ev.clientY;
        onResize(delta);
      };

      const onUp = () => {
        target.removeEventListener("pointermove", onMove);
        target.removeEventListener("pointerup", onUp);
        onResizeEnd();
      };

      target.addEventListener("pointermove", onMove);
      target.addEventListener("pointerup", onUp);
    },
    [onResize, onResizeEnd]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!onStepResize) return;
      if (e.key === "ArrowUp") {
        e.preventDefault();
        onStepResize(-1);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        onStepResize(1);
      }
    },
    [onStepResize]
  );

  return (
    <div
      onPointerDown={handlePointerDown}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="separator"
      aria-orientation="horizontal"
      aria-valuenow={ratio !== undefined ? Math.round(ratio * 100) : undefined}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Resize editor and output"
      className={`group relative z-10 flex h-0 shrink-0 cursor-row-resize items-center justify-center focus:outline-none focus-visible:ring-2 ${accent.ring}`}
    >
      {/* Visible bar */}
      <div className={`h-px w-full bg-stone-200 transition-colors ${accent.handleHover} dark:bg-stone-700`} />
      {/* Wider invisible hit area */}
      <div className="absolute inset-x-0 -bottom-1.5 -top-1.5" />
    </div>
  );
}
