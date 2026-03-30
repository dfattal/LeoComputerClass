"use client";

import { useState, useCallback, useRef, type ReactNode } from "react";
import VerticalResizeHandle from "./VerticalResizeHandle";

const DRAWER_HEIGHT_KEY = "drawer-height";
const DRAWER_COLLAPSED_KEY = "drawer-collapsed";
const DEFAULT_HEIGHT = 240;
const MIN_HEIGHT = 120;
const COLLAPSED_HEADER_HEIGHT = 40;

const baseDrawerTabs = ["Output", "Tests", "Review"] as const;
export type DrawerTab = (typeof baseDrawerTabs)[number] | "Lab";

export default function BottomDrawer({
  activeTab,
  onTabChange,
  collapsed,
  onCollapsedChange,
  outputContent,
  testsContent,
  reviewContent,
  labContent,
}: {
  activeTab: DrawerTab;
  onTabChange: (tab: DrawerTab) => void;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  outputContent: ReactNode;
  testsContent: ReactNode;
  reviewContent: ReactNode;
  labContent?: ReactNode;
}) {
  // Safe to use lazy init: this component only renders client-side (behind CourseShell's mounted guard)
  const [height, setHeight] = useState(() => {
    const saved = localStorage.getItem(DRAWER_HEIGHT_KEY);
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed >= MIN_HEIGHT) return parsed;
    }
    return DEFAULT_HEIGHT;
  });
  const containerRef = useRef<HTMLDivElement>(null);

  const clampHeight = useCallback((h: number) => {
    const maxH = window.innerHeight * 0.6;
    return Math.min(Math.max(h, MIN_HEIGHT), maxH);
  }, []);

  // Inverted delta: drag up = taller (negative deltaY = larger height)
  const handleResize = useCallback(
    (deltaY: number) => {
      setHeight((prev) => clampHeight(prev - deltaY));
    },
    [clampHeight]
  );

  const handleResizeEnd = useCallback(() => {
    setHeight((current) => {
      localStorage.setItem(DRAWER_HEIGHT_KEY, current.toString());
      return current;
    });
  }, []);

  const handleStepResize = useCallback(
    (direction: number) => {
      setHeight((prev) => {
        // Up arrow (direction -1) = taller, down arrow (direction 1) = shorter
        const newH = clampHeight(prev - direction * 20);
        localStorage.setItem(DRAWER_HEIGHT_KEY, newH.toString());
        return newH;
      });
    },
    [clampHeight]
  );

  const toggleCollapsed = useCallback(() => {
    onCollapsedChange(!collapsed);
    localStorage.setItem(DRAWER_COLLAPSED_KEY, (!collapsed).toString());
  }, [collapsed, onCollapsedChange]);

  const drawerTabs: DrawerTab[] = labContent
    ? ["Output", "Tests", "Lab", "Review"]
    : ["Output", "Tests", "Review"];

  const tabContent: Record<DrawerTab, ReactNode> = {
    Output: outputContent,
    Tests: testsContent,
    Review: reviewContent,
    Lab: labContent ?? null,
  };

  return (
    <div
      ref={containerRef}
      className="shrink-0 border-t border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-950"
      style={{
        height: collapsed ? COLLAPSED_HEADER_HEIGHT : height,
      }}
    >
      {/* Resize handle at top edge — only when expanded */}
      {!collapsed && (
        <VerticalResizeHandle
          onResize={handleResize}
          onResizeEnd={handleResizeEnd}
          onStepResize={handleStepResize}
        />
      )}

      {/* Header: tabs + action buttons + collapse chevron */}
      <div className="flex h-10 shrink-0 items-center gap-1 border-b border-stone-200 px-3 dark:border-stone-800">
        {/* Tabs */}
        <div className="flex gap-1" role="tablist" aria-label="Output panels">
          {drawerTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                onTabChange(tab);
                if (collapsed) {
                  onCollapsedChange(false);
                  localStorage.setItem(DRAWER_COLLAPSED_KEY, "false");
                }
              }}
              role="tab"
              aria-selected={activeTab === tab}
              tabIndex={activeTab === tab ? 0 : -1}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                activeTab === tab && !collapsed
                  ? "bg-stone-100 text-stone-900 dark:bg-stone-800 dark:text-stone-100"
                  : "text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Collapse toggle */}
        <button
          onClick={toggleCollapsed}
          className="ml-1 rounded-md p-1 text-stone-400 transition-colors hover:text-stone-600 dark:hover:text-stone-200"
          aria-label={collapsed ? "Expand output panel" : "Collapse output panel"}
        >
          <svg
            className={`h-4 w-4 transition-transform ${collapsed ? "rotate-180" : ""}`}
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

      {/* Tab content — scrollable */}
      {!collapsed && (
        <div
          className="overflow-y-auto p-3"
          style={{ height: `calc(100% - 40px)` }}
          role="tabpanel"
          aria-label={activeTab}
        >
          {tabContent[activeTab]}
        </div>
      )}
    </div>
  );
}
