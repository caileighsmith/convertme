"use client";

import { Icon } from "@/components/ui/Icon";
import type { SessionResult, CurriculumItem } from "@/types/fluency";

interface Props {
  result: SessionResult;
  curriculum: CurriculumItem[];
  streak: number;
  onContinue: () => void;
  onPracticeAgain: () => void;
  onBack: () => void;
}

const EXERCISE_ROWS = [
  { label: "Word tap", key: "word_tap" },
  { label: "Chunk read-along", key: "chunk_read_along" },
  { label: "Word order", key: "word_order" },
  { label: "Speed read", key: "speed_read" },
];

// Approximate counts from 10-exercise session: 3,3,2,2
const EXERCISE_COUNTS: Record<string, number> = {
  word_tap: 3,
  chunk_read_along: 3,
  word_order: 2,
  speed_read: 2,
};

export function SessionSummary({ result, curriculum, streak, onContinue, onPracticeAgain, onBack }: Props) {
  const currentItem = curriculum.find((c) => c.id === result.prayer_id);
  const nextItem = result.next_prayer_id
    ? curriculum.find((c) => c.id === result.next_prayer_id)
    : null;

  const accuracyPct = Math.round(result.accuracy * 100);
  const correctCount = Math.round(result.accuracy * 10);
  const totalWords = 12; // approximate for now

  return (
    <div className="bg-parchment-100 h-screen flex flex-col overflow-hidden">
      {/* Shell header */}
      <header className="h-14 flex-shrink-0 border-b border-parchment-400 grid grid-cols-[auto_1fr_auto] gap-6 items-center px-7">
        <div className="inline-flex items-center gap-1.5 font-ui text-sm text-navy-800">
          <span className="w-5 h-5 rounded-full bg-gold-400 text-parchment-50 grid place-items-center">
            <Icon name="check" size={10} color="#fbf8f0" />
          </span>
          Session complete
        </div>
        <span className="font-ui text-sm text-navy-700 text-center truncate">
          {currentItem?.en ?? result.prayer_id}
        </span>
        <div className="flex items-center gap-1 bg-gold-400/10 text-gold-400 rounded-full px-2.5 py-1 font-ui text-xs font-medium">
          <Icon name="flame" size={12} color="#a8651f" />
          {streak}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-[720px] mx-auto px-6 py-14">
          {/* Eyebrow + heading */}
          <p className="font-ui text-[11px] uppercase tracking-[0.14em] text-navy-700 mb-3">
            Six minutes well spent
          </p>
          <h1
            className="font-heading font-normal tracking-tight text-navy-900 mb-4"
            style={{ fontSize: "clamp(38px, 5vw, 52px)", lineHeight: 1.1 }}
          >
            {result.passed ? "You passed." : "Good effort."}
          </h1>
          <p className="font-ui text-base text-navy-800 mb-10 leading-relaxed">
            {result.passed
              ? nextItem
                ? `${currentItem?.en ?? "This prayer"} is now complete. The next prayer — ${nextItem.en} — has unlocked.`
                : `${currentItem?.en ?? "This prayer"} is now complete. You've finished all prayers in the curriculum.`
              : `${accuracyPct}% accuracy. You need 75% to unlock the next prayer. Keep going — you'll get there.`}
          </p>

          {/* Stats strip */}
          <div className="border border-parchment-400 rounded-[14px] overflow-hidden grid grid-cols-2 sm:grid-cols-4 mb-10">
            {[
              { value: `${accuracyPct}%`, label: "accuracy", sub: "above 75% threshold" },
              { value: "10", label: "exercises", sub: `${correctCount} correct on first try` },
              { value: String(totalWords), label: "words", sub: "encountered this session" },
              { value: String(result.speed_level), label: "pace level", sub: `Speed Read level ${result.speed_level}` },
            ].map((stat, i) => (
              <div
                key={i}
                className={`p-5 ${i % 2 === 0 ? "border-r border-parchment-400" : ""} ${i < 2 ? "border-b border-parchment-400" : ""} sm:border-b-0 ${i === 0 ? "" : ""}`}
              >
                <div className="font-heading text-[32px] font-normal text-navy-900 leading-none mb-1">
                  {stat.value}
                </div>
                <div className="font-ui text-xs font-semibold text-navy-800 uppercase tracking-[0.1em] mb-0.5">
                  {stat.label}
                </div>
                <div className="font-ui text-xs text-navy-700">{stat.sub}</div>
              </div>
            ))}
          </div>

          {/* Exercise breakdown */}
          <div className="mb-10">
            <p className="font-ui text-[11px] uppercase tracking-[0.14em] text-navy-700 mb-4">
              Exercise breakdown
            </p>
            <div className="flex flex-col gap-3">
              {EXERCISE_ROWS.map((row) => {
                const count = EXERCISE_COUNTS[row.key] ?? 2;
                const fillPct = result.passed ? Math.round(result.accuracy * 100) : Math.round(result.accuracy * 80);
                return (
                  <div key={row.key} className="grid grid-cols-[1fr_auto] gap-4 items-center">
                    <div>
                      <div className="font-ui text-sm text-navy-800 mb-1.5">{row.label}</div>
                      <div className="h-1.5 bg-parchment-400 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-navy-900 rounded-full"
                          style={{ width: `${fillPct}%` }}
                        />
                      </div>
                    </div>
                    <span className="font-ui text-xs text-navy-700 tabular-nums shrink-0">
                      {count} exercises
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Encouragement quote */}
          <blockquote className="text-center max-w-[540px] mx-auto mb-10">
            <p className="font-heading italic text-[22px] text-navy-800 leading-relaxed">
              &ldquo;The hardest letter to learn is the last one you didn&apos;t quite get.&rdquo;
            </p>
            <p className="font-ui text-sm text-navy-700 mt-2">
              — back tomorrow if you can.
            </p>
          </blockquote>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-center mb-6">
            <button
              onClick={onPracticeAgain}
              className="px-5 py-3 rounded-lg border border-parchment-500 font-ui text-sm font-medium text-navy-900 hover:bg-parchment-200 transition-colors"
            >
              Practise this again
            </button>
            {result.passed && nextItem && (
              <button
                onClick={onContinue}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-navy-900 text-parchment-50 font-ui text-sm font-medium hover:bg-navy-900/90 transition-colors"
              >
                Continue to {nextItem.en}
                <Icon name="arrowR" size={14} color="#f5f1e7" />
              </button>
            )}
          </div>

          <div className="text-center">
            <button
              onClick={onBack}
              className="font-ui text-sm text-navy-700 hover:text-navy-900 underline underline-offset-2 transition-colors"
            >
              Back to the curriculum
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
