"use client";

import CodeEditor from "./CodeEditor";

export default function EditorPanel({
  classSlug,
  lessonSlug,
  onCodeChange,
  fallbackCode,
  starterCode,
}: {
  classSlug: string;
  lessonSlug: string;
  onCodeChange: (code: string) => void;
  fallbackCode?: string;
  starterCode?: string;
}) {
  return (
    <div className="h-full overflow-hidden">
      <CodeEditor
        classSlug={classSlug}
        lessonSlug={lessonSlug}
        onChange={onCodeChange}
        fallbackCode={fallbackCode}
        starterCode={starterCode}
      />
    </div>
  );
}
