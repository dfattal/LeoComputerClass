// Single source of truth for accent-color class strings.
//
// Every class in content/classes.ts picks an `accentColor` (e.g. "rose"). The
// platform paints that color in many places — buttons, tabs, the sidebar, class
// cards, landing banners, feedback boxes. Those Tailwind class strings used to be
// copy-pasted across three files (AccentContext, app/page, classes/[classSlug]),
// which drifted: leo-space's "sky" silently fell back to indigo for a while
// because one file was never updated.
//
// Now there is ONE record per color holding every field any consumer needs.
// IMPORTANT: write every class string as a plain literal here. Tailwind v4 scans
// source files for literal class names — interpolating colors (e.g. `bg-${c}-600`)
// would make Tailwind purge them and the colors would silently disappear.
//
// To add a new color: copy a block, swap the color name on every line, and the
// scaffolder (scripts/scaffold-class.mjs) will remind you to do so.

export interface Accent {
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
  /** Class-card hover border (home page) */
  cardBorder: string;
  /** Small uppercase pill badge (language tag, "coming soon" pill) */
  badge: string;
  /** Solid filled pill background, e.g. the "Coming Soon" overlay dot */
  solid: string;
  /** Lighter solid used for the landing-page banner accents (number badges, CTA) */
  banner: string;
}

export const accents: Record<string, Accent> = {
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
    cardBorder: "hover:border-indigo-400 dark:hover:border-indigo-500",
    badge: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300",
    solid: "bg-indigo-600",
    banner: "bg-indigo-500",
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
    cardBorder: "hover:border-violet-400 dark:hover:border-violet-500",
    badge: "bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300",
    solid: "bg-violet-600",
    banner: "bg-violet-500",
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
    cardBorder: "hover:border-emerald-400 dark:hover:border-emerald-500",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
    solid: "bg-emerald-600",
    banner: "bg-emerald-500",
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
    cardBorder: "hover:border-amber-400 dark:hover:border-amber-500",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
    solid: "bg-amber-600",
    banner: "bg-amber-500",
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
    cardBorder: "hover:border-sky-400 dark:hover:border-sky-500",
    badge: "bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300",
    solid: "bg-sky-600",
    banner: "bg-sky-500",
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
    cardBorder: "hover:border-rose-400 dark:hover:border-rose-500",
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300",
    solid: "bg-rose-600",
    banner: "bg-rose-500",
  },
  lime: {
    bg: "bg-lime-600",
    bgHover: "hover:bg-lime-700",
    text: "text-lime-600 dark:text-lime-400",
    underline: "bg-lime-600 dark:bg-lime-400",
    ring: "focus-visible:ring-lime-500",
    handleHover: "group-hover:bg-lime-400 dark:group-hover:bg-lime-500",
    sidebar: "bg-lime-600 font-medium text-white shadow-sm shadow-lime-600/25",
    feedback: {
      border: "border-lime-200 dark:border-lime-800",
      bg: "bg-lime-50 dark:bg-lime-950/40",
      title: "text-lime-800 dark:text-lime-200",
      body: "text-lime-900 dark:text-lime-100",
    },
    cardBorder: "hover:border-lime-400 dark:hover:border-lime-500",
    badge: "bg-lime-100 text-lime-700 dark:bg-lime-900 dark:text-lime-300",
    solid: "bg-lime-600",
    banner: "bg-lime-500",
  },
  teal: {
    bg: "bg-teal-600",
    bgHover: "hover:bg-teal-700",
    text: "text-teal-600 dark:text-teal-400",
    underline: "bg-teal-600 dark:bg-teal-400",
    ring: "focus-visible:ring-teal-500",
    handleHover: "group-hover:bg-teal-400 dark:group-hover:bg-teal-500",
    sidebar: "bg-teal-600 font-medium text-white shadow-sm shadow-teal-600/25",
    feedback: {
      border: "border-teal-200 dark:border-teal-800",
      bg: "bg-teal-50 dark:bg-teal-950/40",
      title: "text-teal-800 dark:text-teal-200",
      body: "text-teal-900 dark:text-teal-100",
    },
    cardBorder: "hover:border-teal-400 dark:hover:border-teal-500",
    badge: "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300",
    solid: "bg-teal-600",
    banner: "bg-teal-500",
  },
  fuchsia: {
    bg: "bg-fuchsia-600",
    bgHover: "hover:bg-fuchsia-700",
    text: "text-fuchsia-600 dark:text-fuchsia-400",
    underline: "bg-fuchsia-600 dark:bg-fuchsia-400",
    ring: "focus-visible:ring-fuchsia-500",
    handleHover: "group-hover:bg-fuchsia-400 dark:group-hover:bg-fuchsia-500",
    sidebar: "bg-fuchsia-600 font-medium text-white shadow-sm shadow-fuchsia-600/25",
    feedback: {
      border: "border-fuchsia-200 dark:border-fuchsia-800",
      bg: "bg-fuchsia-50 dark:bg-fuchsia-950/40",
      title: "text-fuchsia-800 dark:text-fuchsia-200",
      body: "text-fuchsia-900 dark:text-fuchsia-100",
    },
    cardBorder: "hover:border-fuchsia-400 dark:hover:border-fuchsia-500",
    badge: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900 dark:text-fuchsia-300",
    solid: "bg-fuchsia-600",
    banner: "bg-fuchsia-500",
  },
  orange: {
    bg: "bg-orange-600",
    bgHover: "hover:bg-orange-700",
    text: "text-orange-600 dark:text-orange-400",
    underline: "bg-orange-600 dark:bg-orange-400",
    ring: "focus-visible:ring-orange-500",
    handleHover: "group-hover:bg-orange-400 dark:group-hover:bg-orange-500",
    sidebar: "bg-orange-600 font-medium text-white shadow-sm shadow-orange-600/25",
    feedback: {
      border: "border-orange-200 dark:border-orange-800",
      bg: "bg-orange-50 dark:bg-orange-950/40",
      title: "text-orange-800 dark:text-orange-200",
      body: "text-orange-900 dark:text-orange-100",
    },
    cardBorder: "hover:border-orange-400 dark:hover:border-orange-500",
    badge: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
    solid: "bg-orange-600",
    banner: "bg-orange-500",
  },
};

/** The accent names this platform knows how to paint. */
export const ACCENT_COLORS = Object.keys(accents);

/** Look up an accent by color name, falling back to indigo for unknown colors. */
export function getAccent(color: string): Accent {
  return accents[color] ?? accents.indigo;
}
