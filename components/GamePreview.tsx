"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { JsPreviewConfig } from "@/lib/lessons/loadLesson";

/**
 * Live game canvas for "javascript" lessons (Game Studio) — the JS analog of
 * LinePlot / PixelCanvas. It runs the student's OWN code on the main thread
 * (canvas drawing needs it) and drives a requestAnimationFrame loop: each frame
 * it calls the student's `update(state, input)` then `render(ctx, state)`, per the
 * lesson's js.json `preview` config.
 *
 * It (re)compiles only when `generation` changes — i.e. when the student clicks
 * Run — so a half-typed `while(true)` can't freeze the tab on every keystroke,
 * and a Play/Pause/Restart bar lets them stop a runaway frame and reload.
 */
export default function GamePreview({
  code,
  config,
  generation,
  title,
}: {
  code: string;
  config: JsPreviewConfig;
  generation: number;
  title?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const stateRef = useRef<unknown>(undefined);
  const inputRef = useRef<{
    keys: Record<string, boolean>;
    mouseX: number;
    mouseY: number;
    mouseDown: boolean;
    width: number;
    height: number;
    frame: number;
  }>({
    keys: {},
    mouseX: 0,
    mouseY: 0,
    mouseDown: false,
    width: config.width ?? 480,
    height: config.height ?? 360,
    frame: 0,
  });
  const fnsRef = useRef<{
    update?: (state: unknown, input: unknown) => unknown;
    render?: (ctx: CanvasRenderingContext2D, state: unknown) => void;
  }>({});
  const lastStepRef = useRef(0);

  const [error, setError] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  // The rAF loop reads pausedRef (not the state) so toggling pause never
  // recreates the loop. Mirror the state into it from an effect.
  const pausedRef = useRef(false);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  const W = config.width ?? 480;
  const H = config.height ?? 360;
  const fps = config.fps ?? 60;

  const stop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  // Compile the student's code (+ optional setup prelude) and pull out the named
  // init/update/render functions. Returns null + sets an error on a parse error.
  const compile = useCallback(() => {
    const names: Record<string, string | undefined> = {
      init: config.init,
      update: config.update,
      render: config.render,
    };
    const wanted = Object.values(names).filter(Boolean) as string[];
    const exports = wanted
      .map(
        (n) =>
          `${JSON.stringify(n)}: (typeof ${n} !== "undefined" ? ${n} : undefined)`
      )
      .join(", ");
    const setup = config.setup ? `\n${config.setup}\n` : "";
    const body = `"use strict";\n${code}\n${setup}\n;return { ${exports} };`;
    try {
      // eslint-disable-next-line no-new-func
      const factory = new Function(body);
      const out = factory() as Record<string, unknown>;
      const get = (key: keyof typeof names) => {
        const fnName = names[key];
        return fnName ? (out[fnName] as undefined | ((...a: unknown[]) => unknown)) : undefined;
      };
      return {
        init: get("init"),
        update: get("update") as
          | ((s: unknown, i: unknown) => unknown)
          | undefined,
        render: get("render") as
          | ((c: CanvasRenderingContext2D, s: unknown) => void)
          | undefined,
      };
    } catch (e) {
      setError(friendly(e));
      return null;
    }
  }, [code, config.init, config.update, config.render, config.setup]);

  const start = useCallback(() => {
    stop();
    setError(null);
    setPaused(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const compiled = compile();
    if (!compiled) return;
    fnsRef.current = { update: compiled.update, render: compiled.render };

    // Fresh input + initial state.
    inputRef.current = {
      keys: {},
      mouseX: 0,
      mouseY: 0,
      mouseDown: false,
      width: W,
      height: H,
      frame: 0,
    };
    try {
      stateRef.current = compiled.init
        ? compiled.init(...((config.initArgs as unknown[]) ?? []))
        : {};
    } catch (e) {
      setError(friendly(e));
      return;
    }

    // First paint (also the whole picture for a "still" lesson).
    if (compiled.render) {
      try {
        ctx.clearRect(0, 0, W, H);
        compiled.render(ctx, stateRef.current);
      } catch (e) {
        setError(friendly(e));
        return;
      }
    }
    if (config.still || !compiled.update) return; // no loop needed

    const stepMs = 1000 / fps;
    lastStepRef.current = 0;
    const frame = (t: number) => {
      rafRef.current = requestAnimationFrame(frame);
      if (pausedRef.current) return;
      if (t - lastStepRef.current < stepMs) return;
      lastStepRef.current = t;
      const input = inputRef.current;
      input.frame++;
      try {
        if (fnsRef.current.update) {
          const next = fnsRef.current.update(stateRef.current, input);
          if (next !== undefined) stateRef.current = next;
        }
        if (fnsRef.current.render) {
          ctx.clearRect(0, 0, W, H);
          fnsRef.current.render(ctx, stateRef.current);
        }
      } catch (e) {
        setError(friendly(e));
        stop();
      }
    };
    rafRef.current = requestAnimationFrame(frame);
  }, [compile, stop, W, H, fps, config.initArgs, config.still]);

  // (Re)start whenever the student clicks Run (generation bump) or the canvas
  // first mounts.
  useEffect(() => {
    start();
    return stop;
  }, [generation, start, stop]);

  // Keyboard + mouse → the live `input` object the student's update reads.
  useEffect(() => {
    const tracked = config.keys;
    const onKey = (down: boolean) => (e: KeyboardEvent) => {
      if (tracked && !tracked.includes(e.key)) return;
      // Stop arrows/space from scrolling the page while playing.
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(e.key))
        e.preventDefault();
      inputRef.current.keys[e.key] = down;
    };
    const kd = onKey(true);
    const ku = onKey(false);
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    return () => {
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
    };
  }, [config.keys]);

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    inputRef.current.mouseX = ((e.clientX - rect.left) / rect.width) * W;
    inputRef.current.mouseY = ((e.clientY - rect.top) / rect.height) * H;
  };

  return (
    <div className="flex h-full flex-col bg-stone-50 dark:bg-stone-900">
      {title && (
        <div className="border-b border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-500 dark:border-stone-800 dark:text-stone-400">
          {title}
        </div>
      )}
      <div className="flex min-h-0 flex-1 items-center justify-center p-3">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          onMouseMove={onMouseMove}
          onMouseDown={() => (inputRef.current.mouseDown = true)}
          onMouseUp={() => (inputRef.current.mouseDown = false)}
          tabIndex={0}
          className="max-h-full max-w-full rounded-lg border border-stone-300 bg-black shadow-sm dark:border-stone-700"
          style={{ imageRendering: "pixelated", aspectRatio: `${W} / ${H}` }}
        />
      </div>

      {error ? (
        <div className="mx-3 mb-3 rounded-md border border-red-300 bg-red-50 p-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          <span className="font-semibold">Your game hit a snag: </span>
          {error}
        </div>
      ) : (
        config.caption && (
          <p className="mx-3 mb-2 text-center text-xs text-stone-500 dark:text-stone-400">
            {config.caption}
          </p>
        )
      )}

      {!config.still && config.update && (
        <div className="flex items-center justify-center gap-2 border-t border-stone-200 px-3 py-1.5 dark:border-stone-800">
          <button
            onClick={() => setPaused((p) => !p)}
            className="rounded px-2 py-1 text-xs font-medium text-stone-600 hover:bg-stone-200 dark:text-stone-300 dark:hover:bg-stone-800"
          >
            {paused ? "▶ Play" : "⏸ Pause"}
          </button>
          <button
            onClick={start}
            className="rounded px-2 py-1 text-xs font-medium text-stone-600 hover:bg-stone-200 dark:text-stone-300 dark:hover:bg-stone-800"
          >
            ↻ Restart
          </button>
          <span className="text-[11px] text-stone-400">
            Click the game, then use your keys
          </span>
        </div>
      )}
    </div>
  );
}

function friendly(e: unknown): string {
  if (e instanceof Error) {
    if (e.name === "ReferenceError")
      return `${e.message} — check your spelling (capital letters matter!).`;
    if (e.name === "SyntaxError")
      return `There's a typo JavaScript can't read (${e.message}).`;
    return `${e.name}: ${e.message}`;
  }
  return String(e);
}
