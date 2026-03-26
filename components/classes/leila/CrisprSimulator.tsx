"use client";

import { useState, useEffect, useCallback } from "react";
import DNAStrand from "./DNAStrand";
import TraitCard from "./TraitCard";

export interface CrisprScenario {
  title: string;
  mission: string;
  dna: string;
  target: string;
  replacement: string;
  traitsBefore?: Record<string, string>;
  traitsAfter?: Record<string, string>;
}

type SimStep = "original" | "target-found" | "cut" | "replace" | "result";

const STEPS: { key: SimStep; label: string }[] = [
  { key: "original", label: "Original DNA" },
  { key: "target-found", label: "Target Found" },
  { key: "cut", label: "Cut" },
  { key: "replace", label: "Insert Replacement" },
  { key: "result", label: "Edited DNA" },
];

export default function CrisprSimulator({
  scenario,
  studentResult,
}: {
  scenario: CrisprScenario;
  studentResult?: string;
}) {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const { dna, target, replacement, traitsBefore, traitsAfter } = scenario;
  const targetIdx = dna.indexOf(target);
  const hasTarget = targetIdx >= 0;

  // Build the edited DNA
  const editedDna = hasTarget
    ? dna.slice(0, targetIdx) + replacement + dna.slice(targetIdx + target.length)
    : dna;

  // Check if student got it right
  const studentCorrect =
    studentResult !== undefined && studentResult === editedDna;

  const step = STEPS[currentStep].key;

  // Auto-play through steps
  useEffect(() => {
    if (!isPlaying) return;
    if (currentStep >= STEPS.length - 1) {
      setIsPlaying(false);
      return;
    }
    const timer = setTimeout(() => {
      setCurrentStep((s) => s + 1);
    }, 1200);
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep]);

  const handlePlay = useCallback(() => {
    setCurrentStep(0);
    setIsPlaying(true);
  }, []);

  const handleStepClick = useCallback((idx: number) => {
    setIsPlaying(false);
    setCurrentStep(idx);
  }, []);

  // Determine what DNA to show based on step
  let displaySequence = dna;
  let highlightStart: number | undefined;
  let highlightEnd: number | undefined;
  let showCut = false;
  let cutStart: number | undefined;
  let cutEnd: number | undefined;
  let highlightColor = "ring-violet-400";

  if (step === "target-found" && hasTarget) {
    highlightStart = targetIdx;
    highlightEnd = targetIdx + target.length;
    highlightColor = "ring-amber-400";
  } else if (step === "cut" && hasTarget) {
    highlightStart = targetIdx;
    highlightEnd = targetIdx + target.length;
    highlightColor = "ring-red-400";
    showCut = true;
    cutStart = targetIdx;
    cutEnd = targetIdx + target.length - 1;
  } else if (step === "replace") {
    displaySequence = editedDna;
    highlightStart = targetIdx;
    highlightEnd = targetIdx + replacement.length;
    highlightColor = "ring-green-400";
  } else if (step === "result") {
    displaySequence = editedDna;
  }

  // Step description
  const stepDescriptions: Record<SimStep, string> = {
    original: `This is the original DNA strand: ${dna.length} bases long.`,
    "target-found": hasTarget
      ? `The guide RNA found the target "${target}" at position ${targetIdx + 1}.`
      : `Target "${target}" was not found in the DNA!`,
    cut: hasTarget
      ? `CRISPR cuts the DNA on both sides of the target "${target}".`
      : "No cut — target not found.",
    replace: `The replacement "${replacement}" is inserted where "${target}" used to be.`,
    result: studentCorrect
      ? "The edit is complete! Your code got the right answer!"
      : studentResult
        ? `Edit complete. Expected "${editedDna}" but your code returned "${studentResult}".`
        : "The edit is complete! Run your code to check your answer.",
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-violet-200 bg-violet-50/50 p-4 dark:border-violet-800 dark:bg-violet-950/30">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-violet-800 dark:text-violet-200">
            {scenario.title}
          </h3>
          <p className="mt-0.5 text-xs text-violet-600 dark:text-violet-400">
            {scenario.mission}
          </p>
        </div>
        <button
          onClick={handlePlay}
          className="shrink-0 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-violet-700"
        >
          {isPlaying ? "Playing..." : "Play"}
        </button>
      </div>

      {/* Step indicators */}
      <div className="flex gap-1">
        {STEPS.map((s, i) => (
          <button
            key={s.key}
            onClick={() => handleStepClick(i)}
            className={`flex-1 rounded-md px-1.5 py-1 text-[10px] font-medium transition-all ${
              i === currentStep
                ? "bg-violet-600 text-white shadow-sm"
                : i < currentStep
                  ? "bg-violet-200 text-violet-700 dark:bg-violet-800 dark:text-violet-200"
                  : "bg-stone-100 text-stone-400 dark:bg-stone-800 dark:text-stone-500"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* DNA visualization */}
      <div className="rounded-lg bg-white p-3 dark:bg-stone-900">
        <DNAStrand
          sequence={displaySequence}
          label={STEPS[currentStep].label}
          highlightStart={highlightStart}
          highlightEnd={highlightEnd}
          highlightColor={highlightColor}
          showCut={showCut}
          cutStart={cutStart}
          cutEnd={cutEnd}
          size="lg"
        />

        {/* Step description */}
        <p className="mt-3 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
          {stepDescriptions[step]}
        </p>
      </div>

      {/* Comparison: original vs replacement (shown during replace/result steps) */}
      {(step === "replace" || step === "result") && hasTarget && (
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-red-50 p-2.5 dark:bg-red-950/30">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-red-400">
              Removed
            </p>
            <DNAStrand sequence={target} size="sm" />
          </div>
          <div className="rounded-lg bg-green-50 p-2.5 dark:bg-green-950/30">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-green-400">
              Inserted
            </p>
            <DNAStrand sequence={replacement} size="sm" />
          </div>
        </div>
      )}

      {/* Trait card (shown on result step) */}
      {step === "result" && traitsBefore && (
        <TraitCard
          title="Trait Impact"
          traitsBefore={traitsBefore}
          traitsAfter={traitsAfter}
        />
      )}

      {/* Student result check */}
      {step === "result" && studentResult !== undefined && (
        <div
          className={`rounded-lg p-3 text-sm font-medium ${
            studentCorrect
              ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200"
              : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
          }`}
        >
          {studentCorrect
            ? "Your code produced the correct edited DNA!"
            : `Expected "${editedDna}" but got "${studentResult}". Keep trying!`}
        </div>
      )}
    </div>
  );
}
