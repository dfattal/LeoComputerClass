"use client";

import { useCallback, useRef } from "react";

export default function ResizeHandle({
  onResize,
  onResizeEnd,
}: {
  onResize: (deltaX: number) => void;
  onResizeEnd: () => void;
}) {
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

  return (
    <div
      onPointerDown={handlePointerDown}
      className="group relative z-10 flex w-0 shrink-0 cursor-col-resize items-center justify-center"
    >
      {/* Visible bar */}
      <div className="h-full w-px bg-stone-200 transition-colors group-hover:bg-indigo-400 dark:bg-stone-700 dark:group-hover:bg-indigo-500" />
      {/* Wider invisible hit area */}
      <div className="absolute inset-y-0 -left-1.5 -right-1.5" />
    </div>
  );
}
