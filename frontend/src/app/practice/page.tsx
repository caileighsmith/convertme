"use client";

import Link from "next/link";
import { useState } from "react";
import { AlephBet } from "@/components/practice/AlephBet";
import { PatternDrill } from "@/components/practice/PatternDrill";
import { Icon } from "@/components/ui/Icon";

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
            You don&apos;t need to understand every word to follow the service. Start with the 22 letters,
            then learn the phrases that repeat at every Shacharit, Mincha, and Maariv.
          </p>
        </div>
      </section>

      {/* Fluency Trainer card */}
      <div className="px-6 sm:px-14 pt-8">
        <div className="max-w-[1100px] mx-auto border border-parchment-400 rounded-2xl bg-parchment-100 overflow-hidden grid grid-cols-1 sm:grid-cols-[1fr_auto] items-center gap-0">
          <div className="p-7">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-navy-900 text-parchment-50 grid place-items-center">
                <Icon name="book" size={16} color="#f5f1e7" />
              </div>
              <span className="font-ui text-[10px] font-semibold uppercase tracking-[0.1em] text-gold-400 bg-gold-400/10 px-1.5 py-0.5 rounded">
                Live
              </span>
            </div>
            <h3 className="font-ui text-[15px] font-semibold tracking-tight text-navy-900 mb-1">
              Daily Fluency Trainer
            </h3>
            <p className="font-ui text-sm leading-[1.55] text-navy-800 max-w-[480px]">
              Practise five minutes a day on a fixed sequence of prayers until the words land on their own.
              Each prayer unlocks the next at 75% accuracy.
            </p>
          </div>
          <div className="p-7 sm:border-l border-t sm:border-t-0 border-parchment-400">
            <Link
              href="/practice/fluency"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-navy-900 text-parchment-50 font-ui text-sm font-medium hover:bg-navy-900/90 transition-colors whitespace-nowrap"
            >
              Start <Icon name="arrowR" size={14} color="#f5f1e7" />
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-[60px] z-20 border-b border-parchment-400 bg-parchment-50 px-6 sm:px-14 mt-8">
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
