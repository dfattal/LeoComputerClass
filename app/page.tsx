import Link from "next/link";
import Image from "next/image";

const milestones = [
  { week: "1–2", title: "Logic Gates", desc: "AND, OR, NOT, XOR — the building blocks" },
  { week: "3–4", title: "Arithmetic", desc: "Adders and subtractors from gates" },
  { week: "5–6", title: "Memory", desc: "Flip-flops, registers, and RAM" },
  { week: "7–8", title: "CPU", desc: "Assemble a working processor" },
];

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
          <div className="grid gap-4 sm:grid-cols-2">
            {milestones.map((m) => (
              <div
                key={m.week}
                className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900"
              >
                <span className="mb-2 inline-block rounded-md bg-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                  Weeks {m.week}
                </span>
                <h3 className="mb-1 font-semibold text-stone-900 dark:text-stone-100">
                  {m.title}
                </h3>
                <p className="text-sm text-stone-500">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
