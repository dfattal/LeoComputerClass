"use client";

export default function RunPanel({
  stdout,
  stderr,
}: {
  stdout: string;
  stderr: string;
}) {
  if (!stdout && !stderr) {
    return (
      <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 text-sm text-stone-400 dark:border-stone-800 dark:bg-stone-900">
        Output will appear here after you run your code.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {stdout && (
        <div>
          <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-stone-500">
            Output
          </h4>
          <pre className="rounded-lg bg-stone-900 p-3 text-sm text-green-400 whitespace-pre-wrap">
            {stdout}
          </pre>
        </div>
      )}
      {stderr && (
        <div>
          <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-red-500">
            Errors
          </h4>
          <pre className="rounded-lg bg-stone-900 p-3 text-sm text-red-400 whitespace-pre-wrap">
            {stderr}
          </pre>
        </div>
      )}
    </div>
  );
}
