import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getClassBySlug, getClassSlugs } from "@/content/classes";

export function generateStaticParams() {
  return getClassSlugs().map((classSlug) => ({ classSlug }));
}

function phaseStatus(
  phaseWeeks: { status: string }[]
): "Complete" | "In Progress" | "Coming Soon" {
  const publishedCount = phaseWeeks.filter(
    (w) => w.status === "published"
  ).length;
  if (publishedCount === phaseWeeks.length) return "Complete";
  if (publishedCount > 0) return "In Progress";
  return "Coming Soon";
}

const statusStyles = {
  Complete:
    "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  "In Progress":
    "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  "Coming Soon":
    "bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400",
} as const;

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
        <span className="rounded-full bg-violet-100 px-4 py-2 text-sm font-semibold text-violet-700 dark:bg-violet-900 dark:text-violet-300">
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

  // Accent color mapping
  const accentClasses: Record<string, { bg: string; text: string; overlay: string; badge: string }> = {
    indigo: {
      bg: "bg-indigo-500",
      text: "text-indigo-400",
      overlay: "from-indigo-950/80 via-stone-950/75 to-stone-950/90",
      badge: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300",
    },
    violet: {
      bg: "bg-violet-500",
      text: "text-violet-400",
      overlay: "from-violet-950/80 via-stone-950/75 to-stone-950/90",
      badge: "bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300",
    },
  };
  const accent = accentClasses[classDef.accentColor] ?? accentClasses.indigo;

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col">
      {/* Hero */}
      <section className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-4 py-24 text-center">
        <Image
          src={classDef.heroImage}
          alt=""
          fill
          priority
          className="object-cover object-center"
        />
        <div
          className={`absolute inset-0 bg-gradient-to-b ${accent.overlay}`}
        />

        <div className="relative z-10">
          <p className={`mb-4 text-sm font-medium uppercase tracking-widest ${accent.text.replace("text-", "text-").replace("-400", "-300")}`}>
            A course for curious kids
          </p>
          <h1 className="mb-6 max-w-2xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
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
          <p className="mx-auto mb-10 max-w-lg text-lg leading-relaxed text-stone-300">
            {classDef.description}
          </p>
          <div className="flex justify-center gap-3">
            {firstPublished && (
              <Link
                href={`/classes/${classSlug}/${firstPublished.slug}`}
                className={`rounded-lg ${accent.bg} px-6 py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:opacity-90`}
              >
                Start Learning
              </Link>
            )}
            <Link
              href="/dashboard"
              className="rounded-lg border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              My Progress
            </Link>
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="border-t border-stone-200 bg-stone-50 px-4 py-16 dark:border-stone-800 dark:bg-stone-900/50">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-center text-sm font-semibold uppercase tracking-widest text-stone-400">
            What you&apos;ll build
          </h2>
          <div className="space-y-4">
            {phases.map(
              (phase: { phase: number; name: string; weeks: number[] }) => {
                const phaseWeeks = getWeeksForPhase(phase.phase);
                const status = phaseStatus(phaseWeeks);
                return (
                  <div
                    key={phase.phase}
                    className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-stone-900 dark:text-stone-100">
                          {phase.name}
                        </h3>
                        <span
                          className={`rounded-md px-2 py-0.5 text-xs font-bold ${accent.badge}`}
                        >
                          Weeks {phase.weeks[0]}–
                          {phase.weeks[phase.weeks.length - 1]}
                        </span>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[status]}`}
                      >
                        {status}
                      </span>
                    </div>
                    <ul className="space-y-1.5">
                      {phaseWeeks.map(
                        (w: {
                          slug: string;
                          status: string;
                          week: number;
                          summary: string;
                        }) => (
                          <li
                            key={w.slug}
                            className="flex items-center gap-2 text-sm"
                          >
                            <span
                              className={`h-2 w-2 shrink-0 rounded-full ${
                                w.status === "published"
                                  ? accent.bg
                                  : "bg-stone-300 dark:bg-stone-600"
                              }`}
                            />
                            <span
                              className={
                                w.status === "published"
                                  ? "text-stone-700 dark:text-stone-300"
                                  : "text-stone-400 dark:text-stone-500"
                              }
                            >
                              Week {w.week}: {w.summary}
                            </span>
                          </li>
                        )
                      )}
                    </ul>
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
