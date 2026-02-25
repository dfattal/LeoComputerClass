"use client";

import { useState, useCallback, useRef, useEffect, type ReactNode } from "react";
import ResizeHandle from "./ResizeHandle";

const STORAGE_KEY = "split-layout-ratio";
const DEFAULT_RATIO = 0.5;
const MIN_LEFT_PX = 320;
const MIN_RIGHT_PX = 380;

export default function SplitLayout({
  leftPanel,
  rightPanel,
}: {
  leftPanel: ReactNode;
  rightPanel: ReactNode;
}) {
  const [ratio, setRatio] = useState(DEFAULT_RATIO);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // Load saved ratio from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = parseFloat(saved);
      if (!isNaN(parsed) && parsed > 0 && parsed < 1) {
        setRatio(parsed);
      }
    }
    setMounted(true);
  }, []);

  const handleResize = useCallback(
    (deltaX: number) => {
      if (!containerRef.current) return;
      const width = containerRef.current.offsetWidth;
      if (width === 0) return;

      setRatio((prev) => {
        const newRatio = prev + deltaX / width;
        const minLeft = MIN_LEFT_PX / width;
        const maxLeft = 1 - MIN_RIGHT_PX / width;
        return Math.min(Math.max(newRatio, minLeft), maxLeft);
      });
    },
    []
  );

  const handleResizeEnd = useCallback(() => {
    setRatio((current) => {
      localStorage.setItem(STORAGE_KEY, current.toString());
      return current;
    });
  }, []);

  // Mobile: stack vertically
  // Desktop: side-by-side with resize handle
  return (
    <div ref={containerRef} className="flex min-w-0 flex-1 flex-col lg:flex-row">
      {/* Left: content panel */}
      <div
        className="overflow-y-auto lg:overflow-y-auto"
        style={mounted ? { flex: `0 0 ${ratio * 100}%` } : { flex: "0 0 50%" }}
      >
        {leftPanel}
      </div>

      {/* Resize handle - hidden on mobile */}
      <div className="hidden lg:flex">
        <ResizeHandle onResize={handleResize} onResizeEnd={handleResizeEnd} />
      </div>

      {/* Right: code panel */}
      <div className="flex min-h-[50vh] flex-1 flex-col overflow-hidden lg:min-h-0">
        {rightPanel}
      </div>
    </div>
  );
}
