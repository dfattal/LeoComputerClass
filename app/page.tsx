import Link from "next/link";
import Image from "next/image";
import { classes } from "@/content/classes";

function ClassCard({ cls }: { cls: (typeof classes)[number] }) {
  const isComingSoon = cls.comingSoon;

  const accentBorder: Record<string, string> = {
    indigo: "hover:border-indigo-400 dark:hover:border-indigo-500",
    violet: "hover:border-violet-400 dark:hover:border-violet-500",
    emerald: "hover:border-emerald-400 dark:hover:border-emerald-500",
  };
  const accentBadge: Record<string, string> = {
    indigo:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300",
    violet:
      "bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300",
    emerald:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  };
  const accentLink: Record<string, string> = {
    indigo: "text-indigo-600 dark:text-indigo-400",
    violet: "text-violet-600 dark:text-violet-400",
    emerald: "text-emerald-600 dark:text-emerald-400",
  };

  const cardClassName = `group relative flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-all dark:border-stone-800 dark:bg-stone-900 ${
    isComingSoon
      ? "opacity-75"
      : `cursor-pointer ${accentBorder[cls.accentColor] ?? ""} hover:shadow-md`
  }`;

  const cardContent = (
    <>
      {/* Hero image */}
      <div className="relative h-44 w-full overflow-hidden">
        <Image
          src={cls.heroImage}
          alt={cls.name}
          fill
          className="object-cover object-center transition-transform group-hover:scale-105"
        />
        {isComingSoon && (
          <div className="absolute inset-0 flex items-center justify-center bg-stone-950/50">
            <span className={`rounded-full px-4 py-1.5 text-sm font-semibold text-white shadow-lg ${
              cls.accentColor === "violet" ? "bg-violet-600" : cls.accentColor === "emerald" ? "bg-emerald-600" : "bg-indigo-600"
            }`}>
              Coming Soon
            </span>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center gap-2">
          <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
            {cls.name}
          </h2>
          <span
            className={`rounded-md px-2 py-0.5 text-[11px] font-bold uppercase ${accentBadge[cls.accentColor] ?? accentBadge.indigo}`}
          >
            {cls.language}
          </span>
        </div>
        <p className="mb-4 text-sm leading-relaxed text-stone-500 dark:text-stone-400">
          {cls.description}
        </p>
        {!isComingSoon && (
          <span
            className={`mt-auto inline-flex items-center gap-1 text-sm font-medium ${
              accentLink[cls.accentColor] ?? accentLink.indigo
            }`}
          >
            Start Learning
            <svg
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </span>
        )}
      </div>
    </>
  );

  if (isComingSoon) {
    return <div className={cardClassName}>{cardContent}</div>;
  }

  return (
    <Link href={`/classes/${cls.slug}`} className={`${cardClassName} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-stone-400`}>
      {cardContent}
    </Link>
  );
}

export default function Home() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center bg-stone-50 px-4 py-16 dark:bg-stone-950">
      <h1 className="mb-3 text-4xl font-bold tracking-tight text-stone-900 dark:text-stone-100 sm:text-5xl">
        Family Classroom
      </h1>
      <p className="mb-12 text-center text-lg text-stone-500 dark:text-stone-400">
        Pick your class and start learning
      </p>

      <div className="grid w-full max-w-4xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {classes.map((cls) => (
          <ClassCard key={cls.slug} cls={cls} />
        ))}
      </div>
    </div>
  );
}
