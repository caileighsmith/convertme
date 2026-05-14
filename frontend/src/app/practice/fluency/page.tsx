"use client";

import { useState, useEffect, useCallback } from "react";
import { getFluencyCurriculum, getFluencyProgress } from "@/lib/api";
import type { CurriculumItem, SessionResult, ProgressSummary } from "@/types/fluency";
import { FluencyCurriculum } from "@/components/fluency/FluencyCurriculum";
import { FluencySession } from "@/components/fluency/FluencySession";
import { SessionSummary } from "@/components/fluency/SessionSummary";

type View = "curriculum" | "session" | "summary";

export default function FluencyPage() {
  const [view, setView] = useState<View>("curriculum");
  const [activePrayerId, setActivePrayerId] = useState<string | null>(null);
  const [sessionResult, setSessionResult] = useState<SessionResult | null>(null);
  const [curriculum, setCurriculum] = useState<CurriculumItem[]>([]);
  const [progress, setProgress] = useState<ProgressSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [currData, progData] = await Promise.all([
        getFluencyCurriculum(),
        getFluencyProgress().catch(() => null),
      ]);
      setCurriculum(currData);
      setProgress(progData);
    } catch {
      // Silently fail — curriculum shows locked state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function handleStart(prayerId: string) {
    setActivePrayerId(prayerId);
    setView("session");
  }

  function handleSessionComplete(result: SessionResult) {
    setSessionResult(result);
    setView("summary");
    // Refresh data in background
    loadData();
  }

  function handleContinue() {
    if (sessionResult?.next_prayer_id) {
      handleStart(sessionResult.next_prayer_id);
    } else {
      setView("curriculum");
    }
  }

  function handlePracticeAgain() {
    if (activePrayerId) {
      handleStart(activePrayerId);
    } else {
      setView("curriculum");
    }
  }

  function handleBack() {
    setView("curriculum");
    setSessionResult(null);
    setActivePrayerId(null);
  }

  const activePrayer = curriculum.find((c) => c.id === activePrayerId);

  if (loading) {
    return (
      <div className="bg-parchment-50 min-h-screen flex items-center justify-center">
        <p className="font-ui text-navy-700">Loading…</p>
      </div>
    );
  }

  if (view === "session" && activePrayerId) {
    return (
      <FluencySession
        prayerId={activePrayerId}
        prayerName={activePrayer?.en ?? activePrayerId}
        streak={progress?.day_streak ?? 0}
        onComplete={handleSessionComplete}
        onExit={handleBack}
      />
    );
  }

  if (view === "summary" && sessionResult) {
    return (
      <SessionSummary
        result={sessionResult}
        curriculum={curriculum}
        streak={progress?.day_streak ?? 0}
        onContinue={handleContinue}
        onPracticeAgain={handlePracticeAgain}
        onBack={handleBack}
      />
    );
  }

  return (
    <FluencyCurriculum
      curriculum={curriculum}
      progress={progress}
      onStart={handleStart}
    />
  );
}
