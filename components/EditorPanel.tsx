"use client";

import CodeEditor from "./CodeEditor";

export default function EditorPanel({
  weekSlug,
  onCodeChange,
  fallbackCode,
}: {
  weekSlug: string;
  onCodeChange: (code: string) => void;
  fallbackCode?: string;
}) {
  return (
    <div className="h-full overflow-hidden">
      <CodeEditor weekSlug={weekSlug} onChange={onCodeChange} fallbackCode={fallbackCode} />
    </div>
  );
}
