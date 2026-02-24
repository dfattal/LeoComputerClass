import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getWeekSlugs } from "@/lib/lessons/loadLesson";

export default async function DashboardPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const weeks = getWeekSlugs();

  // If Supabase not configured, show basic dashboard
  if (!supabaseUrl || supabaseUrl === "your-supabase-url") {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
        <p className="mb-6 text-zinc-500">
          Connect Supabase to track your progress. For now, explore the lessons:
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {weeks.map((slug) => {
            const num = parseInt(slug.replace("week-", ""), 10);
            return (
              <Link
                key={slug}
                href={`/course/${slug}`}
                className="rounded-lg border border-zinc-200 p-4 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
              >
                <h2 className="font-semibold">Week {num}</h2>
                <p className="text-sm text-zinc-500">Start lesson</p>
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="mb-4 text-2xl font-bold">Dashboard</h1>
        <p className="text-zinc-500">
          <Link href="/login" className="text-blue-600 hover:underline">
            Sign in
          </Link>{" "}
          to track your progress.
        </p>
      </div>
    );
  }

  // Fetch lessons and progress
  const { data: lessons } = await supabase
    .from("lessons")
    .select("*")
    .order("week_number");

  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("*")
    .eq("user_id", user.id);

  const { data: submissions } = await supabase
    .from("submissions")
    .select("lesson_id, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const progressMap = new Map(
    (progress || []).map((p) => [p.lesson_id, p])
  );
  const latestSubmission = new Map<string, string>();
  for (const sub of submissions || []) {
    if (!latestSubmission.has(sub.lesson_id)) {
      latestSubmission.set(sub.lesson_id, sub.created_at);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold">Your Progress</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {(lessons || []).map((lesson) => {
          const prog = progressMap.get(lesson.id);
          const lastSub = latestSubmission.get(lesson.id);

          return (
            <Link
              key={lesson.id}
              href={`/course/${lesson.slug}`}
              className="rounded-lg border border-zinc-200 p-4 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">{lesson.title}</h2>
                {prog?.is_complete && (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                    Complete
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-zinc-500">
                Week {lesson.week_number}
              </p>
              {lastSub && (
                <p className="mt-1 text-xs text-zinc-400">
                  Last submitted:{" "}
                  {new Date(lastSub).toLocaleDateString()}
                </p>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
