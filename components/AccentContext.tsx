"use client";

import { createContext, useContext, type ReactNode } from "react";

export interface AccentClasses {
  /** Primary button background, e.g. "bg-indigo-600" */
  bg: string;
  /** Primary button hover, e.g. "hover:bg-indigo-700" */
  bgHover: string;
  /** Active tab / link text, e.g. "text-indigo-600 dark:text-indigo-400" */
  text: string;
  /** Tab underline bar, e.g. "bg-indigo-600 dark:bg-indigo-400" */
  underline: string;
  /** Focus ring on resize handles, e.g. "focus-visible:ring-indigo-500" */
  ring: string;
  /** Resize handle hover color */
  handleHover: string;
  /** Sidebar active lesson */
  sidebar: string;
  /** Instructor feedback box */
  feedback: {
    border: string;
    bg: string;
    title: string;
    body: string;
  };
}

const accentMap: Record<string, AccentClasses> = {
  indigo: {
    bg: "bg-indigo-600",
    bgHover: "hover:bg-indigo-700",
    text: "text-indigo-600 dark:text-indigo-400",
    underline: "bg-indigo-600 dark:bg-indigo-400",
    ring: "focus-visible:ring-indigo-500",
    handleHover: "group-hover:bg-indigo-400 dark:group-hover:bg-indigo-500",
    sidebar: "bg-indigo-600 font-medium text-white shadow-sm shadow-indigo-600/25",
    feedback: {
      border: "border-indigo-200 dark:border-indigo-800",
      bg: "bg-indigo-50 dark:bg-indigo-950/40",
      title: "text-indigo-800 dark:text-indigo-200",
      body: "text-indigo-900 dark:text-indigo-100",
    },
  },
  violet: {
    bg: "bg-violet-600",
    bgHover: "hover:bg-violet-700",
    text: "text-violet-600 dark:text-violet-400",
    underline: "bg-violet-600 dark:bg-violet-400",
    ring: "focus-visible:ring-violet-500",
    handleHover: "group-hover:bg-violet-400 dark:group-hover:bg-violet-500",
    sidebar: "bg-violet-600 font-medium text-white shadow-sm shadow-violet-600/25",
    feedback: {
      border: "border-violet-200 dark:border-violet-800",
      bg: "bg-violet-50 dark:bg-violet-950/40",
      title: "text-violet-800 dark:text-violet-200",
      body: "text-violet-900 dark:text-violet-100",
    },
  },
  emerald: {
    bg: "bg-emerald-600",
    bgHover: "hover:bg-emerald-700",
    text: "text-emerald-600 dark:text-emerald-400",
    underline: "bg-emerald-600 dark:bg-emerald-400",
    ring: "focus-visible:ring-emerald-500",
    handleHover: "group-hover:bg-emerald-400 dark:group-hover:bg-emerald-500",
    sidebar: "bg-emerald-600 font-medium text-white shadow-sm shadow-emerald-600/25",
    feedback: {
      border: "border-emerald-200 dark:border-emerald-800",
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      title: "text-emerald-800 dark:text-emerald-200",
      body: "text-emerald-900 dark:text-emerald-100",
    },
  },
  amber: {
    bg: "bg-amber-600",
    bgHover: "hover:bg-amber-700",
    text: "text-amber-600 dark:text-amber-400",
    underline: "bg-amber-600 dark:bg-amber-400",
    ring: "focus-visible:ring-amber-500",
    handleHover: "group-hover:bg-amber-400 dark:group-hover:bg-amber-500",
    sidebar: "bg-amber-600 font-medium text-white shadow-sm shadow-amber-600/25",
    feedback: {
      border: "border-amber-200 dark:border-amber-800",
      bg: "bg-amber-50 dark:bg-amber-950/40",
      title: "text-amber-800 dark:text-amber-200",
      body: "text-amber-900 dark:text-amber-100",
    },
  },
  sky: {
    bg: "bg-sky-600",
    bgHover: "hover:bg-sky-700",
    text: "text-sky-600 dark:text-sky-400",
    underline: "bg-sky-600 dark:bg-sky-400",
    ring: "focus-visible:ring-sky-500",
    handleHover: "group-hover:bg-sky-400 dark:group-hover:bg-sky-500",
    sidebar: "bg-sky-600 font-medium text-white shadow-sm shadow-sky-600/25",
    feedback: {
      border: "border-sky-200 dark:border-sky-800",
      bg: "bg-sky-50 dark:bg-sky-950/40",
      title: "text-sky-800 dark:text-sky-200",
      body: "text-sky-900 dark:text-sky-100",
    },
  },
  rose: {
    bg: "bg-rose-600",
    bgHover: "hover:bg-rose-700",
    text: "text-rose-600 dark:text-rose-400",
    underline: "bg-rose-600 dark:bg-rose-400",
    ring: "focus-visible:ring-rose-500",
    handleHover: "group-hover:bg-rose-400 dark:group-hover:bg-rose-500",
    sidebar: "bg-rose-600 font-medium text-white shadow-sm shadow-rose-600/25",
    feedback: {
      border: "border-rose-200 dark:border-rose-800",
      bg: "bg-rose-50 dark:bg-rose-950/40",
      title: "text-rose-800 dark:text-rose-200",
      body: "text-rose-900 dark:text-rose-100",
    },
  },
};

const AccentContext = createContext<AccentClasses>(accentMap.indigo);

export function AccentProvider({
  color,
  children,
}: {
  color: string;
  children: ReactNode;
}) {
  return (
    <AccentContext.Provider value={accentMap[color] ?? accentMap.indigo}>
      {children}
    </AccentContext.Provider>
  );
}

export function useAccent(): AccentClasses {
  return useContext(AccentContext);
}
