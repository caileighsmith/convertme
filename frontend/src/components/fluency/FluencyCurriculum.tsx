"use client";

import { Icon } from "@/components/ui/Icon";
import type { CurriculumItem } from "@/types/fluency";

interface Props {
  curriculum: CurriculumItem[];
  progress: {
    prayers_complete: number;
    day_streak: number;
    avg_accuracy: number;
    current_prayer_id: string | null;
    speed_level: number;
  } | null;
  onStart: (prayerId: string) => void;
}

export function FluencyCurriculum({ curriculum, progress, onStart }: Props) {
  const currentItem = curriculum.find(
    (c) => c.status === "current" || c.status === "unlocked"
  ) ?? curriculum.find((c) => c.id === progress?.current_prayer_id);

  const prayersComplete = progress?.prayers_complete ?? 0;
  const streak = progress?.day_streak ?? 0;
  const avgAccuracy = progress?.avg_accuracy ?? 0;
  const speedLevel = currentItem?.speed_level ?? progress?.speed_level ?? 1;

  return (
    <div className="bg-parchment-50 min-h-screen">
      {/* Hero */}
      <section className="px-6 sm:px-14 pt-11 pb-9 border-b border-parchment-400">
        <div className="max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-12 items-end">
          {/* Left */}
          <div>
            <p className="font-ui text-[11px] uppercase tracking-[0.14em] text-navy-700 mb-3">
              Hebrew Practice · Fluency Trainer
            </p>
            <h1 className="font-heading font-normal text-[clamp(32px,4vw,52px)] leading-[1.1] tracking-tight text-navy-900 mb-3.5 max-w-2xl">
              Pray the words<br />
              <em className="text-navy-800">until they land on their own.</em>
            </h1>
            <p className="font-ui text-base text-navy-800 max-w-[520px] leading-[1.55]">
              Five minutes a day on a fixed sequence. Each prayer unlocks the next at 75% accuracy.
            </p>
          </div>

          {/* Right: stats strip */}
          <div className="grid grid-cols-3 gap-0 border border-parchment-400 rounded-[14px] overflow-hidden bg-parchment-100">
            <div className="p-5 border-r border-parchment-400">
              <div className="font-heading text-[30px] font-normal text-navy-900 leading-none mb-1">
                {prayersComplete}/8
              </div>
              <div className="font-ui text-xs text-navy-700">prayers complete</div>
            </div>
            <div className="p-5 border-r border-parchment-400">
              <div className="flex items-center gap-1.5">
                <div className="font-heading text-[30px] font-normal text-navy-900 leading-none mb-1">
                  {streak}
                </div>
                {streak > 0 && <Icon name="flame" size={16} color="#a8651f" />}
              </div>
              <div className="font-ui text-xs text-navy-700">day streak</div>
            </div>
            <div className="p-5">
              <div className="font-heading text-[30px] font-normal text-navy-900 leading-none mb-1">
                {avgAccuracy > 0 ? `${Math.round(avgAccuracy * 100)}%` : "—"}
              </div>
              <div className="font-ui text-xs text-navy-700">avg accuracy</div>
            </div>
          </div>
        </div>
      </section>

      {/* Today's session CTA */}
      {currentItem && (
        <section className="px-6 sm:px-14 pt-9">
          <div className="max-w-[1100px] mx-auto bg-parchment-100 border border-parchment-400 rounded-[14px] p-7 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-5 items-center">
            <div>
              <p className="font-ui text-[11px] uppercase tracking-[0.14em] text-navy-700 mb-2">
                Today&apos;s session
              </p>
              <div className="flex items-baseline gap-3 flex-wrap mb-1">
                <span className="font-heading text-[22px] font-normal text-navy-900">
                  {currentItem.en}
                </span>
                <span
                  className="font-hebrew text-[20px] text-navy-700"
                  lang="he"
                  dir="rtl"
                >
                  {currentItem.he}
                </span>
              </div>
              <p className="font-ui text-sm text-navy-700">
                10 exercises · {currentItem.mins} · pace level {speedLevel} of 5
              </p>
            </div>
            <button
              onClick={() => onStart(currentItem.id)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-navy-900 text-parchment-50 font-ui text-sm font-medium hover:bg-navy-900/90 transition-colors shrink-0"
            >
              Start session <Icon name="arrowR" size={14} color="#f5f1e7" />
            </button>
          </div>
        </section>
      )}

      {/* Curriculum list */}
      <section className="px-6 sm:px-14 py-11">
        <div className="max-w-[1100px] mx-auto">
          <div className="flex items-baseline justify-between mb-7">
            <h2 className="font-heading text-[22px] font-normal tracking-tight text-navy-900">
              The path
            </h2>
            <p className="font-ui text-xs text-navy-700 hidden sm:block">
              Each prayer unlocks the next at 75% accuracy
            </p>
          </div>

          {/* Spine + rows */}
          <div className="relative">
            {/* Connecting spine */}
            <div className="absolute left-[23px] top-[26px] bottom-[26px] w-px bg-parchment-400" />

            <div className="flex flex-col gap-3">
              {curriculum.map((item) => (
                <CurriculumRow key={item.id} item={item} onStart={onStart} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function CurriculumRow({
  item,
  onStart,
}: {
  item: CurriculumItem;
  onStart: (id: string) => void;
}) {
  const isCurrent = item.status === "current" || item.status === "unlocked";
  const isComplete = item.status === "complete";
  const isLocked = item.status === "locked";

  return (
    <div
      className={`grid grid-cols-[40px_1fr] sm:grid-cols-[48px_1fr_auto] gap-x-3 sm:gap-x-5 gap-y-3 items-start p-3 sm:p-4 rounded-xl transition-colors ${
        isCurrent
          ? "bg-parchment-100 border border-gold-400/30"
          : "bg-transparent"
      }`}
    >
      {/* Stage marker */}
      <div className="flex justify-center pt-0.5">
        {isComplete ? (
          <div className="w-9 h-9 rounded-full bg-gold-400 text-white grid place-items-center shrink-0">
            <Icon name="check" size={14} color="#fff" />
          </div>
        ) : isCurrent ? (
          <div className="w-9 h-9 rounded-full bg-navy-900 text-parchment-50 grid place-items-center shrink-0 font-ui text-sm font-semibold">
            {item.stage}
          </div>
        ) : (
          <div className="w-9 h-9 rounded-full border border-parchment-400 text-navy-700 grid place-items-center shrink-0">
            <Icon name="lock" size={14} />
          </div>
        )}
      </div>

      {/* Body */}
      <div>
        <div className="flex items-baseline gap-2.5 flex-wrap mb-0.5">
          <span className="font-ui text-[15px] font-semibold tracking-tight text-navy-900">
            {item.en}
          </span>
          <span
            className="font-hebrew text-lg text-navy-700"
            lang="he"
            dir="rtl"
          >
            {item.he}
          </span>
          {isCurrent && (
            <span className="font-ui text-[10px] font-semibold uppercase tracking-[0.1em] text-gold-400 bg-gold-400/10 px-1.5 py-0.5 rounded">
              In progress
            </span>
          )}
        </div>
        <p className="font-ui text-sm text-navy-700 mb-2">{item.note}</p>

        {/* Progress bar */}
        {(isComplete || isCurrent) && (
          <div className="flex items-center gap-3 mt-2">
            <div className="w-36 h-1 bg-parchment-400 rounded-full overflow-hidden">
              <div
                className="h-full bg-navy-900 rounded-full"
                style={{
                  width: `${
                    item.accuracy != null ? Math.round(item.accuracy * 100) : 0
                  }%`,
                }}
              />
            </div>
            {item.accuracy != null && (
              <span className="font-ui text-xs text-navy-700 tabular-nums">
                {Math.round(item.accuracy * 100)}%
              </span>
            )}
            {item.sessions != null && (
              <span className="font-ui text-xs text-navy-700">
                {item.sessions} {item.sessions === 1 ? "session" : "sessions"}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action — hidden on mobile (button lives inline in body area via col-span) */}
      <div className="hidden sm:flex flex-col items-end gap-2 shrink-0 pt-0.5">
        <span className="font-ui text-xs text-navy-700">{item.mins}</span>
        {isCurrent ? (
          <button
            onClick={() => onStart(item.id)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-navy-900 text-parchment-50 font-ui text-sm font-medium hover:bg-navy-900/90 transition-colors"
          >
            Continue <Icon name="arrowR" size={13} color="#f5f1e7" />
          </button>
        ) : isComplete ? (
          <button
            onClick={() => onStart(item.id)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-parchment-500 font-ui text-sm text-navy-900 hover:bg-parchment-100 transition-colors"
          >
            Practise again
          </button>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 font-ui text-sm text-navy-700">
            <Icon name="lock" size={12} />
            Locked
          </div>
        )}
      </div>

      {/* Mobile action — sits below body in the second column */}
      {!isLocked && (
        <div className="sm:hidden col-start-2">
          {isCurrent ? (
            <button
              onClick={() => onStart(item.id)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-navy-900 text-parchment-50 font-ui text-sm font-medium hover:bg-navy-900/90 transition-colors"
            >
              Continue <Icon name="arrowR" size={13} color="#f5f1e7" />
            </button>
          ) : isComplete ? (
            <button
              onClick={() => onStart(item.id)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-parchment-500 font-ui text-sm text-navy-900 hover:bg-parchment-100 transition-colors"
            >
              Practise again
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
