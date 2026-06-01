"use client";

import { createContext, useContext, type ReactNode } from "react";
import { accents, getAccent, type Accent } from "@/lib/accents";

// Accent class strings live in lib/accents.ts (single source of truth). This
// context just hands the active class's accent down to client components.
export type AccentClasses = Accent;

const AccentContext = createContext<AccentClasses>(accents.indigo);

export function AccentProvider({
  color,
  children,
}: {
  color: string;
  children: ReactNode;
}) {
  return (
    <AccentContext.Provider value={getAccent(color)}>
      {children}
    </AccentContext.Provider>
  );
}

export function useAccent(): AccentClasses {
  return useContext(AccentContext);
}
