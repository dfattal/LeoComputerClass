"use client";

import Link from "next/link";
import GamePreview from "./GamePreview";
import type { JsPreviewConfig } from "@/lib/lessons/loadLesson";

/**
 * Full-screen public player for a shared Game Studio game (/arcade/[id]). No
 * editor, no auth — just the title, the live game (the student's saved code run
 * through GamePreview), and a footer back to the class. `generation` is fixed at
 * 1 so the game compiles + runs once on mount.
 */
export default function ArcadePlayer({
  title,
  code,
  preview,
  classSlug,
  className,
}: {
  title: string;
  code: string;
  preview: JsPreviewConfig;
  classSlug: string;
  className: string;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-gradient-to-b from-stone-950 to-stone-900 p-4 text-stone-100">
      <header className="text-center">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-stone-400">
          {preview.keys?.length
            ? "Click the game, then use your arrow keys to play."
            : "Press Restart to play again."}
        </p>
      </header>

      <div className="w-full max-w-[560px] overflow-hidden rounded-xl border border-stone-700 shadow-2xl">
        {/* GamePreview is self-contained: it compiles `code`, runs the loop, and
            owns Play/Pause/Restart + the error overlay. generation=1 → run once. */}
        <div className="h-[420px]">
          <GamePreview code={code} config={preview} generation={1} />
        </div>
      </div>

      <footer className="text-center text-sm text-stone-400">
        Made with{" "}
        <Link
          href={`/classes/${classSlug}`}
          className={`font-semibold ${className} hover:underline`}
        >
          Leo&apos;s Game Studio
        </Link>{" "}
        — build your own game in code. 🎮
      </footer>
    </div>
  );
}
