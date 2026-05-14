"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";

interface TapOption {
  tr: string;
  en: string;
  correct: boolean;
}

interface WordTapPayload {
  phrase: { he: string; words: string[] };
  options: TapOption[];
}

interface Props {
  payload: WordTapPayload;
  onAnswer: (correct: boolean) => void;
}

const LABELS = ["A", "B", "C", "D"];

export function ExerciseWordTap({ payload, onAnswer }: Props) {
  const [selected, setSelected] = useState<number | null>(null);

  function speak() {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const utt = new SpeechSynthesisUtterance(payload.phrase.he);
      utt.lang = "he";
      window.speechSynthesis.speak(utt);
    }
  }

  function handleSelect(idx: number) {
    if (selected !== null) return;
    setSelected(idx);
    const isCorrect = payload.options[idx].correct;
    setTimeout(() => onAnswer(isCorrect), 400);
  }

  return (
    <div className="w-full max-w-[720px] mx-auto flex flex-col">
      {/* Eyebrow */}
      <p className="font-ui text-[11px] uppercase tracking-[0.14em] text-navy-700 mb-3">
        Word tap · recognition
      </p>
      <h2 className="font-heading text-[clamp(22px,5vw,32px)] font-normal tracking-tight text-navy-900 mb-1.5">
        Which one says this?
      </h2>
      <p className="font-ui text-sm text-navy-800 mb-7">
        Read the Hebrew and pick the right sound.
      </p>

      {/* Hebrew phrase card */}
      <div className="bg-parchment-50 border border-parchment-400 rounded-2xl py-7 px-5 sm:py-11 sm:px-8 relative mb-7 sm:mb-9">
        <button
          onClick={speak}
          aria-label="Hear pronunciation"
          className="absolute top-4 right-4 w-8 h-8 border border-parchment-500 bg-parchment-100 rounded-lg grid place-items-center text-navy-800 hover:bg-parchment-200 transition-colors"
        >
          <Icon name="speaker" size={14} />
        </button>
        <p
          className="font-hebrew text-[clamp(36px,10vw,56px)] leading-[1.3] text-navy-900 text-center"
          dir="rtl"
          lang="he"
        >
          {payload.phrase.he}
        </p>
      </div>

      {/* Options grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {payload.options.map((opt, idx) => {
          const isSelected = selected === idx;
          const showResult = selected !== null;
          const isCorrect = opt.correct;

          let className =
            "relative text-left rounded-xl p-4 sm:p-[18px_22px] transition-all focus:outline-none ";

          if (!showResult) {
            className +=
              "bg-parchment-50 border border-parchment-500 hover:bg-parchment-100 cursor-pointer";
          } else if (isCorrect) {
            className +=
              "bg-gold-400/10 border-[1.5px] border-gold-400";
          } else if (isSelected) {
            className +=
              "bg-parchment-50 border border-parchment-500 opacity-60";
          } else {
            className +=
              "bg-parchment-50 border border-parchment-500 opacity-40";
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={selected !== null}
              className={className}
            >
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-md bg-parchment-200 text-navy-800 font-ui text-xs font-semibold grid place-items-center shrink-0 mt-0.5">
                  {showResult && isCorrect ? (
                    <Icon name="check" size={12} />
                  ) : (
                    LABELS[idx]
                  )}
                </span>
                <div>
                  <p className="font-ui text-[17px] italic text-navy-900 leading-snug">
                    {opt.tr}
                  </p>
                  {showResult && isCorrect && (
                    <p className="font-ui text-sm text-navy-700 mt-1">{opt.en}</p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
