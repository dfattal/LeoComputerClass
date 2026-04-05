"use client";

import CodeEditor from "./CodeEditor";
import EditorToolbar from "./EditorToolbar";

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
  loading,
  submitting,
  hasCode,
  hasSubmittedBefore,
  resetKey,
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
  loading?: boolean;
  submitting?: boolean;
  hasCode?: boolean;
  hasSubmittedBefore?: boolean;
  resetKey?: number;
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      {onRun && onRunTests && onSubmit && onReset && (
        <EditorToolbar
          onRun={onRun}
          onRunTests={onRunTests}
          onSubmit={onSubmit}
          onReset={onReset}
          loading={loading ?? false}
          submitting={submitting ?? false}
          hasCode={hasCode ?? false}
          hasSubmittedBefore={hasSubmittedBefore ?? false}
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
        />
      </div>
    </div>
  );
}
