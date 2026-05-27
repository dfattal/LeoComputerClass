import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getClassBySlug, getClassSlugs } from "@/content/classes";

export function generateStaticParams() {
  return getClassSlugs().map((classSlug) => ({ classSlug }));
}

export default async function ClassHomePage({
  params,
}: {
  params: Promise<{ classSlug: string }>;
}) {
  const { classSlug } = await params;
  const classDef = getClassBySlug(classSlug);
  if (!classDef) notFound();

  if (classDef.comingSoon) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-4 text-center">
        <h1 className="mb-4 text-3xl font-bold text-stone-900 dark:text-stone-100">
          {classDef.name}
        </h1>
        <p className="mb-6 text-lg text-stone-500">{classDef.description}</p>
        <span className={`rounded-full px-4 py-2 text-sm font-semibold ${
          { indigo: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300",
            violet: "bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300",
            emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
          }[classDef.accentColor] ?? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300"
        }`}>
          Coming Soon
        </span>
        <Link
          href="/"
          className="mt-8 text-sm text-stone-400 underline hover:text-stone-600"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  // Load class-specific syllabus
  const syllabus = await import(
    `@/content/classes/${classSlug}/syllabus`
  );
  const { phases, weeks } = syllabus;

  const getWeeksForPhase = (phaseNum: number) =>
    weeks.filter((w: { phase: number }) => w.phase === phaseNum);

  // Find the first published week to link to
  const firstPublished = weeks.find(
    (w: { status: string }) => w.status === "published"
  );

  // Accent color mapping (tuned for the light text area below the banner)
  const accentClasses: Record<string, { bg: string; text: string }> = {
    indigo: { bg: "bg-indigo-500", text: "text-indigo-600 dark:text-indigo-400" },
    violet: { bg: "bg-violet-500", text: "text-violet-600 dark:text-violet-400" },
    emerald: { bg: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" },
    amber: { bg: "bg-amber-500", text: "text-amber-600 dark:text-amber-400" },
  };
  const accent = accentClasses[classDef.accentColor] ?? accentClasses.indigo;

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] w-full flex-col">
      {/* Hero banner — full illustration, never cropped tight */}
      <div className="relative w-full shrink-0 overflow-hidden h-52 sm:h-72 lg:h-[400px]">
        <Image
          src={classDef.heroImage}
          alt=""
          fill
          priority
          className="object-cover object-center"
        />
        {/* Dissolve the bottom of the art into the page so there's no hard edge */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5"
          style={{
            background:
              "linear-gradient(to bottom, transparent, var(--background))",
          }}
        />
      </div>

      {/* Intro — overlaps the faded edge to tie the art and text together */}
      <section className="relative z-10 -mt-10 px-4 pb-12 text-center sm:-mt-14">
        <p
          className={`mb-3 text-xs font-semibold uppercase tracking-[0.2em] sm:text-sm ${accent.text}`}
        >
          A course for curious kids
        </p>
        <h1 className="mx-auto max-w-2xl text-4xl font-bold leading-[1.1] tracking-tight text-stone-900 dark:text-stone-100 sm:text-5xl">
          {classDef.tagline.includes(" ") ? (
            <>
              {classDef.tagline.split(" ").slice(0, -2).join(" ")}
              <br />
              <span className={accent.text}>
                {classDef.tagline.split(" ").slice(-2).join(" ")}
              </span>
            </>
          ) : (
            classDef.tagline
          )}
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-stone-600 dark:text-stone-400 sm:text-lg">
          {classDef.description}
        </p>
        <div className="mt-8 flex justify-center gap-3">
          {firstPublished && (
            <Link
              href={`/classes/${classSlug}/${firstPublished.slug}`}
              className={`rounded-lg ${accent.bg} px-6 py-3 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90`}
            >
              Start Learning
            </Link>
          )}
          <Link
            href="/dashboard"
            className="rounded-lg border border-stone-300 bg-white px-6 py-3 text-sm font-semibold text-stone-700 shadow-sm transition-colors hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800"
          >
            My Progress
          </Link>
        </div>
      </section>

      {/* Lessons */}
      <section className="flex-1 border-t border-stone-200 bg-stone-50 px-4 py-16 dark:border-stone-800 dark:bg-stone-900/50">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-center text-sm font-semibold uppercase tracking-widest text-stone-400">
            Lessons
          </h2>
          <div className="space-y-6">
            {phases.map(
              (phase: { phase: number; name: string; weeks: number[] }) => {
                const phaseWeeks = getWeeksForPhase(phase.phase);
                return (
                  <div key={phase.phase}>
                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-400">
                      {phase.name}
                    </h3>
                    <div className="space-y-2">
                      {phaseWeeks.map(
                        (w: {
                          slug: string;
                          status: string;
                          week: number;
                          title: string;
                          summary: string;
                        }) => {
                          const isPublished = w.status === "published";
                          if (isPublished) {
                            return (
                              <Link
                                key={w.slug}
                                href={`/classes/${classSlug}/${w.slug}`}
                                className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-4 transition-all hover:border-stone-300 hover:shadow-md dark:border-stone-800 dark:bg-stone-900 dark:hover:border-stone-700"
                              >
                                <span
                                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${accent.bg} text-sm font-bold text-white`}
                                >
                                  {w.week}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <p className="font-semibold text-stone-900 dark:text-stone-100">
                                    {w.title}
                                  </p>
                                  <p className="text-sm text-stone-500 dark:text-stone-400">
                                    {w.summary}
                                  </p>
                                </div>
                                <svg
                                  className="h-5 w-5 shrink-0 text-stone-300 dark:text-stone-600"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={2}
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                                  />
                                </svg>
                              </Link>
                            );
                          }
                          return (
                            <div
                              key={w.slug}
                              className="flex items-center gap-3 rounded-xl border border-stone-100 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-900/50"
                            >
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-stone-200 text-sm font-bold text-stone-400 dark:bg-stone-800 dark:text-stone-500">
                                {w.week}
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-stone-400 dark:text-stone-500">
                                  {w.title}
                                </p>
                                <p className="text-sm text-stone-400 dark:text-stone-600">
                                  Coming soon
                                </p>
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
