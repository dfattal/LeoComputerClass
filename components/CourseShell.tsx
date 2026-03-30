"use client";

import { useState, useCallback, useEffect, type ReactNode } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { usePyodide } from "@/lib/pyodide/usePyodide";
import type { TestResult } from "@/lib/pyodide/usePyodide";
import type { TestEntry, VizConfig } from "@/lib/lessons/loadLesson";
import { getClassBySlug } from "@/content/classes";
import { AccentProvider, useAccent } from "./AccentContext";
import dynamic from "next/dynamic";

const CrisprSimulator = dynamic(
  () => import("./classes/leila/CrisprSimulator"),
  { ssr: false }
);
import LessonSidebar, {
  type SidebarPhase,
  type SidebarWeek,
} from "./LessonSidebar";
import ContentPanel from "./ContentPanel";
import EditorPanel from "./EditorPanel";
import SplitLayout from "./SplitLayout";
import BottomDrawer, { type DrawerTab } from "./BottomDrawer";
import MobileTabBar, { type MobileView } from "./MobileTabBar";
import MobileActionBar from "./MobileActionBar";
import RunPanel from "./RunPanel";
import TestResults from "./TestResults";
import AIFeedback from "./AIFeedback";

const DRAWER_COLLAPSED_KEY = "drawer-collapsed";

interface ExistingSubmission {
  id: string;
  code: string;
  ai_feedback: Record<string, unknown> | null;
  instructor_feedback: string | null;
  status: string;
  test_results: Array<{ passed: boolean; name: string; error?: string }>;
}

export default function CourseShell({
  classSlug,
  lessonSlug,
  tests,
  lessonContent,
  exercisesContent,
  phases,
  weeks,
  starterCode,
  vizConfig,
}: {
  classSlug: string;
  lessonSlug: string;
  tests: TestEntry[];
  lessonContent: ReactNode;
  exercisesContent: ReactNode;
  phases: SidebarPhase[];
  weeks: SidebarWeek[];
  starterCode?: string;
  vizConfig?: VizConfig;
}) {
  const accentColor = getClassBySlug(classSlug)?.accentColor ?? "indigo";

  return (
    <AccentProvider color={accentColor}>
      <CourseShellInner
        classSlug={classSlug}
        lessonSlug={lessonSlug}
        tests={tests}
        lessonContent={lessonContent}
        exercisesContent={exercisesContent}
        phases={phases}
        weeks={weeks}
        starterCode={starterCode}
        vizConfig={vizConfig}
      />
    </AccentProvider>
  );
}

