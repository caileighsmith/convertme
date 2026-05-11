"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AuthGuard } from "@/components/layout/AuthGuard";
import {
  JOURNEY_STAGES, TRADITIONS, hebrewLabel,
  RadioCard, Pill, HebrewSlider,
} from "@/components/onboarding/OnboardingControls";

function ProfileContent() {
  const { user, onboardingData, completeOnboarding, logout } = useAuth();
  const router = useRouter();

  const [editing, setEditing] = useState(false);
  const [journeyStage, setJourneyStage] = useState(onboardingData?.journeyStage ?? "");
  const [tradition, setTradition] = useState(onboardingData?.tradition ?? "");
  const [hebrewLevel, setHebrewLevel] = useState(onboardingData?.hebrewLevel ?? 25);

  const initials = user
    ? user.email.slice(0, 2).toUpperCase()
    : "??";

  async function handleSave() {
    await completeOnboarding({ journeyStage, tradition, hebrewLevel });
    setEditing(false);
  }

  function handleCancelEdit() {
    setJourneyStage(onboardingData?.journeyStage ?? "");
    setTradition(onboardingData?.tradition ?? "");
    setHebrewLevel(onboardingData?.hebrewLevel ?? 25);
    setEditing(false);
  }

  function handleLogout() {
    logout();
    router.push("/");
  }

  return (
    <div className="min-h-[calc(100vh-60px)] bg-parchment-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header row */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <span className="w-12 h-12 rounded-full bg-navy-900 text-parchment-50 grid place-items-center font-ui text-base font-semibold flex-shrink-0">
              {initials}
            </span>
            <div>
              <h1 className="font-ui text-xl font-semibold text-navy-900 tracking-tight">Your profile</h1>
              <p className="font-ui text-sm text-navy-800 mt-0.5">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-lg border border-parchment-500 font-ui text-sm text-navy-800 hover:bg-parchment-200 transition-colors"
          >
            Sign out
          </button>
        </div>

        {/* Journey card */}
        <div className="bg-parchment-100 border border-parchment-400 rounded-2xl p-7">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-ui text-base font-semibold text-navy-900 tracking-tight">Your journey</h2>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="font-ui text-sm text-navy-800 border-b border-parchment-500 pb-px hover:text-navy-900 transition-colors"
              >
                Edit
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCancelEdit}
                  className="font-ui text-sm text-navy-700 hover:text-navy-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-3 py-1.5 rounded-lg bg-navy-900 text-parchment-50 font-ui text-sm font-medium hover:bg-navy-900/90 transition-colors"
                >
                  Save
                </button>
              </div>
            )}
          </div>

          {editing ? (
            <div className="flex flex-col gap-8">
              <div>
                <p className="font-ui text-xs uppercase tracking-[0.1em] text-navy-700 mb-3">Stage</p>
                <div className="flex flex-col gap-2">
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
              </div>

              <div>
                <p className="font-ui text-xs uppercase tracking-[0.1em] text-navy-700 mb-3">Tradition</p>
                <div className="flex flex-wrap gap-2">
                  {TRADITIONS.map((t) => (
                    <Pill
                      key={t}
                      label={t}
                      selected={tradition === t}
                      onClick={() => setTradition(t)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="font-ui text-xs uppercase tracking-[0.1em] text-navy-700 mb-3">Hebrew comfort</p>
                <HebrewSlider value={hebrewLevel} onChange={setHebrewLevel} />
              </div>
            </div>
          ) : (
            <div className="divide-y divide-parchment-400">
              <ProfileRow label="Stage"     value={onboardingData?.journeyStage ?? "—"} />
              <ProfileRow label="Tradition" value={onboardingData?.tradition ?? "—"} />
              <ProfileRow
                label="Hebrew"
                value={hebrewLabel(onboardingData?.hebrewLevel ?? 25)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-4 py-3">
      <span className="font-ui text-xs uppercase tracking-[0.1em] text-navy-700 w-20 flex-shrink-0">
        {label}
      </span>
      <span className="font-ui text-sm text-navy-900">{value}</span>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}
