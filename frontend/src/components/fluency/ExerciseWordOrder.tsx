"use client";

import { useState, useMemo } from "react";
import { Icon } from "@/components/ui/Icon";

interface WordItem {
  he: string;
  tr: string;
}

interface WordOrderPayload {
  phrase: { he: string; words: WordItem[] };
  shuffled: WordItem[];
  translation: string;
}

interface Props {
  payload: WordOrderPayload;
  onAnswer: (correct: boolean) => void;
}

export function ExerciseWordOrder({ payload, onAnswer }: Props) {
  const correctWords = payload.phrase.words;

  const initialBank = useMemo(
    () =>
      payload.shuffled.map((w, i) => ({ ...w, bankId: i })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const [placed, setPlaced] = useState<(WordItem & { bankId: number })[]>([]);
  const [bank, setBank] = useState<(WordItem & { bankId: number })[]>(initialBank);
  const [checked, setChecked] = useState(false);

  const allPlaced = placed.length === correctWords.length;

  function placeWord(item: (typeof bank)[0]) {
    if (checked) return;
    setBank((prev) => prev.filter((w) => w.bankId !== item.bankId));
    setPlaced((prev) => [...prev, item]);
  }

  function returnWord(item: (typeof placed)[0]) {
    if (checked) return;
    setPlaced((prev) => prev.filter((w) => w.bankId !== item.bankId));
    setBank((prev) => [...prev, item]);
  }

  function clearAll() {
    setPlaced([]);
    setBank(initialBank);
  }

  function check() {
    const isCorrect = placed.every((w, i) => w.he === correctWords[i]?.he);
    setChecked(true);
    setTimeout(() => onAnswer(isCorrect), 600);
  }

  return (
    <div className="w-full max-w-[720px] mx-auto flex flex-col">
      <p className="font-ui text-[11px] uppercase tracking-[0.14em] text-navy-700 mb-3">
        Reconstruct · in order
      </p>
      <h2 className="font-heading text-[clamp(22px,5vw,32px)] font-normal tracking-tight text-navy-900 mb-1.5">
        Build the blessing.
      </h2>
      <p className="font-ui text-base italic text-navy-800 mb-7">
        {payload.translation}
      </p>

      {/* Drop zone */}
      <div
        className="bg-parchment-50 border-[1.5px] border-dashed border-parchment-500 rounded-[14px] p-4 sm:p-8 min-h-[110px] sm:min-h-[140px] mb-7 sm:mb-9 flex flex-wrap gap-2 sm:gap-2.5 justify-end items-center"
        dir="rtl"
      >
        {placed.map((w) => (
          <button
            key={w.bankId}
            onClick={() => returnWord(w)}
            disabled={checked}
            className="bg-navy-900 text-parchment-50 rounded-xl px-3 py-2 sm:px-[18px] sm:py-2.5 hover:bg-navy-900/80 transition-colors focus:outline-none"
          >
            <span className="font-hebrew text-[22px] sm:text-[26px]" lang="he">{w.he}</span>
            <span className="block font-ui italic text-[10px] sm:text-[11px] text-parchment-50/70 mt-0.5">{w.tr}</span>
          </button>
        ))}
        {/* Empty slots */}
        {Array.from({ length: correctWords.length - placed.length }).map((_, i) => (
          <div
            key={`slot-${i}`}
            className="min-w-[72px] sm:min-w-[92px] h-12 sm:h-14 border border-dashed border-parchment-500 rounded-xl"
          />
        ))}
      </div>

      {/* Word bank */}
      <p className="font-ui text-[11px] uppercase tracking-[0.14em] text-navy-700 mb-3">
        Word bank
      </p>
      <div className="flex flex-wrap gap-2 sm:gap-2.5 justify-center" dir="rtl">
        {bank.map((w) => (
          <button
            key={w.bankId}
            onClick={() => placeWord(w)}
            disabled={checked}
            className="bg-parchment-100 border border-parchment-500 rounded-xl px-3 py-2 sm:px-[18px] sm:py-2.5 hover:bg-parchment-200 transition-colors focus:outline-none"
          >
            <span className="font-hebrew text-[22px] sm:text-[26px] text-navy-900" lang="he">{w.he}</span>
            <span className="block font-ui italic text-[10px] sm:text-[11px] text-navy-700 mt-0.5">{w.tr}</span>
          </button>
        ))}
      </div>

      {/* Footer controls */}
      <div className="flex items-center justify-between mt-9 pt-6 border-t border-parchment-400">
        <button
          onClick={clearAll}
          disabled={checked || placed.length === 0}
          className="px-4 py-2 rounded-lg border border-parchment-500 font-ui text-sm text-navy-800 hover:bg-parchment-100 transition-colors disabled:opacity-40 focus:outline-none"
        >
          Clear
        </button>
        <p className="font-ui text-sm text-navy-700">
          {placed.length} of {correctWords.length} placed
        </p>
        <button
          onClick={check}
          disabled={!allPlaced || checked}
          className="px-5 py-2.5 rounded-lg bg-navy-900 text-parchment-50 font-ui text-sm font-medium hover:bg-navy-900/90 transition-colors disabled:opacity-40 inline-flex items-center gap-2 focus:outline-none"
        >
          Check <Icon name="check" size={14} color="#f5f1e7" />
        </button>
      </div>
    </div>
  );
}
