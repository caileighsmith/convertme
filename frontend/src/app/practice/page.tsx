"use client";

import { useState } from "react";
import { AlephBet } from "@/components/practice/AlephBet";
import { PatternDrill } from "@/components/practice/PatternDrill";

type Section = "alephbet" | "drill";

const TABS: { id: Section; label: string; count: string }[] = [
  { id: "alephbet", label: "Aleph-Bet",     count: "22 letters" },
  { id: "drill",    label: "Patterns",       count: "phrases & blessings" },
];

export default function PracticePage() {
  const [active, setActive] = useState<Section>("alephbet");

  return (
    <div className="min-h-screen bg-parchment-50">
      {/* Hero */}
      <section className="px-6 sm:px-14 pt-11 pb-9 border-b border-parchment-400 bg-parchment-50">
        <div className="max-w-[1100px] mx-auto">
          <p className="font-ui text-[11px] uppercase tracking-[0.14em] text-navy-700 mb-3.5">
            Hebrew Practice
          </p>
          <h1 className="font-heading font-normal text-[clamp(32px,4vw,48px)] leading-[1.1] tracking-tight text-navy-900 mb-3.5 max-w-2xl">
            Recognise the letters,<br/>
            <em className="text-navy-800">then the patterns.</em>
          </h1>
          <p className="font-ui text-base text-navy-800 max-w-[620px] leading-[1.55]">
            You don't need to understand every word to follow the service. Start with the 22 letters,
            then learn the phrases that repeat at every Shacharit, Mincha, and Maariv.
          </p>
        </div>
      </section>

      {/* Tabs */}
      <div className="sticky top-[60px] z-20 border-b border-parchment-400 bg-parchment-50 px-6 sm:px-14">
        <div className="max-w-[1100px] mx-auto flex items-center gap-0">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={`relative inline-flex items-baseline gap-2 px-4 py-4 font-ui text-sm transition-colors focus:outline-none ${
                active === t.id
                  ? "text-navy-900 font-semibold"
                  : "text-navy-800 hover:text-navy-900"
              }`}
              style={{
                borderBottom: active === t.id ? "2px solid #1a1612" : "2px solid transparent",
                marginBottom: -1,
              }}
            >
              {t.label}
              <span className="font-ui text-[11px] text-navy-700 font-normal">{t.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1100px] mx-auto px-6 sm:px-14 py-10">
        {active === "alephbet" && <AlephBet />}
        {active === "drill" && <PatternDrill />}
      </div>
    </div>
  );
}
