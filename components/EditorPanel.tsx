"use client";

import CodeEditor from "./CodeEditor";

export default function EditorPanel({
  weekSlug,
  onCodeChange,
}: {
  weekSlug: string;
  onCodeChange: (code: string) => void;
}) {
  return (
    <div className="h-full overflow-hidden">
      <CodeEditor weekSlug={weekSlug} onChange={onCodeChange} />
    </div>
  );
}
