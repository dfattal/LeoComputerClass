"use client";

const BASE_COLORS: Record<string, { bg: string; text: string }> = {
  A: { bg: "bg-green-400 dark:bg-green-500", text: "text-green-950" },
  T: { bg: "bg-red-400 dark:bg-red-500", text: "text-red-950" },
  C: { bg: "bg-blue-400 dark:bg-blue-500", text: "text-blue-950" },
  G: { bg: "bg-amber-400 dark:bg-amber-500", text: "text-amber-950" },
  U: { bg: "bg-pink-400 dark:bg-pink-500", text: "text-pink-950" },
};

interface DNAStrandProps {
  sequence: string;
  label?: string;
  highlightStart?: number;
  highlightEnd?: number;
  highlightColor?: string;
  showCut?: boolean;
  cutStart?: number;
  cutEnd?: number;
  size?: "sm" | "md" | "lg";
}

export default function DNAStrand({
  sequence,
  label,
  highlightStart,
  highlightEnd,
  highlightColor = "ring-violet-400",
  showCut = false,
  cutStart,
  cutEnd,
  size = "md",
}: DNAStrandProps) {
  const sizeClasses = {
    sm: "h-6 w-6 text-[10px]",
    md: "h-8 w-8 text-xs",
    lg: "h-10 w-10 text-sm",
  };

  const bases = sequence.toUpperCase().split("");

  return (
    <div>
      {label && (
        <p className="mb-1.5 text-xs font-medium text-stone-400">{label}</p>
      )}
      <div className="flex flex-wrap gap-0.5">
        {bases.map((base, i) => {
          const colors = BASE_COLORS[base] ?? {
            bg: "bg-stone-300",
            text: "text-stone-700",
          };

          const isHighlighted =
            highlightStart !== undefined &&
            highlightEnd !== undefined &&
            i >= highlightStart &&
            i < highlightEnd;

          const isCutLeft =
            showCut && cutStart !== undefined && i === cutStart;
          const isCutRight =
            showCut && cutEnd !== undefined && i === cutEnd;

          // Add gap at cut points
          const cutGapLeft = isCutLeft ? "ml-1.5" : "";
          const cutGapRight = isCutRight ? "mr-1.5" : "";

          return (
            <div
              key={i}
              className={`
                ${sizeClasses[size]}
                ${colors.bg} ${colors.text}
                ${cutGapLeft} ${cutGapRight}
                flex items-center justify-center rounded-sm font-mono font-bold
                transition-all duration-300
                ${isHighlighted ? `ring-2 ${highlightColor} scale-110 z-10` : ""}
              `}
            >
              {base}
            </div>
          );
        })}
      </div>
    </div>
  );
}
