"use client";

import { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";

const DEFAULT_STARTER = `# Write your code here\n`;

export default function CodeEditor({
  classSlug,
  lessonSlug,
  onChange,
  fallbackCode,
  starterCode,
  resetKey,
}: {
  classSlug: string;
  lessonSlug: string;
  onChange: (code: string) => void;
  fallbackCode?: string;
  starterCode?: string;
  resetKey?: number;
}) {
  const storageKey = `code-draft-${classSlug}-${lessonSlug}`;
  const [code, setCode] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    const initial = saved || fallbackCode || starterCode || DEFAULT_STARTER;
    setCode(initial);
    onChange(initial);
    setMounted(true);
  }, [storageKey, onChange, fallbackCode, starterCode]);

  // Reset editor to starter code when resetKey changes
  useEffect(() => {
    if (resetKey === undefined || resetKey === 0) return;
    const initial = starterCode || DEFAULT_STARTER;
    setCode(initial);
    localStorage.removeItem(storageKey);
    onChange(initial);
  }, [resetKey]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleChange(value: string | undefined) {
    const newCode = value || "";
    setCode(newCode);
    localStorage.setItem(storageKey, newCode);
    onChange(newCode);
  }

  if (!mounted) {
    return (
      <div className="flex h-full items-center justify-center border-b border-stone-200 bg-stone-50 dark:border-stone-800 dark:bg-stone-900">
        <span className="text-sm text-stone-500">Loading editor...</span>
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden">
      <Editor
        height="100%"
        defaultLanguage="python"
        value={code}
        onChange={handleChange}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 4,
          wordWrap: "on",
        }}
      />
    </div>
  );
}
