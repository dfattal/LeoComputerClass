"use client";

import { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";

const STARTER_CODE = `# Write your code here

def AND(a, b):
    pass

def OR(a, b):
    pass

def NOT(a):
    pass

def XOR(a, b):
    pass

# Test your functions
print("AND(1,1) =", AND(1,1))
print("OR(0,1) =", OR(0,1))
print("NOT(0) =", NOT(0))
`;

export default function CodeEditor({
  weekSlug,
  onChange,
  fallbackCode,
}: {
  weekSlug: string;
  onChange: (code: string) => void;
  fallbackCode?: string;
}) {
  const storageKey = `code-draft-${weekSlug}`;
  const [code, setCode] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    const initial = saved || fallbackCode || STARTER_CODE;
    setCode(initial);
    onChange(initial);
    setMounted(true);
  }, [storageKey, onChange, fallbackCode]);

  function handleChange(value: string | undefined) {
    const newCode = value || "";
    setCode(newCode);
    localStorage.setItem(storageKey, newCode);
    onChange(newCode);
  }

  if (!mounted) {
    return (
      <div className="flex h-full items-center justify-center border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
        <span className="text-sm text-zinc-500">Loading editor...</span>
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
