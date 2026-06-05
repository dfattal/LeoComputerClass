"use client";

import {
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { usePyodide } from "@/lib/pyodide/usePyodide";
import type { TestResult } from "@/lib/pyodide/usePyodide";
import type { TestEntry, VizConfig } from "@/lib/lessons/loadLesson";

/** The subset of a reflection lesson that's safe to send to the browser: just
 *  what the student sees. The grader-only `lookFor`/`exemplar` stay server-side. */
type ClientReflectionConfig = { question: string; guidance?: string };
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
import ReflectionPanel from "./ReflectionPanel";
import LinePlot from "./LinePlot";
import PixelCanvas from "./PixelCanvas";
import EditorGraphSplit from "./EditorGraphSplit";

const DRAWER_COLLAPSED_KEY = "drawer-collapsed";
const DRAFT_SAVE_DEBOUNCE_MS = 2000;

export type SaveStatus = "idle" | "saving" | "saved";

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
  reflectionConfig,
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
  reflectionConfig?: ClientReflectionConfig;
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
        reflectionConfig={reflectionConfig}
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
  reflectionConfig,
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
  reflectionConfig?: ClientReflectionConfig;
}) {
  const accent = useAccent();
  const isReflection = !!reflectionConfig;
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [mounted, setMounted] = useState(false);

  // Pyodide + code state
  const { run, runTests, loading } = usePyodide();
  const [code, setCode] = useState("");
  const [stdout, setStdout] = useState("");
  const [stderr, setStderr] = useState("");
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [testError, setTestError] = useState<string | null>(null);
  const [existingSubmission, setExistingSubmission] =
    useState<ExistingSubmission | null>(null);

  // Auto-saved draft (in-progress, unsubmitted code) restored from the DB.
  const [draftCode, setDraftCode] = useState<string | null>(null);
  // Save-status badge state for the editor toolbar.
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  // Viz state — parsed JSON returned from the student's (or lesson's) viz function
  const [vizResult, setVizResult] = useState<unknown>(undefined);

  // Reset state
  const [resetKey, setResetKey] = useState(0);

  // Submit state
  const [submitting, setSubmitting] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<Record<string, unknown> | null>(
    null
  );
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Drawer state — reflection lessons only have a Review (feedback) tab.
  const [drawerTab, setDrawerTab] = useState<DrawerTab>(
    isReflection ? "Review" : "Output"
  );
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

  // Fetch existing submission + auto-saved draft on mount. The draft is the
  // in-progress code; it takes priority over the last submission when restoring.
  //
  // The sidebar navigates between lessons with <Link> (client-side), so this
  // CourseShell instance is REUSED across lessons — only the props change. So we
  // must RESET the previous lesson's per-lesson state up front and always write
  // the fetch result (null when none), or a fresh lesson would keep showing the
  // last lesson's restored answer + feedback. (Without this, opening a not-yet-
  // attempted lesson after a completed one shows the completed one's code.)
  useEffect(() => {
    setExistingSubmission(null);
    setDraftCode(null);
    setAiFeedback(null);
    setSubmitted(false);
    setSubmitError(null);
    setTestResults([]);
    setTestError(null);
    setStdout("");
    setStderr("");
    lastSavedCode.current = null;

    const query = `classSlug=${encodeURIComponent(classSlug)}&lessonSlug=${encodeURIComponent(lessonSlug)}`;
    let cancelled = false;
    async function fetchExisting() {
      try {
        const res = await fetch(`/api/submit?${query}`);
        if (res.ok) {
          const { submission } = await res.json();
          if (!cancelled) setExistingSubmission(submission ?? null);
        }
      } catch {
        // Ignore — no existing submission
      }
    }
    async function fetchDraft() {
      try {
        const res = await fetch(`/api/draft?${query}`);
        if (res.ok) {
          const { draft } = await res.json();
          if (!cancelled) setDraftCode(draft?.code ?? null);
        }
      } catch {
        // Ignore — no saved draft
      }
    }
    fetchExisting();
    fetchDraft();
    return () => {
      cancelled = true;
    };
  }, [classSlug, lessonSlug]);

  // The editor's restore fallback: prefer the in-progress draft, then the last
  // submission. (localStorage, written on every keystroke, still wins inside
  // CodeEditor when present — this fallback covers a fresh device / cleared cache.)
  const fallbackCode = draftCode ?? existingSubmission?.code;

  // Values the editor can load on its own — the starter, the restored draft, or
  // the restored submission. These are NOT user edits, so they must never be
  // auto-saved (otherwise opening a lesson would overwrite the real draft with
  // the starter before the student types anything).
  const isBaselineCode = useCallback(
    (c: string) =>
      c === starterCode ||
      c === draftCode ||
      c === existingSubmission?.code,
    [starterCode, draftCode, existingSubmission?.code]
  );
  const isBaselineRef = useRef(isBaselineCode);
  isBaselineRef.current = isBaselineCode;

  // --- Debounced auto-save of in-progress code to the DB ---
  // The working copy lives in `code`; saving is a pure side-effect of it
  // changing. Skips the initial restore, unchanged values, and blank code.
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedCode = useRef<string | null>(null);
  const savedBadgeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Mirror of `code` so the once-bound visibilitychange listener reads the latest value.
  const codeRef = useRef(code);
  codeRef.current = code;

  const saveDraft = useCallback(
    async (codeToSave: string) => {
      if (!codeToSave.trim() || codeToSave === lastSavedCode.current) return;
      setSaveStatus("saving");
      try {
        const res = await fetch("/api/draft", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ classSlug, lessonSlug, code: codeToSave }),
        });
        if (res.ok) {
          lastSavedCode.current = codeToSave;
          setSaveStatus("saved");
          if (savedBadgeTimer.current) clearTimeout(savedBadgeTimer.current);
          savedBadgeTimer.current = setTimeout(() => setSaveStatus("idle"), 2000);
        } else {
          setSaveStatus("idle");
        }
      } catch {
        setSaveStatus("idle");
      }
    },
    [classSlug, lessonSlug]
  );

  // Seed lastSavedCode with the restored value so we don't re-save unchanged code.
  useEffect(() => {
    if (fallbackCode != null && lastSavedCode.current === null) {
      lastSavedCode.current = fallbackCode;
    }
  }, [fallbackCode]);

  // Debounce: save 2s after the last keystroke. Skips blanks, already-saved
  // code, and any baseline value the editor loaded on its own.
  useEffect(() => {
    if (!code.trim() || code === lastSavedCode.current || isBaselineCode(code))
      return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveDraft(code);
    }, DRAFT_SAVE_DEBOUNCE_MS);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [code, saveDraft, isBaselineCode]);

  // Flush an unsaved draft when the tab is hidden/closed (beats the debounce).
  useEffect(() => {
    function flush() {
      if (document.visibilityState === "hidden") {
        const codeToSave = codeRef.current;
        if (
          codeToSave.trim() &&
          codeToSave !== lastSavedCode.current &&
          !isBaselineRef.current(codeToSave)
        ) {
          // keepalive lets the request finish even as the page unloads.
          fetch("/api/draft", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ classSlug, lessonSlug, code: codeToSave }),
            keepalive: true,
          }).catch(() => {});
          lastSavedCode.current = codeToSave;
        }
      }
    }
    document.addEventListener("visibilitychange", flush);
    return () => document.removeEventListener("visibilitychange", flush);
  }, [classSlug, lessonSlug]);

  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode);
  }, []);

  const handleReset = useCallback(() => {
    if (!window.confirm("Reset editor to the original starter code?")) return;
    setResetKey((k) => k + 1);
  }, []);

  // Run the lesson's viz function via the __VIZ__ stdout channel and capture
  // its JSON return value. Shared by Run and Run-Tests.
  const captureViz = useCallback(
    async (currentCode: string, mainErrored: boolean) => {
      // The viz is driven by the student's own code, so skip if it errored.
      if (!vizConfig || mainErrored) return;
      try {
        // A "plot"/"draw" lesson can ship a hidden `setup` prelude (helpers that
        // call the student's functions); append it after the student's code.
        const setup =
          (vizConfig.type === "plot" || vizConfig.type === "draw") &&
          vizConfig.setup
            ? `\n${vizConfig.setup}`
            : "";

        let driver: string;
        if (vizConfig.type === "draw" && vizConfig.stages) {
          // Progressive mode: run EVERY stage's function and report each one's
          // live grid + status (match / wip / todo), plus `auto` = the furthest
          // stage in the leading run of correct steps (the default view, which
          // reproduces the old "show the furthest correct step" behavior). The
          // canvas can then let the student pin an earlier stage to experiment
          // with it without losing their place. `matchCount` only counts the
          // leading consecutive matches so progress can't appear to skip ahead.
          const stagesLit = JSON.stringify(JSON.stringify(vizConfig.stages));
          const todoLit = JSON.stringify(
            vizConfig.todo ?? "Run your code to see your picture!"
          );
          driver = `\nimport json as __json
def __viz_progress():
    __stages = __json.loads(${stagesLit})
    __results = []
    __match_count = 0
    __still_matching = True
    for __s in __stages:
        __fn = globals().get(__s["fn"])
        try:
            __out = __fn(*__s["args"]) if __fn is not None else None
        except Exception:
            __out = None
        if __out == __s["expected"]:
            __status = "match"
            __grid = __out
            if __still_matching:
                __match_count += 1
        elif isinstance(__out, list) and len(__out) > 0:
            __status = "wip"
            __grid = __out
            __still_matching = False
        else:
            __status = "todo"
            __grid = None
            __still_matching = False
        __results.append({"fn": __s["fn"], "label": __s.get("label"), "caption": __s["caption"], "grid": __grid, "status": __status})
    __auto = __match_count - 1 if __match_count > 0 else 0
    return {"stages": __results, "auto": __auto, "matchCount": __match_count, "todo": ${todoLit}}
try:
    print("__VIZ__:" + __json.dumps(__viz_progress()))
except Exception as __e:
    print("__VIZ_ERR__:" + str(__e))`;
        } else if (vizConfig.type === "plot" && vizConfig.stages) {
          // Progressive plot (pin-to-play): each stage owns a resultFn that
          // builds its own series list and a `check` that gates its status. We
          // run every stage each Run (so the student can pin any one instantly),
          // returning each stage's live series + status, plus `auto` = the
          // furthest stage in the leading run of correct steps (the default
          // view). Mirrors the draw-stages driver; LinePlot owns the chip UI.
          const stagesLit = JSON.stringify(JSON.stringify(vizConfig.stages));
          const todoLit = JSON.stringify(
            vizConfig.todo ?? "Run your code to see the graph!"
          );
          driver = `\nimport json as __json
def __vm(a, b, tol):
    if tol is not None:
        if isinstance(a, bool) or isinstance(b, bool):
            return a == b
        if isinstance(a, (int, float)) and isinstance(b, (int, float)):
            return abs(a - b) <= tol
        if isinstance(a, list) and isinstance(b, list):
            return len(a) == len(b) and all(__vm(a[__i], b[__i], tol) for __i in range(len(a)))
    return __json.dumps(a) == __json.dumps(b)
def __viz_plot_stages():
    __stages = __json.loads(${stagesLit})
    __results = []
    __match_count = 0
    __still_matching = True
    for __s in __stages:
        __rf = globals().get(__s["resultFn"])
        try:
            __series = __rf(*__s["demoArgs"]) if __rf is not None else None
        except Exception:
            __series = None
        __c = __s["check"]
        __cf = globals().get(__c["fn"])
        __status = "todo"
        if __cf is not None:
            try:
                __out = __cf(*__c["args"])
            except Exception:
                __out = None
            if __out is not None:
                __status = "match" if __vm(__out, __c["expected"], __c.get("tol")) else "wip"
        if __status == "match":
            if __still_matching:
                __match_count += 1
        else:
            __still_matching = False
        __results.append({"label": __s.get("label"), "caption": __s["caption"], "series": __series, "status": __status})
    __auto = __match_count - 1 if __match_count > 0 else 0
    return {"stages": __results, "auto": __auto, "matchCount": __match_count, "todo": ${todoLit}}
try:
    print("__VIZ__:" + __json.dumps(__viz_plot_stages()))
except Exception as __e:
    print("__VIZ_ERR__:" + str(__e))`;
        } else if (vizConfig.type === "plot" && vizConfig.caption) {
          // Progress-aware plot: build the series via resultFn, then pick one of
          // three captions by checking the curve-driving student fn(s) directly.
          // The series alone can't tell us where the student is (the panel falls
          // back to a reference curve so it's never blank), so we call each check
          // fn and compare to its reference value within tol (mirrors the worker's
          // valuesMatch). Returns { series, caption } — LinePlot unwraps both.
          const argsStr = (vizConfig.demoArgs ?? [])
            .map((a) => JSON.stringify(a))
            .join(", ");
          const checksLit = JSON.stringify(
            JSON.stringify(vizConfig.caption.checks)
          );
          const todoLit = JSON.stringify(vizConfig.caption.todo);
          const tuningLit = JSON.stringify(vizConfig.caption.tuning);
          const matchLit = JSON.stringify(vizConfig.caption.match);
          driver = `\nimport json as __json
def __vm(a, b, tol):
    if tol is not None:
        if isinstance(a, bool) or isinstance(b, bool):
            return a == b
        if isinstance(a, (int, float)) and isinstance(b, (int, float)):
            return abs(a - b) <= tol
        if isinstance(a, list) and isinstance(b, list):
            return len(a) == len(b) and all(__vm(a[__i], b[__i], tol) for __i in range(len(a)))
    return __json.dumps(a) == __json.dumps(b)
def __caption(__checks, __todo, __tuning, __match):
    __ok = True
    for __c in __checks:
        __fn = globals().get(__c["fn"])
        if __fn is None:
            return __todo
        try:
            __out = __fn(*__c["args"])
        except Exception:
            return __todo
        if __out is None:
            return __todo
        if not __vm(__out, __c["expected"], __c.get("tol")):
            __ok = False
    return __match if __ok else __tuning
try:
    __viz_series = ${vizConfig.resultFn}(${argsStr})
    __viz_cap = __caption(__json.loads(${checksLit}), ${todoLit}, ${tuningLit}, ${matchLit})
    print("__VIZ__:" + __json.dumps({"series": __viz_series, "caption": __viz_cap}))
except Exception as __e:
    print("__VIZ_ERR__:" + str(__e))`;
        } else {
          // Simple mode: call resultFn(demoArgs) and plot/draw its return value.
          const argsStr = (vizConfig.demoArgs ?? [])
            .map((a) => JSON.stringify(a))
            .join(", ");
          driver = `\nimport json\ntry:\n    __viz_r = ${vizConfig.resultFn}(${argsStr})\n    print("__VIZ__:" + json.dumps(__viz_r))\nexcept Exception as e:\n    print("__VIZ_ERR__:" + str(e))`;
        }

        const vizRun = await run(`${currentCode}${setup}${driver}`);
        const vizLine = vizRun.stdout
          .split("\n")
          .find((l: string) => l.startsWith("__VIZ__:"));
        if (vizLine) setVizResult(JSON.parse(vizLine.slice(8)));
      } catch {
        // Viz extraction failed — not critical
      }
    },
    [run, vizConfig]
  );

  const handleRun = useCallback(async () => {
    setStdout("");
    setStderr("");
    const result = await run(code);
    setStdout(result.stdout);
    setStderr(result.stderr);

    await captureViz(code, !!result.error);

    // Decide what the bottom drawer should do — don't pop it open empty. The
    // bottom section only surfaces when it has something to read; on a clean run
    // of a visual lesson, the picture/graph is the output.
    const hasError = !!result.error || !!result.stderr?.trim();
    const hasOutput = !!result.stdout?.trim();
    const hasGraph = vizConfig?.type === "plot" || vizConfig?.type === "draw";
    const openDrawer = (tab: DrawerTab) => {
      setDrawerTab(tab);
      setDrawerCollapsed(false);
      localStorage.setItem(DRAWER_COLLAPSED_KEY, "false");
    };
    if (hasError || hasOutput) {
      openDrawer("Output"); // an error or a print to read
    } else if (hasGraph) {
      // The picture is the output. Desktop shows it in the right column, so hide
      // the (empty) bottom drawer; mobile shows it as the Canvas/Graph tab.
      const isDesktop =
        typeof window !== "undefined" &&
        window.matchMedia("(min-width: 1024px)").matches;
      if (isDesktop) {
        setDrawerCollapsed(true);
        localStorage.setItem(DRAWER_COLLAPSED_KEY, "true");
      } else {
        openDrawer("Graph");
      }
    } else {
      openDrawer("Output"); // no visual, no output: keep the old behavior
    }
  }, [run, code, captureViz, vizConfig]);

  const handleRunTests = useCallback(async () => {
    setTestResults([]);
    setTestError(null);
    setDrawerTab("Tests");
    setDrawerCollapsed(false);
    localStorage.setItem(DRAWER_COLLAPSED_KEY, "false");
    const result = await runTests(code, tests);
    setTestResults(result.testResults);
    if (result.error === "timeout") {
      setTestError(
        "Tests took too long — your code probably has a loop that never stops. " +
          "Check each `while True:` block: it needs a way out (like `if y <= 0: break`), " +
          "and the variable the `if` checks has to be updated inside the loop."
      );
    } else if (result.error) {
      setTestError(`Tests couldn't finish: ${result.error}`);
    }

    await captureViz(code, !!result.error);
  }, [runTests, code, tests, captureViz]);

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    setReviewing(true);
    setAiFeedback(null);
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
      setReviewing(false);

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
      setReviewing(false);
    }
  }, [classSlug, lessonSlug, code, stdout, stderr, testResults]);

  const hasSubmittedBefore = submitted || !!existingSubmission;
  // While a new review is in flight, suppress stale feedback so the spinner shows instead.
  const displayAiFeedback = reviewing
    ? null
    : aiFeedback ?? existingSubmission?.ai_feedback ?? null;
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
    <div className="space-y-3">
      {testError && (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
          <p className="mb-1 font-semibold">Tests stopped early</p>
          <p className="whitespace-pre-wrap leading-relaxed">{testError}</p>
        </div>
      )}
      {testResults.length === 0 ? (
        !testError && (
          <p className="text-sm text-stone-400">
            Run tests to see results here.
          </p>
        )
      ) : (
        <TestResults results={testResults} />
      )}
    </div>
  );

  const reviewContent = (
    <div className="space-y-3">
      {submitted && !aiFeedback && !submitting && !reviewing && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950 dark:text-green-300">
          Submitted successfully!
        </div>
      )}
      {reviewing && (
        <div className="flex items-center gap-3 rounded-lg border border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-900/40">
          <svg
            className={`h-5 w-5 animate-spin ${accent.feedback.title}`}
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span className="text-sm text-stone-600 dark:text-stone-300">
            {isReflection
              ? "Your coach is reading your answer…"
              : "Your coach is reading your code…"}
          </span>
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
          {isReflection
            ? "Write your answer and submit to get feedback from your coach."
            : "Submit your code to get AI feedback."}
        </p>
      )}
    </div>
  );

  // CRISPR simulator panel (rendered in drawer "Lab" tab when viz config exists)
  const labContent = vizConfig?.type === "crispr" ? (
    <CrisprSimulator
      scenario={vizConfig.scenario}
      studentResult={vizResult as string | undefined}
    />
  ) : undefined;

  // Right-column graph panel (also a drawer "Graph" tab on mobile): a line plot
  // for "plot" lessons, or a pixel-grid drawing for "draw" lessons.
  const graphContent =
    vizConfig?.type === "plot" ? (
      <LinePlot
        data={vizResult}
        title={vizConfig.title}
        xLabel={vizConfig.xLabel}
        yLabel={vizConfig.yLabel}
      />
    ) : vizConfig?.type === "draw" ? (
      <PixelCanvas data={vizResult} title={vizConfig.title} />
    ) : undefined;

  // The panel isn't always a "graph": a pixel-drawing lesson shows a canvas.
  const isDrawViz = vizConfig?.type === "draw";
  const graphTabLabel = isDrawViz ? "Canvas" : "Graph";
  const graphHeaderLabel = isDrawViz ? "🎨 Canvas" : "📈 Graph";

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

  // --- REFLECTION LAYOUT ---
  // A no-Python capstone: prose answer box instead of the editor, and the drawer
  // shows only the Review (AI feedback) tab. Reuses the same sidebar, content
  // panel, split layout, submit flow, and feedback rendering as code lessons.
  if (isReflection && reflectionConfig) {
    const reflectionPanel = (
      <ReflectionPanel
        classSlug={classSlug}
        lessonSlug={lessonSlug}
        question={reflectionConfig.question}
        guidance={reflectionConfig.guidance}
        onCodeChange={handleCodeChange}
        fallbackCode={fallbackCode}
        onSubmit={handleSubmit}
        submitting={submitting}
        hasText={!!code.trim()}
        hasSubmittedBefore={hasSubmittedBefore}
        saveStatus={saveStatus}
      />
    );

    const reflectionDrawer = (
      <BottomDrawer
        activeTab="Review"
        onTabChange={() => {}}
        collapsed={drawerCollapsed}
        onCollapsedChange={setDrawerCollapsed}
        outputContent={null}
        testsContent={null}
        reviewContent={reviewContent}
        tabs={["Review"]}
      />
    );

    if (isDesktop) {
      return (
        <>
          <LessonSidebar {...sidebarProps} />
          <div className="flex min-w-0 flex-1 flex-col">
            <SplitLayout
              leftPanel={
                <ContentPanel
                  lessonContent={lessonContent}
                  exercisesContent={exercisesContent}
                />
              }
              rightPanel={reflectionPanel}
            />
            {reflectionDrawer}
          </div>
        </>
      );
    }

    // Mobile reflection: Learn / Answer toggle, no run/test action bar.
    return (
      <>
        <LessonSidebar {...sidebarProps} />
        <div className="flex min-w-0 flex-1 flex-col">
          <MobileTabBar
            active={activeView}
            onChange={setActiveView}
            secondLabel="Answer"
          />
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
              {reflectionPanel}
            </div>
          </div>
          {reflectionDrawer}
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
              graphContent ? (
                <EditorGraphSplit
                  editor={
                    <EditorPanel
                      classSlug={classSlug}
                      lessonSlug={lessonSlug}
                      onCodeChange={handleCodeChange}
                      fallbackCode={fallbackCode}
                      starterCode={starterCode}
                      onRun={handleRun}
                      onRunTests={handleRunTests}
                      onSubmit={handleSubmit}
                      onReset={handleReset}
                      loading={loading}
                      submitting={submitting}
                      hasCode={!!code.trim()}
                      hasSubmittedBefore={hasSubmittedBefore}
                      resetKey={resetKey}
                      saveStatus={saveStatus}
                    />
                  }
                  graph={graphContent}
                  label={graphHeaderLabel}
                />
              ) : (
                <EditorPanel
                  classSlug={classSlug}
                  lessonSlug={lessonSlug}
                  onCodeChange={handleCodeChange}
                  fallbackCode={fallbackCode}
                  starterCode={starterCode}
                  onRun={handleRun}
                  onRunTests={handleRunTests}
                  onSubmit={handleSubmit}
                  onReset={handleReset}
                  loading={loading}
                  submitting={submitting}
                  hasCode={!!code.trim()}
                  hasSubmittedBefore={hasSubmittedBefore}
                  resetKey={resetKey}
                  saveStatus={saveStatus}
                />
              )
            }
          />
          {/* Bottom: collapsible drawer (graph lives in the right column on desktop) */}
          <BottomDrawer
            activeTab={drawerTab}
            onTabChange={setDrawerTab}
            collapsed={drawerCollapsed}
            onCollapsedChange={setDrawerCollapsed}
            outputContent={outputContent}
            testsContent={testsContent}
            reviewContent={reviewContent}
            labContent={labContent}
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
              fallbackCode={fallbackCode}
              starterCode={starterCode}
              resetKey={resetKey}
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
          labContent={labContent}
          graphContent={graphContent}
          graphLabel={graphTabLabel}
        />

        {/* Mobile sticky action bar */}
        <MobileActionBar
          onRun={handleRun}
          onRunTests={handleRunTests}
          onSubmit={handleSubmit}
          onReset={handleReset}
          loading={loading}
          submitting={submitting}
          hasCode={!!code.trim()}
          hasSubmittedBefore={hasSubmittedBefore}
          saveStatus={saveStatus}
        />
      </div>
    </>
  );
}
