"use client";

export const JOURNEY_STAGES = [
  { label: "Just exploring",           sub: "Reading, asking questions, no rabbi yet" },
  { label: "Working with a rabbi",     sub: "In a formal conversion programme" },
  { label: "Approaching the beit din", sub: "Final months before mikveh" },
  { label: "Already converted",        sub: "Practising and learning more" },
];

export const TRADITIONS = [
  "Reform",
  "Conservative / Masorti",
  "Modern Orthodox",
  "Sephardi",
  "Reconstructionist",
  "Not sure yet",
];

const HEBREW_LABELS = [
  { at: 0,   label: "I recognise a few letters" },
  { at: 25,  label: "I know the alphabet, sounding out is slow" },
  { at: 50,  label: "I can read prayers with effort" },
  { at: 75,  label: "I read confidently but slowly" },
  { at: 100, label: "Fluent" },
];

export function hebrewLabel(level: number): string {
  return HEBREW_LABELS.reduce((prev, curr) =>
    Math.abs(curr.at - level) < Math.abs(prev.at - level) ? curr : prev
  ).label;
}

export function RadioCard({
  label, sub, selected, onClick,
}: {
  label: string; sub: string; selected: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-left w-full transition-colors ${
        selected
          ? "bg-parchment-50 border border-navy-900"
          : "bg-transparent border border-parchment-400 hover:border-parchment-500"
      }`}
    >
      <span
        className="flex-shrink-0 rounded-full bg-parchment-50"
        style={{
          width: 18, height: 18,
          border: selected ? "5px solid #1a1612" : "1.5px solid #cfc6ad",
        }}
      />
      <div className="flex-1">
        <div className="font-ui text-sm font-semibold text-navy-900 tracking-tight">{label}</div>
        <div className="font-ui text-[13px] text-navy-700 mt-0.5">{sub}</div>
      </div>
    </button>
  );
}

export function Pill({
  label, selected, onClick,
}: {
  label: string; selected: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-full font-ui text-sm font-medium tracking-tight transition-colors ${
        selected
          ? "bg-navy-900 text-parchment-50 border border-navy-900"
          : "bg-transparent text-navy-900 border border-parchment-500 hover:border-navy-800"
      }`}
    >
      {label}
    </button>
  );
}

export function HebrewSlider({
  value, onChange,
}: {
  value: number; onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="grid grid-cols-[auto_1fr_auto] gap-4 items-center">
        <span className="font-ui text-xs text-navy-700 whitespace-nowrap">Brand new</span>
        <div className="relative h-1.5 rounded-full bg-parchment-400">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-navy-900"
            style={{ width: `${value}%` }}
          />
          <div
            className="absolute w-5 h-5 rounded-full bg-parchment-50 border-[1.5px] border-navy-900 shadow-sm pointer-events-none"
            style={{ left: `${value}%`, top: "50%", transform: "translate(-50%, -50%)" }}
          />
          <input
            type="range"
            min={0}
            max={100}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
          />
        </div>
        <span className="font-ui text-xs text-navy-700">Fluent</span>
      </div>
      <p className="font-ui text-xs text-navy-700 italic mt-3">
        ~ &ldquo;{hebrewLabel(value)}&rdquo;
      </p>
    </div>
  );
}
