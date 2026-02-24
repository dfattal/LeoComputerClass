"use client";

import { useState } from "react";
import AIFeedback from "./AIFeedback";

interface Submission {
  id: string;
  code: string;
  stdout: string;
  stderr: string;
  test_results: Array<{ passed: boolean; name: string; error?: string }>;
  ai_feedback: Record<string, unknown> | null;
  instructor_feedback: string | null;
  status: string;
  created_at: string;
  lessons: { slug: string; title: string };
  profiles: { display_name: string | null };
}

export default function AdminSubmissions({
  submissions,
}: {
  submissions: Submission[];
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  async function saveFeedback(submissionId: string) {
    setSaving(submissionId);
    try {
      await fetch("/api/submit", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId,
          instructorFeedback: feedback[submissionId],
        }),
      });
    } finally {
      setSaving(null);
    }
  }

  if (submissions.length === 0) {
    return (
      <p className="text-zinc-500">No submissions yet.</p>
    );
  }

  return (
    <div className="space-y-2">
      {submissions.map((sub) => (
        <div
          key={sub.id}
          className="rounded-lg border border-zinc-200 dark:border-zinc-800"
        >
          <button
            onClick={() =>
              setExpanded(expanded === sub.id ? null : sub.id)
            }
            className="flex w-full items-center justify-between p-4 text-left"
          >
            <div className="flex items-center gap-3">
              <span className="font-medium">
                {sub.profiles?.display_name || "Student"}
              </span>
              <span className="text-sm text-zinc-500">
                {sub.lessons?.title}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  sub.status === "reviewed"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                }`}
              >
                {sub.status}
              </span>
            </div>
            <span className="text-xs text-zinc-400">
              {new Date(sub.created_at).toLocaleDateString()}
            </span>
          </button>

          {expanded === sub.id && (
            <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
              <div className="space-y-4">
                {/* Code */}
                <div>
                  <h4 className="mb-1 text-xs font-semibold uppercase text-zinc-500">
                    Code
                  </h4>
                  <pre className="max-h-60 overflow-auto rounded-lg bg-zinc-900 p-3 text-sm text-zinc-100">
                    {sub.code}
                  </pre>
                </div>

                {/* Test Results */}
                {sub.test_results && sub.test_results.length > 0 && (
                  <div>
                    <h4 className="mb-1 text-xs font-semibold uppercase text-zinc-500">
                      Tests
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {sub.test_results.map((t, i) => (
                        <span
                          key={i}
                          className={`rounded px-2 py-0.5 text-xs ${
                            t.passed
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          }`}
                          title={t.error || undefined}
                        >
                          {t.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Feedback */}
                {sub.ai_feedback && <AIFeedback feedback={sub.ai_feedback} />}

                {/* Instructor Feedback */}
                <div>
                  <h4 className="mb-1 text-xs font-semibold uppercase text-zinc-500">
                    Instructor Feedback
                  </h4>
                  <textarea
                    className="w-full rounded-md border border-zinc-300 p-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                    rows={3}
                    value={
                      feedback[sub.id] ?? sub.instructor_feedback ?? ""
                    }
                    onChange={(e) =>
                      setFeedback((prev) => ({
                        ...prev,
                        [sub.id]: e.target.value,
                      }))
                    }
                    placeholder="Write feedback for the student..."
                  />
                  <button
                    onClick={() => saveFeedback(sub.id)}
                    disabled={saving === sub.id}
                    className="mt-2 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500 disabled:opacity-50"
                  >
                    {saving === sub.id ? "Saving..." : "Save Feedback"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
