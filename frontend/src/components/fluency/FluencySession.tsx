"use client";

import { useState, useEffect } from "react";
import { Icon } from "@/components/ui/Icon";
import { getFluencySession, submitFluencySession } from "@/lib/api";
import type { ExerciseObject, SessionResult } from "@/types/fluency";
import { ExerciseWordTap } from "./ExerciseWordTap";
import { ExerciseChunkReadAlong } from "./ExerciseChunkReadAlong";
import { ExerciseWordOrder } from "./ExerciseWordOrder";
import { ExerciseSpeedRead } from "./ExerciseSpeedRead";

interface Props {
  prayerId: string;
  prayerName: string;
  streak: number;
  onComplete: (result: SessionResult) => void;
  onExit: () => void;
}

interface AnswerRecord {
  exercise_id: string;
  correct: boolean;
}

export function FluencySession({ prayerId, prayerName, streak, onComplete, onExit }: Props) {
  const [exercises, setExercises] = useState<ExerciseObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getFluencySession(prayerId)
      .then((data) => {
        setExercises(data.exercises);
        setLoading(false);
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Failed to load session");
        setLoading(false);
      });
  }, [prayerId]);

  async function handleAnswer(correct: boolean) {
    const exercise = exercises[currentIndex];
    const newAnswers = [...answers, { exercise_id: exercise.id, correct }];
    setAnswers(newAnswers);

    const nextIndex = currentIndex + 1;

    if (nextIndex >= exercises.length) {
      // Submit
      setSubmitting(true);
      try {
        const result = await submitFluencySession(prayerId, newAnswers);
        onComplete(result);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to submit session");
        setSubmitting(false);
      }
    } else {
      setCurrentIndex(nextIndex);
    }
  }

  const total = exercises.length || 10;
  const progress = total > 0 ? ((currentIndex) / total) * 100 : 0;

  if (loading) {
    return (
      <div className="bg-parchment-100 h-screen flex items-center justify-center">
        <p className="font-ui text-navy-700">Loading session…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-parchment-100 h-screen flex flex-col items-center justify-center gap-4">
        <p className="font-ui text-navy-800">{error}</p>
        <button
          onClick={onExit}
          className="px-5 py-2.5 rounded-lg border border-parchment-500 font-ui text-sm text-navy-900 hover:bg-parchment-200 transition-colors"
        >
          Back to curriculum
        </button>
      </div>
    );
  }

  const currentExercise = exercises[currentIndex];

  function renderExercise(ex: ExerciseObject) {
    switch (ex.type) {
      case "word_tap":
        return (
          <ExerciseWordTap
            key={ex.id}
            payload={ex.payload as unknown as Parameters<typeof ExerciseWordTap>[0]["payload"]}
            onAnswer={handleAnswer}
          />
        );
      case "chunk_read_along":
        return (
          <ExerciseChunkReadAlong
            key={ex.id}
            payload={ex.payload as unknown as Parameters<typeof ExerciseChunkReadAlong>[0]["payload"]}
            onAnswer={handleAnswer}
          />
        );
      case "word_order":
        return (
          <ExerciseWordOrder
            key={ex.id}
            payload={ex.payload as unknown as Parameters<typeof ExerciseWordOrder>[0]["payload"]}
            onAnswer={handleAnswer}
          />
        );
      case "speed_read":
        return (
          <ExerciseSpeedRead
            key={ex.id}
            payload={ex.payload as unknown as Parameters<typeof ExerciseSpeedRead>[0]["payload"]}
            onAnswer={handleAnswer}
          />
        );
      default:
        return null;
    }
  }

  return (
    <div className="bg-parchment-100 h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-14 flex-shrink-0 border-b border-parchment-400 grid grid-cols-[auto_1fr_auto] gap-6 items-center px-7">
        {/* Left: end session */}
        <button
          onClick={onExit}
          className="inline-flex items-center gap-1.5 font-ui text-sm text-navy-800 hover:text-navy-900 transition-colors focus:outline-none"
        >
          <Icon name="x" size={14} />
          End session
        </button>

        {/* Center: progress */}
        <div className="flex items-center gap-3 justify-center">
          <span className="font-ui text-xs text-navy-700 tabular-nums shrink-0">
            {currentIndex + 1} / {total}
          </span>
          <div className="w-[320px] max-w-full h-1.5 bg-parchment-400 rounded-full overflow-hidden">
            <div
              className="h-full bg-navy-900 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="font-ui text-xs text-navy-700 truncate hidden sm:block shrink-0">
            {prayerName}
          </span>
        </div>

        {/* Right: streak badge */}
        <div className="flex items-center gap-1 bg-gold-400/10 text-gold-400 rounded-full px-2.5 py-1 font-ui text-xs font-medium">
          <Icon name="flame" size={12} color="#a8651f" />
          {streak}
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto px-4 sm:px-10 py-8 sm:py-14 flex flex-col items-center justify-center">
          {submitting ? (
            <p className="font-ui text-navy-700">Saving your results…</p>
          ) : (
            currentExercise && renderExercise(currentExercise)
          )}
        </div>
      </div>
    </div>
  );
}