function CourseShellInner({
  classSlug,
  lessonSlug,
  tests,
  lessonContent,
  exercisesContent,
  phases,
  weeks,
  starterCode,
  vizConfig,
}: {
  classSlug: string;
  lessonSlug: string;
  tests: TestEntry[];
  lessonContent: ReactNode;
  exercisesContent: ReactNode;
  phases: SidebarPhase[];
  weeks: SidebarWeek[];
  starterCode?: string;
  vizConfig?: VizConfig;
}) {
  const accent = useAccent();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [mounted, setMounted] = useState(false);

  // Pyodide + code state
  const { run, runTests, loading } = usePyodide();
  const [code, setCode] = useState("");
  const [stdout, setStdout] = useState("");
  const [stderr, setStderr] = useState("");
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [existingSubmission, setExistingSubmission] =
    useState<ExistingSubmission | null>(null);

  // Viz state — captures result from the student's function for the simulator
  const [vizResult, setVizResult] = useState<string | undefined>(undefined);

  // Submit state
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<Record<string, unknown> | null>(
    null
  );
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Drawer state
  const [drawerTab, setDrawerTab] = useState<DrawerTab>("Output");
  const [drawerCollapsed, setDrawerCollapsed] = useState(false);

  // Mobile state
  const [activeView, setActiveView] = useState<MobileView>("Learn");

  useEffect(() => {
    const savedCollapsed = localStorage.getItem(DRAWER_COLLAPSED_KEY);
    if (savedCollapsed === "true") {
      setDrawerCollapsed(true);
    }
    setMounted(true);
  }, []);

  // Fetch existing submission on mount
  useEffect(() => {
    async function fetchExisting() {
      try {
        const res = await fetch(
          `/api/submit?classSlug=${encodeURIComponent(classSlug)}&lessonSlug=${encodeURIComponent(lessonSlug)}`
        );
        if (res.ok) {
          const { submission } = await res.json();
          if (submission) setExistingSubmission(submission);
        }
      } catch {
        // Ignore — no existing submission
      }
    }
    fetchExisting();
  }, [classSlug, lessonSlug]);

  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode);
  }, []);

  const handleRun = useCallback(async () => {
    setStdout("");
    setStderr("");
    setDrawerTab("Output");
    setDrawerCollapsed(false);
    localStorage.setItem(DRAWER_COLLAPSED_KEY, "false");
    const result = await run(code);
    setStdout(result.stdout);
    setStderr(result.stderr);

    // If there's a viz config, run the student's function with demo args to get the result
    if (vizConfig && !result.error) {
      try {
        const argsStr = vizConfig.demoArgs.map((a) => JSON.stringify(a)).join(", ");
        const vizCode = `${code}\nimport json\ntry:\n    __viz_r = ${vizConfig.resultFn}(${argsStr})\n    print("__VIZ__:" + json.dumps(__viz_r))\nexcept Exception as e:\n    print("__VIZ_ERR__:" + str(e))`;
        const vizRun = await run(vizCode);
        const vizLine = vizRun.stdout
          .split("\n")
          .find((l: string) => l.startsWith("__VIZ__:"));
        if (vizLine) {
          setVizResult(JSON.parse(vizLine.slice(8)));
        }
      } catch {
        // Viz extraction failed — not critical
      }
    }
  }, [run, code, vizConfig]);

  const handleRunTests = useCallback(async () => {
    setTestResults([]);
    setDrawerTab("Tests");
    setDrawerCollapsed(false);
    localStorage.setItem(DRAWER_COLLAPSED_KEY, "false");
    const result = await runTests(code, tests);
    setTestResults(result.testResults);

    // Also capture viz result
    if (vizConfig && !result.error) {
      try {
        const argsStr = vizConfig.demoArgs.map((a) => JSON.stringify(a)).join(", ");
        const vizCode = `${code}\nimport json\ntry:\n    __viz_r = ${vizConfig.resultFn}(${argsStr})\n    print("__VIZ__:" + json.dumps(__viz_r))\nexcept Exception as e:\n    print("__VIZ_ERR__:" + str(e))`;
        const vizRun = await run(vizCode);
        const vizLine = vizRun.stdout
          .split("\n")
          .find((l: string) => l.startsWith("__VIZ__:"));
        if (vizLine) {
          setVizResult(JSON.parse(vizLine.slice(8)));
        }
      } catch {
        // Viz extraction failed — not critical
      }
    }
  }, [runTests, run, code, tests, vizConfig]);

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    setSubmitError(null);
    setDrawerTab("Review");
    setDrawerCollapsed(false);
    localStorage.setItem(DRAWER_COLLAPSED_KEY, "false");
    try {
      const submitRes = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classSlug,
          lessonSlug,
          code,
          stdout,
          stderr,
          testResults,
        }),
      });

      if (!submitRes.ok) {
        const data = await submitRes.json();
        throw new Error(data.error || "Submission failed");
      }

      const { submissionId } = await submitRes.json();
      setSubmitted(true);

      // Request AI review
      const reviewRes = await fetch("/api/ai-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId }),
      });

      let feedback: Record<string, unknown> | null = null;
      if (reviewRes.ok) {
        const data = await reviewRes.json();
        feedback = data.feedback;
        setAiFeedback(feedback);
      }

      setExistingSubmission({
        id: submissionId,
        code,
        ai_feedback: feedback,
        instructor_feedback: null,
        status: feedback ? "reviewed" : "submitted",
        test_results: testResults.map((r) => ({
          passed: r.passed,
          name: r.name,
          error: r.error ?? undefined,
        })),
      });
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Submission failed"
      );
    } finally {
      setSubmitting(false);
    }
  }, [classSlug, lessonSlug, code, stdout, stderr, testResults]);

  const hasSubmittedBefore = submitted || !!existingSubmission;
  const displayAiFeedback =
    aiFeedback ?? existingSubmission?.ai_feedback ?? null;
  const displayInstructorFeedback = existingSubmission?.instructor_feedback;

  // Shared output content for the drawer tabs
  const outputContent = (
    <div className="space-y-3">
      <RunPanel stdout={stdout} stderr={stderr} />
      {submitError && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {submitError}
        </div>
      )}
    </div>
  );

  const testsContent = (
    <div>
      {testResults.length === 0 ? (
        <p className="text-sm text-stone-400">
          Run tests to see results here.
        </p>
      ) : (
        <TestResults results={testResults} />
      )}
    </div>
  );

  const reviewContent = (
    <div className="space-y-3">
      {submitted && !aiFeedback && !submitting && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950 dark:text-green-300">
          Submitted successfully!
        </div>
      )}
      {displayAiFeedback && <AIFeedback feedback={displayAiFeedback} />}
      {displayInstructorFeedback && (
        <div className={`rounded-lg border ${accent.feedback.border} ${accent.feedback.bg} p-4`}>
          <div className="mb-2 flex items-center gap-2">
            <span className={`text-sm font-semibold ${accent.feedback.title}`}>
              Instructor Feedback
            </span>
          </div>
          <p className={`whitespace-pre-wrap text-sm leading-relaxed ${accent.feedback.body}`}>
            {displayInstructorFeedback}
          </p>
        </div>
      )}
      {!submitted && !displayAiFeedback && !displayInstructorFeedback && (
        <p className="text-sm text-stone-400">
          Submit your code to get AI feedback.
        </p>
      )}
    </div>
  );

  const actionButtons = (
    <>
      <button
        onClick={handleRun}
        disabled={loading}
        className={`rounded-md ${accent.bg} px-3 py-1 text-xs font-medium text-white shadow-sm transition-colors ${accent.bgHover} disabled:opacity-50`}
      >
        {loading ? "Running..." : "Run"}
      </button>
      <button
        onClick={handleRunTests}
        disabled={loading}
        className="rounded-md border border-stone-300 px-3 py-1 text-xs font-medium transition-colors hover:bg-stone-100 disabled:opacity-50 dark:border-stone-700 dark:hover:bg-stone-800"
      >
        {loading ? "Testing..." : "Run Tests"}
      </button>
      <button
        onClick={handleSubmit}
        disabled={submitting || !code.trim()}
        className={`rounded-md ${accent.bg} px-3 py-1 text-xs font-medium text-white shadow-sm transition-colors ${accent.bgHover} disabled:opacity-50`}
      >
        {submitting
          ? "Submitting..."
          : hasSubmittedBefore
            ? "Resubmit"
            : "Submit"}
      </button>
    </>
  );

  // CRISPR simulator panel (rendered in drawer "Lab" tab when viz config exists)
  const labContent = vizConfig?.type === "crispr" ? (
    <CrisprSimulator
      scenario={vizConfig.scenario}
      studentResult={vizResult}
    />
  ) : undefined;

  const sidebarProps = {
    phases,
    weeks,
    classSlug,
    currentLesson: lessonSlug,
  };

  // SSR / pre-mount: render a minimal placeholder to avoid hydration mismatch
  if (!mounted) {
    return (
      <>
        <LessonSidebar {...sidebarProps} />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex min-w-0 flex-1">
            <div className="flex-1" />
          </div>
        </div>
      </>
    );
  }

  // --- DESKTOP LAYOUT ---
  if (isDesktop) {
    return (
      <>
        <LessonSidebar {...sidebarProps} />
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top: split lesson + editor */}
          <SplitLayout
            leftPanel={
              <ContentPanel
                lessonContent={lessonContent}
                exercisesContent={exercisesContent}
              />
            }
            rightPanel={
              <EditorPanel
                classSlug={classSlug}
                lessonSlug={lessonSlug}
                onCodeChange={handleCodeChange}
                fallbackCode={existingSubmission?.code}
                starterCode={starterCode}
              />
            }
          />
          {/* Bottom: collapsible drawer */}
          <BottomDrawer
            activeTab={drawerTab}
            onTabChange={setDrawerTab}
            collapsed={drawerCollapsed}
            onCollapsedChange={setDrawerCollapsed}
            outputContent={outputContent}
            testsContent={testsContent}
            reviewContent={reviewContent}
            labContent={labContent}
            actionButtons={actionButtons}
          />
        </div>
      </>
    );
  }

  // --- MOBILE LAYOUT ---
  return (
    <>
      <LessonSidebar {...sidebarProps} />
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile tab bar */}
        <MobileTabBar active={activeView} onChange={setActiveView} />

        {/* Content area — both rendered, toggled with hidden */}
        <div className="relative min-h-0 flex-1">
          <div
            className={`absolute inset-0 overflow-y-auto ${activeView === "Learn" ? "block" : "hidden"}`}
            id="mobile-panel-learn"
            role="tabpanel"
            aria-labelledby="mobile-tab-learn"
          >
            <ContentPanel
              lessonContent={lessonContent}
              exercisesContent={exercisesContent}
            />
          </div>
          <div
            className={`absolute inset-0 ${activeView === "Code" ? "block" : "hidden"}`}
            id="mobile-panel-code"
            role="tabpanel"
            aria-labelledby="mobile-tab-code"
          >
            <EditorPanel
              classSlug={classSlug}
              lessonSlug={lessonSlug}
              onCodeChange={handleCodeChange}
              starterCode={starterCode}
            />
          </div>
        </div>

        {/* Bottom drawer */}
        <BottomDrawer
          activeTab={drawerTab}
          onTabChange={setDrawerTab}
          collapsed={drawerCollapsed}
          onCollapsedChange={setDrawerCollapsed}
          outputContent={outputContent}
          testsContent={testsContent}
          reviewContent={reviewContent}
        />

        {/* Mobile sticky action bar */}
        <MobileActionBar
          onRun={handleRun}
          onRunTests={handleRunTests}
          onSubmit={handleSubmit}
          loading={loading}
          submitting={submitting}
          hasCode={!!code.trim()}
          hasSubmittedBefore={hasSubmittedBefore}
        />
      </div>
    </>
  );
}
