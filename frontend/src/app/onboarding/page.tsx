"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { useAuth } from "@/context/AuthContext";
import {
  JOURNEY_STAGES, TRADITIONS,
  RadioCard, Pill, HebrewSlider,
} from "@/components/onboarding/OnboardingControls";

export default function OnboardingPage() {
  const { user, loading, onboardingData, completeOnboarding } = useAuth();
  const router = useRouter();

  const [journeyStage, setJourneyStage] = useState(onboardingData?.journeyStage ?? "");
  const [tradition, setTradition] = useState(onboardingData?.tradition ?? "");
  const [hebrewLevel, setHebrewLevel] = useState(onboardingData?.hebrewLevel ?? 25);

  useEffect(() => {
    if (!loading && !user) router.replace("/register");
  }, [loading, user, router]);

  async function save() {
    await completeOnboarding({
      journeyStage: journeyStage || "Just exploring",
      tradition: tradition || "Not sure yet",
      hebrewLevel,
    });
    router.push("/prayer-reader");
  }

  if (loading || !user) return null;

  return (
    <div className="min-h-[calc(100vh-60px)] bg-parchment-100 flex flex-col">
      {/* Progress strip */}
      <div className="flex items-center justify-end gap-4 px-8 py-3 border-b border-parchment-400 bg-parchment-50">
        <span className="font-ui text-sm text-navy-800">Step 2 of 3</span>
        <div className="w-24 h-1 rounded-full bg-parchment-400 overflow-hidden">
          <div className="h-full bg-gold-400" style={{ width: "66%" }} />
        </div>
        <button
          onClick={save}
          className="font-ui text-sm text-navy-800 border-b border-parchment-500 pb-px hover:text-navy-900 transition-colors"
        >
          Skip
        </button>
      </div>

      <div className="flex-1 overflow-auto px-6 py-14">
        <div className="max-w-2xl mx-auto">
          <p className="font-ui text-[11px] uppercase tracking-[0.14em] text-navy-700 mb-4">
            Tell us where you are
          </p>
          <h1 className="font-heading text-[40px] sm:text-[44px] font-normal leading-[1.05] tracking-tight text-navy-900 mb-3">
            We&rsquo;ll meet you there.
          </h1>
          <p className="font-ui text-base text-navy-800 mb-10 max-w-[540px] leading-[1.55]">
            None of these answers are graded — they help us choose what to show first.
            You can change everything in your profile later.
          </p>

          {/* Q1 */}
          <section className="pb-8 mb-8 border-b border-parchment-400">
            <QuestionHeader num="1" title="Where are you on the journey?" />
            <div className="flex flex-col gap-2 pl-10">
              {JOURNEY_STAGES.map(({ label, sub }) => (
                <RadioCard
                  key={label}
                  label={label}
                  sub={sub}
                  selected={journeyStage === label}
                  onClick={() => setJourneyStage(label)}
                />
              ))}
            </div>
          </section>

          {/* Q2 */}
          <section className="pb-8 mb-8 border-b border-parchment-400">
            <QuestionHeader num="2" title="Which tradition are you learning in?" />
            <div className="flex flex-wrap gap-2 pl-10">
              {TRADITIONS.map((t) => (
                <Pill
                  key={t}
                  label={t}
                  selected={tradition === t}
                  onClick={() => setTradition(t)}
                />
              ))}
            </div>
          </section>

          {/* Q3 */}
          <section className="pb-8 mb-8 border-b border-parchment-400">
            <QuestionHeader num="3" title="How comfortable are you reading Hebrew?" />
            <div className="pl-10">
              <HebrewSlider value={hebrewLevel} onChange={setHebrewLevel} />
            </div>
          </section>

          <div className="flex justify-between items-center mt-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-lg border border-parchment-500 font-ui text-sm text-navy-900 hover:bg-parchment-200 transition-colors"
            >
              <Icon name="chevL" size={13} /> Back
            </Link>
            <button
              onClick={save}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-navy-900 text-parchment-50 font-ui text-sm font-medium hover:bg-navy-900/90 transition-colors"
            >
              Start reading <Icon name="chevR" size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuestionHeader({ num, title }: { num: string; title: string }) {
  return (
    <div className="flex items-baseline gap-3.5 mb-4">
      <span className="w-[26px] h-[26px] rounded-lg bg-parchment-200 text-navy-800 grid place-items-center text-xs font-semibold font-ui flex-shrink-0">
        {num}
      </span>
      <h2 className="font-ui text-lg font-semibold tracking-tight text-navy-900">{title}</h2>
    </div>
  );
}
