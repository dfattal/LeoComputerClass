import Link from "next/link";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getWeekSlugs } from "@/lib/lessons/loadLesson";

export default async function DashboardPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const weeks = getWeekSlugs();

  if (!supabaseUrl || supabaseUrl === "your-supabase-url") {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
        <p className="mb-6 text-stone-500">
          Connect Supabase to track your progress. For now, explore the lessons:
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {weeks.map((slug) => {
            const num = parseInt(slug.replace("week-", ""), 10);
            return (
              <Link
                key={slug}
                href={`/course/${slug}`}
                className="rounded-lg border border-stone-200 p-4 transition-colors hover:bg-stone-50 dark:border-stone-800 dark:hover:bg-stone-900"
              >
                <h2 className="font-semibold">Week {num}</h2>
                <p className="text-sm text-stone-500">Start lesson</p>
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
        <p className="text-stone-500">
          <Link href="/login" className="text-indigo-600 hover:underline">
            Sign in
          </Link>{" "}
          to track your progress.
        </p>
      </div>
    );
  }

  const serviceClient = await createServiceClient();

  // Fetch lessons
  const { data: lessons } = await serviceClient
    .from("lessons")
    .select("*")
    .order("week_number");

  // Fetch progress
  const { data: progress } = await serviceClient
    .from("lesson_progress")
    .select("*")
    .eq("user_id", user.id);

  // Fetch submissions with test results and feedback
  const { data: submissions } = await serviceClient
    .from("submissions")
    .select(
      "lesson_id, status, test_results, ai_feedback, instructor_feedback, created_at"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const progressMap = new Map(
    (progress || []).map((p) => [p.lesson_id, p])
  );

  // Build a map of latest submission per lesson
  const submissionMap = new Map<
    string,
    {
      status: string;
      test_results: Array<{ passed: boolean; name: string }>;
      ai_feedback: Record<string, unknown> | null;
      instructor_feedback: string | null;
      created_at: string;
    }
  >();
  for (const sub of submissions || []) {
    if (!submissionMap.has(sub.lesson_id)) {
      submissionMap.set(sub.lesson_id, sub);
    }
  }

  // Overall stats
  const totalLessons = lessons?.length ?? 0;
  const completedLessons = (progress || []).filter((p) => p.is_complete).length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8">
        <h1 className="mb-2 text-2xl font-bold">Your Progress</h1>
        <div className="flex items-center gap-3">
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all"
              style={{
                width: totalLessons > 0
                  ? `${(completedLessons / totalLessons) * 100}%`
                  : "0%",
              }}
            />
          </div>
          <span className="shrink-0 text-sm font-medium text-stone-600 dark:text-stone-400">
            {completedLessons}/{totalLessons} lessons
          </span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {(lessons || []).map((lesson) => {
          const prog = progressMap.get(lesson.id);
          const sub = submissionMap.get(lesson.id);
          const isComplete = !!prog?.is_complete;

          // Compute test stats
          const tests = sub?.test_results ?? [];
          const passed = tests.filter((t) => t.passed).length;
          const total = tests.length;

          // Determine progress steps
          const hasSubmitted = !!sub;
          const allTestsPass = total > 0 && passed === total;
          const hasAiFeedback = !!sub?.ai_feedback;
          const hasInstructorFeedback = !!sub?.instructor_feedback;

          // Progress steps: 1=submitted, 2=tests pass, 3=reviewed, 4=instructor feedback
          let stepsCompleted = 0;
          if (hasSubmitted) stepsCompleted = 1;
          if (allTestsPass) stepsCompleted = 2;
          if (hasAiFeedback) stepsCompleted = 3;
          if (hasInstructorFeedback) stepsCompleted = 4;
          const totalSteps = 4;

          return (
            <Link
              key={lesson.id}
              href={`/course/${lesson.slug}`}
              className="group rounded-xl border border-stone-200 p-5 transition-all hover:border-indigo-300 hover:shadow-md dark:border-stone-800 dark:hover:border-indigo-700"
            >
              {/* Header */}
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-stone-400">
                    Week {lesson.week_number}
                  </p>
                  <h2 className="mt-0.5 font-semibold text-stone-900 dark:text-stone-100">
                    {lesson.title}
                  </h2>
                </div>
                {isComplete ? (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                ) : hasSubmitted ? (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" />
                      <circle cx="12" cy="12" r="9" strokeWidth={2} />
                    </svg>
                  </span>
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-stone-100 text-stone-400 dark:bg-stone-800">
                    <span className="text-xs font-bold">{lesson.week_number}</span>
                  </span>
                )}
              </div>

              {/* Progress bar */}
              <div className="mb-3 flex gap-1">
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      i < stepsCompleted
                        ? isComplete
                          ? "bg-green-400 dark:bg-green-500"
                          : "bg-indigo-400 dark:bg-indigo-500"
                        : "bg-stone-200 dark:bg-stone-800"
                    }`}
                  />
                ))}
              </div>

              {/* Status details */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {!hasSubmitted && (
                  <span className="text-stone-400">Not started yet</span>
                )}
                {hasSubmitted && total > 0 && (
                  <span
                    className={`rounded-full px-2 py-0.5 font-medium ${
                      allTestsPass
                        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                    }`}
                  >
                    {passed}/{total} tests
                  </span>
                )}
                {hasAiFeedback && (
                  <span className="rounded-full bg-indigo-100 px-2 py-0.5 font-medium text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                    AI reviewed
                  </span>
                )}
                {hasInstructorFeedback && (
                  <span className="rounded-full bg-violet-100 px-2 py-0.5 font-medium text-violet-700 dark:bg-violet-900 dark:text-violet-300">
                    Instructor feedback
                  </span>
                )}
              </div>

              {/* Last submitted date */}
              {sub && (
                <p className="mt-2 text-xs text-stone-400">
                  Submitted {new Date(sub.created_at).toLocaleDateString()}
                </p>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
