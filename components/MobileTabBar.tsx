"use client";

import { useRef, useCallback } from "react";
import { useAccent } from "./AccentContext";

const tabs = ["Learn", "Code"] as const;
export type MobileView = (typeof tabs)[number];

const tabId = (tab: MobileView) => `mobile-tab-${tab.toLowerCase()}`;
const panelId = (tab: MobileView) => `mobile-panel-${tab.toLowerCase()}`;

export default function MobileTabBar({
  active,
  onChange,
}: {
  active: MobileView;
  onChange: (view: MobileView) => void;
}) {
  const accent = useAccent();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const idx = tabs.indexOf(active);
      let newIdx = idx;
      if (e.key === "ArrowLeft") {
        newIdx = idx > 0 ? idx - 1 : tabs.length - 1;
      } else if (e.key === "ArrowRight") {
        newIdx = idx < tabs.length - 1 ? idx + 1 : 0;
      } else {
        return;
      }
      e.preventDefault();
      onChange(tabs[newIdx]);
      tabRefs.current[newIdx]?.focus();
    },
    [active, onChange]
  );

  return (
    <div className="shrink-0 border-b border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-950 lg:hidden">
      <div
        className="flex gap-1 px-12"
        role="tablist"
        aria-label="View switcher"
        onKeyDown={handleKeyDown}
      >
        {tabs.map((tab, i) => (
          <button
            key={tab}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            onClick={() => onChange(tab)}
            role="tab"
            id={tabId(tab)}
            aria-selected={active === tab}
            aria-controls={panelId(tab)}
            tabIndex={active === tab ? 0 : -1}
            className={`relative flex-1 py-2.5 text-center text-sm font-medium transition-colors ${
              active === tab
                ? accent.text
                : "text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
            }`}
          >
            {tab}
            {active === tab && (
              <span className={`absolute inset-x-0 -bottom-px h-0.5 ${accent.underline}`} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export { tabId, panelId };
