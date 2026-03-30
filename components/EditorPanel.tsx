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
  loading,
  submitting,
  hasCode,
  hasSubmittedBefore,
}: {
  classSlug: string;
  lessonSlug: string;
  onCodeChange: (code: string) => void;
  fallbackCode?: string;
  starterCode?: string;
  onRun?: () => void;
  onRunTests?: () => void;
  onSubmit?: () => void;
  loading?: boolean;
  submitting?: boolean;
  hasCode?: boolean;
  hasSubmittedBefore?: boolean;
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      {onRun && onRunTests && onSubmit && (
        <EditorToolbar
          onRun={onRun}
          onRunTests={onRunTests}
          onSubmit={onSubmit}
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
        />
      </div>
    </div>
  );
}
