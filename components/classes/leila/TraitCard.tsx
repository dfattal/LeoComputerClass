"use client";

interface TraitCardProps {
  title: string;
  traitsBefore: Record<string, string>;
  traitsAfter?: Record<string, string>;
}

const TRAIT_EMOJIS: Record<string, string> = {
  fur: "\u{1F43E}",
  eyes: "\u{1F441}",
  tail: "\u{1F9A8}",
  size: "\u{1F4CF}",
  speed: "\u{26A1}",
  color: "\u{1F3A8}",
  teeth: "\u{1F9B7}",
  wings: "\u{1FAB6}",
  spots: "\u{1F535}",
  glow: "\u{2728}",
};

function TraitRow({ name, value }: { name: string; value: string }) {
  const emoji = TRAIT_EMOJIS[name.toLowerCase()] ?? "\u{1F9EC}";
  return (
    <div className="flex items-center gap-2 text-sm">
      <span>{emoji}</span>
      <span className="font-medium capitalize text-stone-600 dark:text-stone-300">
        {name}:
      </span>
      <span className="text-stone-800 dark:text-stone-100">{value}</span>
    </div>
  );
}

export default function TraitCard({
  title,
  traitsBefore,
  traitsAfter,
}: TraitCardProps) {
  const showComparison = traitsAfter !== undefined;

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-800">
      <h4 className="mb-3 text-sm font-bold text-stone-700 dark:text-stone-200">
        {title}
      </h4>

      {showComparison ? (
        <div className="grid grid-cols-2 gap-4">
          {/* Before */}
          <div className="rounded-lg bg-red-50 p-3 dark:bg-red-950/30">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-red-500">
              Before
            </p>
            <div className="space-y-1.5">
              {Object.entries(traitsBefore).map(([name, value]) => (
                <TraitRow key={name} name={name} value={value} />
              ))}
            </div>
          </div>

          {/* After */}
          <div className="rounded-lg bg-green-50 p-3 dark:bg-green-950/30">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-green-500">
              After
            </p>
            <div className="space-y-1.5">
              {Object.entries(traitsAfter).map(([name, value]) => {
                const changed = traitsBefore[name] !== value;
                return (
                  <div key={name} className="flex items-center gap-2 text-sm">
                    <span>
                      {TRAIT_EMOJIS[name.toLowerCase()] ?? "\u{1F9EC}"}
                    </span>
                    <span className="font-medium capitalize text-stone-600 dark:text-stone-300">
                      {name}:
                    </span>
                    <span
                      className={
                        changed
                          ? "font-bold text-green-700 dark:text-green-300"
                          : "text-stone-800 dark:text-stone-100"
                      }
                    >
                      {value}
                      {changed && " \u2728"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-1.5">
          {Object.entries(traitsBefore).map(([name, value]) => (
            <TraitRow key={name} name={name} value={value} />
          ))}
        </div>
      )}
    </div>
  );
}
