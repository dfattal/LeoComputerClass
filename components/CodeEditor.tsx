"use client";

import { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import type { Monaco } from "@monaco-editor/react";

const DEFAULT_STARTER = `# Write your code here\n`;
const DEFAULT_LATEX_STARTER = `% Write your LaTeX here\n`;
const DEFAULT_JS_STARTER = `// Write your code here\n`;

/**
 * Monaco has no built-in LaTeX mode, so register a small one: enough to color
 * commands, math delimiters, comments, and our `%% exercise` markers — and to
 * auto-close braces/$ while a kid types.
 */
function ensureLatexLanguage(monaco: Monaco) {
  if (monaco.languages.getLanguages().some((l: { id: string }) => l.id === "latex"))
    return;
  monaco.languages.register({ id: "latex" });
  monaco.languages.setMonarchTokensProvider("latex", {
    defaultToken: "",
    tokenizer: {
      root: [
        [/%%.*$/, "type.identifier"], // exercise marker lines
        [/%.*$/, "comment"],
        [/\\[a-zA-Z]+/, "keyword"],
        [/\\./, "keyword"],
        [/\$\$?/, "string"],
        [/[{}()[\]]/, "@brackets"],
        [/[\^_&=+\-*/!|]/, "operator"],
        [/\d+(\.\d+)?/, "number"],
      ],
    },
  });
  monaco.languages.setLanguageConfiguration("latex", {
    comments: { lineComment: "%" },
    brackets: [
      ["{", "}"],
      ["[", "]"],
      ["(", ")"],
    ],
    autoClosingPairs: [
      { open: "{", close: "}" },
      { open: "[", close: "]" },
      { open: "(", close: ")" },
      { open: "$", close: "$" },
    ],
  });
}

export default function CodeEditor({
  classSlug,
  lessonSlug,
  onChange,
  fallbackCode,
  starterCode,
  resetKey,
  language = "python",
}: {
  classSlug: string;
  lessonSlug: string;
  onChange: (code: string) => void;
  fallbackCode?: string;
  starterCode?: string;
  resetKey?: number;
  language?: "python" | "latex" | "javascript";
}) {
  const storageKey = `code-draft-${classSlug}-${lessonSlug}`;
  const defaultStarter =
    language === "latex"
      ? DEFAULT_LATEX_STARTER
      : language === "javascript"
        ? DEFAULT_JS_STARTER
        : DEFAULT_STARTER;
  const [code, setCode] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    const initial = saved || fallbackCode || starterCode || defaultStarter;
    setCode(initial);
    onChange(initial);
    setMounted(true);
  }, [storageKey, onChange, fallbackCode, starterCode, defaultStarter]);

  // Reset editor to starter code when resetKey changes
  useEffect(() => {
    if (resetKey === undefined || resetKey === 0) return;
    const initial = starterCode || defaultStarter;
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
        language={language}
        beforeMount={language === "latex" ? ensureLatexLanguage : undefined}
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
