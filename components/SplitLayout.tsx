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
  const hydrating = useRef(true);
  const dragging = useRef(false);

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
    // Turn off hydration flag after initial transition completes
    const timer = setTimeout(() => {
      hydrating.current = false;
    }, 250);
    return () => clearTimeout(timer);
  }, []);

  const clampRatio = useCallback((r: number, width: number) => {
    const minLeft = MIN_LEFT_PX / width;
    const maxLeft = 1 - MIN_RIGHT_PX / width;
    return Math.min(Math.max(r, minLeft), maxLeft);
  }, []);

  // ResizeObserver: clamp ratio when container resizes
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        if (width === 0) continue;
        setRatio((prev) => clampRatio(prev, width));
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [clampRatio]);

  const handleResize = useCallback(
    (deltaX: number) => {
      dragging.current = true;
      if (!containerRef.current) return;
      const width = containerRef.current.offsetWidth;
      if (width === 0) return;
      setRatio((prev) => clampRatio(prev + deltaX / width, width));
    },
    [clampRatio]
  );

  const handleResizeEnd = useCallback(() => {
    dragging.current = false;
    setRatio((current) => {
      localStorage.setItem(STORAGE_KEY, current.toString());
      return current;
    });
  }, []);

  // Keyboard step resize for accessibility
  const handleStepResize = useCallback(
    (direction: number) => {
      if (!containerRef.current) return;
      const width = containerRef.current.offsetWidth;
      if (width === 0) return;
      setRatio((prev) => {
        const newRatio = clampRatio(prev + direction * 0.02, width);
        localStorage.setItem(STORAGE_KEY, newRatio.toString());
        return newRatio;
      });
    },
    [clampRatio]
  );

  // Hydration transition style
  const leftStyle: React.CSSProperties = mounted
    ? { flex: `0 0 ${ratio * 100}%` }
    : { flex: "0 0 50%" };

  if (mounted && hydrating.current && !dragging.current) {
    leftStyle.transition = "flex-basis 200ms ease";
  }

  return (
    <div ref={containerRef} className="flex min-w-0 flex-1 flex-col lg:flex-row">
      {/* Left: content panel */}
      <div className="overflow-y-auto lg:overflow-y-auto" style={leftStyle}>
        {leftPanel}
      </div>

      {/* Resize handle - hidden on mobile */}
      <div className="hidden lg:flex">
        <ResizeHandle
          onResize={handleResize}
          onResizeEnd={handleResizeEnd}
          onStepResize={handleStepResize}
          ratio={ratio}
        />
      </div>

      {/* Right: code panel */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {rightPanel}
      </div>
    </div>
  );
}
