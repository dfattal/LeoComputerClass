import Link from "next/link";
import { getWeekSlugs } from "@/lib/lessons/loadLesson";

function weekNum(slug: string): number {
  return parseInt(slug.replace("week-", ""), 10);
}

export default function LessonSidebar({
  currentWeek,
}: {
  currentWeek: string;
}) {
  const weeks = getWeekSlugs();

  return (
    <aside className="w-48 shrink-0">
      <nav className="sticky top-20 space-y-1.5">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-400">
          Weeks
        </h2>
        {weeks.map((slug) => {
          const num = weekNum(slug);
          const isActive = slug === currentWeek;
          return (
            <Link
              key={slug}
              href={`/course/${slug}`}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-all ${
                isActive
                  ? "bg-indigo-600 font-medium text-white shadow-sm shadow-indigo-600/25"
                  : "text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400"
                }`}
              >
                {num}
              </span>
              Week {num}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
