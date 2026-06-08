"use client";

import CodeEditor from "./CodeEditor";
import EditorToolbar from "./EditorToolbar";
import type { SaveStatus } from "./CourseShell";

export default function EditorPanel({
  classSlug,
  lessonSlug,
  onCodeChange,
  fallbackCode,
  starterCode,
  onRun,
  onRunTests,
  onSubmit,
  onReset,
  onShare,
  loading,
  submitting,
  sharing,
  hasCode,
  hasSubmittedBefore,
  resetKey,
  saveStatus,
  language,
}: {
  classSlug: string;
  lessonSlug: string;
  onCodeChange: (code: string) => void;
  fallbackCode?: string;
  starterCode?: string;
  onRun?: () => void;
  onRunTests?: () => void;
  onSubmit?: () => void;
  onReset?: () => void;
  onShare?: () => void;
  loading?: boolean;
  submitting?: boolean;
  sharing?: boolean;
  hasCode?: boolean;
  hasSubmittedBefore?: boolean;
  resetKey?: number;
  saveStatus?: SaveStatus;
  language?: "python" | "latex" | "javascript";
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      {onRun && onRunTests && onSubmit && onReset && (
        <EditorToolbar
          onRun={onRun}
          onRunTests={onRunTests}
          onSubmit={onSubmit}
          onReset={onReset}
          onShare={onShare}
          loading={loading ?? false}
          submitting={submitting ?? false}
          sharing={sharing ?? false}
          hasCode={hasCode ?? false}
          hasSubmittedBefore={hasSubmittedBefore ?? false}
          saveStatus={saveStatus ?? "idle"}
        />
      )}
      <div className="min-h-0 flex-1">
        <CodeEditor
          classSlug={classSlug}
          lessonSlug={lessonSlug}
          onChange={onCodeChange}
          fallbackCode={fallbackCode}
          starterCode={starterCode}
          resetKey={resetKey}
          language={language}
        />
      </div>
    </div>
  );
}
