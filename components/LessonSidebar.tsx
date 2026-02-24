import Link from "next/link";
import { getWeekSlugs } from "@/lib/lessons/loadLesson";

function weekLabel(slug: string): string {
  const num = slug.replace("week-", "");
  return `Week ${parseInt(num, 10)}`;
}

export default function LessonSidebar({
  currentWeek,
}: {
  currentWeek: string;
}) {
  const weeks = getWeekSlugs();

  return (
    <aside className="w-48 shrink-0">
      <nav className="sticky top-20 space-y-1">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Weeks
        </h2>
        {weeks.map((slug) => (
          <Link
            key={slug}
            href={`/course/${slug}`}
            className={`block rounded-md px-3 py-2 text-sm transition-colors ${
              slug === currentWeek
                ? "bg-zinc-900 font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            }`}
          >
            {weekLabel(slug)}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
