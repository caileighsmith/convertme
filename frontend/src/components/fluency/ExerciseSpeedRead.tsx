"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Icon } from "@/components/ui/Icon";

interface SpeedReadPayload {
  lines: string[];
  speed_level: number;
}

interface Props {
  payload: SpeedReadPayload;
  onAnswer: (correct: boolean) => void;
}

const SPEED_MS: Record<number, number> = {
  1: 3000,
  2: 2500,
  3: 2000,
  4: 1500,
  5: 1200,
};

// Generic comprehension questions
const QUESTIONS = [
  {
    question: "Did you follow along with each line?",
    options: ["Yes, I followed each one", "I lost track of a few"],
    correctIdx: 0,
  },
  {
    question: "Could you recognise any familiar words?",
    options: ["Yes, I spotted some", "Not yet — it was fast"],
    correctIdx: 0,
  },
];

type Phase = "reading" | "questions" | "done";

export function ExerciseSpeedRead({ payload, onAnswer }: Props) {
  const { lines, speed_level } = payload;
  const msPerLine = SPEED_MS[speed_level] ?? 3000;

  const [activeLine, setActiveLine] = useState(-1);
  const [phase, setPhase] = useState<Phase>("reading");
  const [paused, setPaused] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [started, setStarted] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeLineRef = useRef(activeLine);
  activeLineRef.current = activeLine;

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startReading = useCallback(() => {
    setStarted(true);
    setActiveLine(0);
    intervalRef.current = setInterval(() => {
      const next = activeLineRef.current + 1;
      if (next >= lines.length) {
        clearTimer();
        setPhase("questions");
        setActiveLine(-1);
      } else {
        setActiveLine(next);
      }
    }, msPerLine);
  }, [lines.length, msPerLine, clearTimer]);

  function togglePause() {
    if (!started) {
      startReading();
      return;
    }
    if (paused) {
      // Resume
      setPaused(false);
      intervalRef.current = setInterval(() => {
        const next = activeLineRef.current + 1;
        if (next >= lines.length) {
          clearTimer();
          setPhase("questions");
          setActiveLine(-1);
        } else {
          setActiveLine(next);
        }
      }, msPerLine);
    } else {
      setPaused(true);
      clearTimer();
    }
  }

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  function handleQuestionAnswer(correct: boolean) {
    const newScore = score + (correct ? 1 : 0);
    setScore(newScore);

    if (questionIndex + 1 < QUESTIONS.length) {
      setQuestionIndex((i) => i + 1);
    } else {
      // Score: 2 correct = full mark, 1 = partial, 0 = minimal
      const passed = newScore >= 1;
      setTimeout(() => onAnswer(passed), 300);
    }
  }

  const timeLeft = activeLine >= 0
    ? Math.round(((lines.length - activeLine) * msPerLine) / 1000)
    : 0;

  if (phase === "questions") {
    const q = QUESTIONS[questionIndex];
    return (
      <div className="w-full max-w-[720px] mx-auto flex flex-col">
        <p className="font-ui text-[11px] uppercase tracking-[0.14em] text-navy-700 mb-3">
          Quick check · after reading
        </p>
        <h2 className="font-heading text-[28px] font-normal tracking-tight text-navy-900 mb-7">
          {q.question}
        </h2>
        <div className="flex flex-col gap-3">
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleQuestionAnswer(i === q.correctIdx)}
              className="w-full text-left border border-parchment-500 rounded-xl p-5 font-ui text-base text-navy-900 hover:bg-parchment-100 hover:border-navy-900 transition-colors focus:outline-none"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[820px] mx-auto flex flex-col">
      <p className="font-ui text-[11px] uppercase tracking-[0.14em] text-navy-700 mb-3">
        Speed read · let your eyes flow
      </p>
      <h2 className="font-heading text-[clamp(20px,4vw,28px)] font-normal tracking-tight text-navy-900 mb-5">
        Follow the bar through the prayer.
      </h2>

      {/* Reading panel */}
      <div className="bg-parchment-50 border border-parchment-400 rounded-2xl py-7 px-5 sm:py-11 sm:px-14 relative overflow-hidden mb-5">
        {lines.map((line, i) => {
          const isActive = i === activeLine;
          const isPast = i < activeLine;
          return (
            <div key={i} className="relative flex items-center justify-end mb-1">
              {isActive && (
                <span className="hidden sm:block absolute -right-10 font-ui text-[11px] uppercase tracking-[0.1em] text-gold-400 select-none">
                  now
                </span>
              )}
              <p
                className={`font-hebrew text-[clamp(20px,5vw,34px)] leading-[2] sm:leading-[2.2] text-right transition-all rounded-lg px-2 w-full ${
                  isActive
                    ? "bg-gold-400/10 text-navy-900"
                    : isPast
                    ? "text-navy-700"
                    : "text-navy-800 opacity-70"
                }`}
                dir="rtl"
                lang="he"
              >
                {line}
              </p>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1 h-1.5 bg-parchment-400 rounded-full overflow-hidden">
          <div
            className="h-full bg-navy-900 rounded-full transition-all"
            style={{ width: `${activeLine >= 0 ? ((activeLine + 1) / lines.length) * 100 : 0}%` }}
          />
        </div>
        <span className="font-ui text-xs text-navy-700 shrink-0 tabular-nums">
          {activeLine >= 0 ? `Line ${activeLine + 1} of ${lines.length}` : `${lines.length} lines`}
        </span>
        {activeLine >= 0 && (
          <span className="font-ui text-xs text-navy-700 shrink-0 tabular-nums">
            ~{timeLeft}s left
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 pt-4 border-t border-parchment-400">
        {/* Pace level dots */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="font-ui text-[11px] text-navy-700 mr-1 hidden sm:inline">Pace</span>
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${i < speed_level ? "bg-navy-900" : "bg-parchment-400"}`}
            />
          ))}
        </div>

        <p className="font-ui text-xs text-navy-700 text-center hidden sm:block">
          Read each line as it highlights — questions follow
        </p>

        <button
          onClick={togglePause}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-parchment-500 font-ui text-sm text-navy-900 hover:bg-parchment-100 transition-colors focus:outline-none shrink-0"
        >
          {!started ? (
            <>
              <Icon name="play" size={14} />
              Start
            </>
          ) : paused ? (
            <>
              <Icon name="play" size={14} />
              Resume
            </>
          ) : (
            <>
              <Icon name="pause" size={14} />
              Pause
            </>
          )}
        </button>
      </div>
    </div>
  );
}
