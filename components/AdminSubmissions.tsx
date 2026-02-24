"use client";

import { useState } from "react";
import AIFeedback from "./AIFeedback";

interface Submission {
  id: string;
  user_id: string;
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

interface UserInfo {
  name: string;
  email: string;
  avatar?: string;
}

export default function AdminSubmissions({
  submissions,
  userMap,
}: {
  submissions: Submission[];
  userMap: Record<string, UserInfo>;
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
      <p className="text-stone-500">No submissions yet.</p>
    );
  }

  // Group submissions by user_id
  const grouped: Record<string, Submission[]> = {};
  for (const sub of submissions) {
    if (!grouped[sub.user_id]) grouped[sub.user_id] = [];
    grouped[sub.user_id].push(sub);
  }

  // Sort users alphabetically by name
  const sortedUserIds = Object.keys(grouped).sort((a, b) => {
    const nameA = userMap[a]?.name ?? "";
    const nameB = userMap[b]?.name ?? "";
    return nameA.localeCompare(nameB);
  });

  return (
    <div className="space-y-8">
      {sortedUserIds.map((userId) => {
        const user = userMap[userId];
        const userSubs = grouped[userId];
        const totalPassed = userSubs.filter((s) => s.status === "reviewed").length;

        return (
          <section
            key={userId}
            className="overflow-hidden rounded-xl border border-stone-200 dark:border-stone-800"
          >
            {/* Student header */}
            <div className="flex items-center gap-3 border-b border-stone-200 bg-stone-50 px-5 py-4 dark:border-stone-800 dark:bg-stone-900">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="h-9 w-9 rounded-full ring-2 ring-stone-200 dark:ring-stone-700"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300">
                  {(user?.name ?? "?")[0].toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-stone-900 dark:text-stone-100">
                  {user?.name ?? "Unknown Student"}
                </div>
                <div className="text-xs text-stone-500">
                  {user?.email ?? userId}
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-stone-500">
                <span>{userSubs.length} submission{userSubs.length !== 1 ? "s" : ""}</span>
                {totalPassed > 0 && (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
                    {totalPassed} reviewed
                  </span>
                )}
              </div>
            </div>

            {/* Submissions list */}
            <div className="divide-y divide-stone-100 dark:divide-stone-800">
              {userSubs.map((sub) => {
                const tests = sub.test_results ?? [];
                const passed = tests.filter((t) => t.passed).length;
                const isExpanded = expanded === sub.id;

                return (
                  <div key={sub.id}>
                    <button
                      onClick={() =>
                        setExpanded(isExpanded ? null : sub.id)
                      }
                      className="flex w-full items-center gap-4 px-5 py-3 text-left transition-colors hover:bg-stone-50 dark:hover:bg-stone-900/50"
                    >
                      {/* Lesson title */}
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-stone-700 dark:text-stone-300">
                        {sub.lessons?.title ?? "Unknown Lesson"}
                      </span>

                      {/* Test score */}
                      {tests.length > 0 && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            passed === tests.length
                              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                          }`}
                        >
                          {passed}/{tests.length} tests
                        </span>
                      )}

                      {/* Status */}
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          sub.status === "reviewed"
                            ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300"
                            : "bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400"
                        }`}
                      >
                        {sub.status}
                      </span>

                      {/* Date */}
                      <span className="shrink-0 text-xs text-stone-400">
                        {new Date(sub.created_at).toLocaleDateString()}
                      </span>

                      {/* Chevron */}
                      <svg
                        className={`h-4 w-4 shrink-0 text-stone-400 transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-stone-100 bg-stone-50/50 px-5 py-4 dark:border-stone-800 dark:bg-stone-900/30">
                        <div className="space-y-4">
                          {/* Code */}
                          <div>
                            <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-stone-500">
                              Code
                            </h4>
                            <pre className="max-h-60 overflow-auto rounded-lg border border-stone-800 bg-stone-900 p-3 text-sm leading-relaxed text-stone-100">
                              {sub.code}
                            </pre>
                          </div>

                          {/* Test Results */}
                          {tests.length > 0 && (
                            <div>
                              <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-stone-500">
                                Tests
                              </h4>
                              <div className="flex flex-wrap gap-1.5">
                                {tests.map((t, i) => (
                                  <span
                                    key={i}
                                    className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                                      t.passed
                                        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                        : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                                    }`}
                                    title={t.error || undefined}
                                  >
                                    {t.passed ? "\u2713" : "\u2717"} {t.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* AI Feedback */}
                          {sub.ai_feedback && (
                            <AIFeedback feedback={sub.ai_feedback} />
                          )}

                          {/* Instructor Feedback */}
                          <div>
                            <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-stone-500">
                              Instructor Feedback
                            </h4>
                            <textarea
                              className="w-full rounded-lg border border-stone-300 bg-white p-3 text-sm dark:border-stone-700 dark:bg-stone-900"
                              rows={3}
                              value={
                                feedback[sub.id] ??
                                sub.instructor_feedback ??
                                ""
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
                              className="mt-2 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
                            >
                              {saving === sub.id
                                ? "Saving..."
                                : "Save Feedback"}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
