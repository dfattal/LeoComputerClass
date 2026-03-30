"use client";

import { useCallback, useRef } from "react";
import { useAccent } from "./AccentContext";

export default function ResizeHandle({
  onResize,
  onResizeEnd,
  onStepResize,
  ratio,
}: {
  onResize: (deltaX: number) => void;
  onResizeEnd: () => void;
  onStepResize?: (direction: number) => void;
  ratio?: number;
}) {
  const accent = useAccent();
  const startX = useRef(0);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      startX.current = e.clientX;
      const target = e.currentTarget as HTMLElement;
      target.setPointerCapture(e.pointerId);

      const onMove = (ev: PointerEvent) => {
        const delta = ev.clientX - startX.current;
        startX.current = ev.clientX;
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
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        onStepResize(-1);
      } else if (e.key === "ArrowRight") {
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
      aria-orientation="vertical"
      aria-valuenow={ratio !== undefined ? Math.round(ratio * 100) : undefined}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Resize panels"
      className={`group relative z-10 flex w-0 shrink-0 cursor-col-resize items-center justify-center focus:outline-none focus-visible:ring-2 ${accent.ring}`}
    >
      {/* Visible bar */}
      <div className={`h-full w-px bg-stone-200 transition-colors ${accent.handleHover} dark:bg-stone-700`} />
      {/* Wider invisible hit area */}
      <div className="absolute inset-y-0 -left-1.5 -right-1.5" />
    </div>
  );
}
