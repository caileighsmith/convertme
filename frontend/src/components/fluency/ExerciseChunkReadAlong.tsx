"use client";

import { useState, useRef, useCallback } from "react";
import { Icon } from "@/components/ui/Icon";

interface ChunkReadAlongPayload {
  phrase: { he: string; words: string[] };
  options: string[];
  correct_index: number;
}

interface Props {
  payload: ChunkReadAlongPayload;
  onAnswer: (correct: boolean) => void;
}

export function ExerciseChunkReadAlong({ payload, onAnswer }: Props) {
  const [playing, setPlaying] = useState(false);
  const [activeWordIndex, setActiveWordIndex] = useState(-1);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const words = payload.phrase.words;

  const play = useCallback(() => {
    if (playing) {
      window.speechSynthesis?.cancel();
      if (timerRef.current) clearInterval(timerRef.current);
      setPlaying(false);
      setActiveWordIndex(-1);
      return;
    }

    setPlaying(true);
    setActiveWordIndex(0);
    let idx = 0;

    // Use speech synthesis if available
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const utt = new SpeechSynthesisUtterance(payload.phrase.he);
      utt.lang = "he";
      utt.rate = 0.85;

      // Fallback: advance word every 400ms
      timerRef.current = setInterval(() => {
        idx++;
        if (idx >= words.length) {
          if (timerRef.current) clearInterval(timerRef.current);
          setPlaying(false);
          setHasPlayed(true);
          setActiveWordIndex(-1);
        } else {
          setActiveWordIndex(idx);
        }
      }, 500);

      utt.onend = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        setPlaying(false);
        setHasPlayed(true);
        setActiveWordIndex(-1);
      };

      window.speechSynthesis.speak(utt);
    } else {
      // No speech — just advance words
      timerRef.current = setInterval(() => {
        idx++;
        if (idx >= words.length) {
          if (timerRef.current) clearInterval(timerRef.current);
          setPlaying(false);
          setHasPlayed(true);
          setActiveWordIndex(-1);
        } else {
          setActiveWordIndex(idx);
        }
      }, 500);
    }
  }, [playing, words, payload.phrase.he]);

  function handleSelect(idx: number) {
    if (selected !== null) return;
    setSelected(idx);
    const isCorrect = idx === payload.correct_index;
    setTimeout(() => onAnswer(isCorrect), 400);
  }

  // Waveform bars (36)
  const barCount = 36;
  const progressFraction = hasPlayed ? 1 : activeWordIndex < 0 ? 0 : activeWordIndex / words.length;
  const filledBars = Math.round(progressFraction * barCount);

  return (
    <div className="w-full max-w-[720px] mx-auto flex flex-col">
      <p className="font-ui text-[11px] uppercase tracking-[0.14em] text-navy-700 mb-3">
        Read-along · listen first
      </p>
      <h2 className="font-heading text-[clamp(22px,5vw,32px)] font-normal tracking-tight text-navy-900 mb-1.5">
        Listen, then pick what you heard.
      </h2>
      <p className="font-ui text-sm text-navy-800 mb-7">
        After it plays, tap the phrase you just heard.
      </p>

      {/* Audio panel */}
      <div className="bg-parchment-50 border border-parchment-400 rounded-2xl p-5 sm:p-8 mb-7">
        {/* Hebrew words */}
        <div
          className="flex flex-wrap justify-end gap-x-3 gap-y-1 mb-6 font-hebrew text-[clamp(24px,6vw,34px)] leading-[1.6]"
          dir="rtl"
          lang="he"
        >
          {words.map((word, i) => {
            const isActive = i === activeWordIndex;
            const isPast = i < activeWordIndex || (hasPlayed && !playing);
            return (
              <span
                key={i}
                className={
                  isActive
                    ? "bg-gold-400/10 rounded-md px-2 text-navy-900 transition-all"
                    : isPast
                    ? "text-navy-700"
                    : "text-navy-700/40"
                }
                style={isActive ? { boxShadow: "inset 0 -3px 0 #a8651f" } : undefined}
              >
                {word}
              </span>
            );
          })}
        </div>

        {/* Transport */}
        <div className="flex items-center gap-4">
          <button
            onClick={play}
            aria-label={playing ? "Pause" : "Play"}
            className="w-11 h-11 rounded-full bg-navy-900 text-parchment-50 grid place-items-center shrink-0 hover:bg-navy-900/80 transition-colors"
          >
            <Icon name={playing ? "pause" : "play"} size={16} color="#f5f1e7" />
          </button>

          {/* Waveform */}
          <div className="flex items-center gap-[2px] flex-1 h-8">
            {Array.from({ length: barCount }).map((_, i) => {
              const height = 4 + Math.round(Math.abs(Math.sin((i / barCount) * Math.PI * 4)) * 20);
              return (
                <div
                  key={i}
                  style={{ height }}
                  className={`w-[3px] rounded-full ${i < filledBars ? "bg-navy-900" : "bg-parchment-400"}`}
                />
              );
            })}
          </div>

          <span className="font-ui text-xs text-navy-700 shrink-0 tabular-nums">
            {hasPlayed ? "done" : playing ? "playing" : "0:00"}
          </span>
        </div>
      </div>

      {/* Options — shown after play */}
      {hasPlayed && (
        <div className="flex flex-col gap-2.5">
          {payload.options.map((opt, idx) => {
            const isSelected = selected === idx;
            const showResult = selected !== null;
            const isCorrect = idx === payload.correct_index;

            let className =
              "w-full text-right rounded-xl p-4 font-hebrew text-2xl transition-all focus:outline-none ";

            if (!showResult) {
              className +=
                "border border-parchment-500 text-navy-900 hover:border-navy-900 cursor-pointer";
            } else if (isCorrect) {
              className +=
                "border-[1.5px] border-gold-400 bg-gold-400/10 text-navy-900";
            } else if (isSelected) {
              className +=
                "border border-parchment-500 text-navy-800 opacity-50";
            } else {
              className +=
                "border border-parchment-500 text-navy-800 opacity-40";
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={selected !== null}
                className={className}
                dir="rtl"
                lang="he"
              >
                {opt}
              </button>
            );
          })}
        </div>
      )}

      {!hasPlayed && (
        <p className="font-ui text-sm text-navy-700 text-center py-4">
          Press play to hear the phrase.
        </p>
      )}
    </div>
  );
}
