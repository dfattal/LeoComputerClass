import Link from "next/link";
import Image from "next/image";
import { phases, getWeeksForPhase } from "@/content/syllabus";

function phaseStatus(phaseNum: number): "Complete" | "In Progress" | "Coming Soon" {
  const phaseWeeks = getWeeksForPhase(phaseNum);
  const publishedCount = phaseWeeks.filter((w) => w.status === "published").length;
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

export default function Home() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col">
      {/* Hero with ENIAC background */}
      <section className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-4 py-24 text-center">
        {/* Background image */}
        <Image
          src="/hero-eniac.webp"
          alt=""
          fill
          priority
          className="object-cover object-center"
        />
        {/* Dark overlay with indigo tint */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/80 via-stone-950/75 to-stone-950/90" />

        {/* Content */}
        <div className="relative z-10">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-indigo-300">
            A course for curious kids
          </p>
          <h1 className="mb-6 max-w-2xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
            Build a Computer
            <br />
            <span className="text-indigo-400">From Physics</span>
          </h1>
          <p className="mx-auto mb-10 max-w-lg text-lg leading-relaxed text-stone-300">
            Start with a light switch. End with a working CPU.
            Write Python code that does what real circuits do —
            no kits, no magic, just logic.
          </p>
          <div className="flex justify-center gap-3">
            <Link
              href="/course/week-01"
              className="rounded-lg bg-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-colors hover:bg-indigo-400"
            >
              Start Learning
            </Link>
            <Link
              href="/dashboard"
              className="rounded-lg border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              My Progress
            </Link>
          </div>

          {/* Photo caption */}
          <p className="mt-12 text-xs text-stone-500">
            ENIAC (1945) — one of the first general-purpose computers. It filled an entire room.
          </p>
        </div>
      </section>

      {/* Roadmap */}
      <section className="border-t border-stone-200 bg-stone-50 px-4 py-16 dark:border-stone-800 dark:bg-stone-900/50">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-center text-sm font-semibold uppercase tracking-widest text-stone-400">
            What you&apos;ll build
          </h2>
          <div className="space-y-4">
            {phases.map((phase) => {
              const phaseWeeks = getWeeksForPhase(phase.phase);
              const status = phaseStatus(phase.phase);
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
                      <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                        Weeks {phase.weeks[0]}–{phase.weeks[phase.weeks.length - 1]}
                      </span>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[status]}`}
                    >
                      {status}
                    </span>
                  </div>
                  <ul className="space-y-1.5">
                    {phaseWeeks.map((w) => (
                      <li key={w.slug} className="flex items-center gap-2 text-sm">
                        <span
                          className={`h-2 w-2 shrink-0 rounded-full ${
                            w.status === "published"
                              ? "bg-indigo-500"
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
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
