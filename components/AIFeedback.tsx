"use client";

interface Feedback {
  verdict?: string;
  correctness?: string;
  concepts?: string;
  improvements?: string[];
  challenge_question?: string;
  common_pitfalls_to_watch?: string[];
}

export default function AIFeedback({
  feedback,
}: {
  feedback: Record<string, unknown>;
}) {
  const f = feedback as Feedback;

  const verdictColor =
    f.verdict === "pass"
      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      : f.verdict === "partial"
        ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";

  return (
    <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="mb-3 flex items-center gap-2">
        <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          AI Review
        </h4>
        {f.verdict && (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${verdictColor}`}
          >
            {f.verdict}
          </span>
        )}
      </div>

      {f.correctness && (
        <div className="mb-3">
          <h5 className="text-xs font-semibold uppercase text-zinc-500">
            Correctness
          </h5>
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            {f.correctness}
          </p>
        </div>
      )}

      {f.concepts && (
        <div className="mb-3">
          <h5 className="text-xs font-semibold uppercase text-zinc-500">
            Concepts
          </h5>
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            {f.concepts}
          </p>
        </div>
      )}

      {f.improvements && f.improvements.length > 0 && (
        <div className="mb-3">
          <h5 className="text-xs font-semibold uppercase text-zinc-500">
            Improvements
          </h5>
          <ul className="ml-4 list-disc space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
            {f.improvements.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {f.challenge_question && (
        <div className="mb-3">
          <h5 className="text-xs font-semibold uppercase text-zinc-500">
            Challenge Question
          </h5>
          <p className="text-sm italic text-zinc-700 dark:text-zinc-300">
            {f.challenge_question}
          </p>
        </div>
      )}

      {f.common_pitfalls_to_watch && f.common_pitfalls_to_watch.length > 0 && (
        <div>
          <h5 className="text-xs font-semibold uppercase text-zinc-500">
            Watch Out For
          </h5>
          <ul className="ml-4 list-disc space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
            {f.common_pitfalls_to_watch.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
