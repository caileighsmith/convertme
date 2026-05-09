"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { PATTERNS, PATTERN_CATEGORIES, LEVEL_LABELS } from "@/data/patterns";
import type { Pattern } from "@/data/patterns";
import { Icon } from "@/components/ui/Icon";

function useSpeech() {
  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = "he-IL";
    utt.rate = 0.7;
    window.speechSynthesis.speak(utt);
  }, []);
  return speak;
}

function hebrewFontSize(hebrew: string): string {
  const len = hebrew.length;
  if (len < 20)  return "text-5xl";
  if (len < 50)  return "text-4xl";
  if (len < 120) return "text-3xl";
  if (len < 250) return "text-2xl";
  return "text-xl";
}

export function PatternDrill() {
  const [level, setLevel] = useState<number>(1);
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [cardIndex, setCardIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [mastered, setMastered] = useState<Set<string>>(new Set());
  const speak = useSpeech();

  const filtered: Pattern[] = useMemo(() => {
    return PATTERNS.filter(
      (p) => p.level === level && (categoryFilter === "All" || p.category === categoryFilter)
    );
  }, [level, categoryFilter]);

  const availableCategories = useMemo(() => {
    const cats = new Set(PATTERNS.filter((p) => p.level === level).map((p) => p.category));
    return PATTERN_CATEGORIES.filter((c) => cats.has(c));
  }, [level]);

  useEffect(() => {
    setCardIndex(0);
    setRevealed(false);
    setMastered(new Set());
  }, [level, categoryFilter]);

  useEffect(() => {
    if (categoryFilter !== "All" && !availableCategories.includes(categoryFilter as never)) {
      setCategoryFilter("All");
    }
  }, [availableCategories, categoryFilter]);

  const current: Pattern | null = filtered[cardIndex] ?? null;
  const remaining = filtered.length - cardIndex;

  const advance = useCallback(
    (mark: "again" | "got-it") => {
      if (!current) return;
      if (mark === "got-it") setMastered((prev) => new Set(prev).add(current.id));
      setRevealed(false);
      setCardIndex((i) => i + 1);
    },
    [current]
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "BUTTON" && e.key === "Enter") return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (!revealed) setRevealed(true);
      } else if (revealed) {
        if (e.key === "ArrowRight" || e.key === "1") advance("again");
        if (e.key === "ArrowLeft"  || e.key === "2") advance("got-it");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [revealed, advance]);

  const reset = () => { setCardIndex(0); setRevealed(false); setMastered(new Set()); };
  const isLong = current && current.hebrew.length > 120;

  return (
    <div className="max-w-2xl mx-auto">

      {/* Level selector */}
      <div className="mb-5">
        <p className="font-ui text-[11px] uppercase tracking-[0.14em] text-navy-700 mb-2.5">Difficulty</p>
        <div className="flex gap-1.5 flex-wrap">
          {[1, 2, 3, 4, 5].map((l) => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              className={`px-3 py-1.5 rounded-lg font-ui text-sm border-2 transition-all focus:outline-none ${
                level === l
                  ? "border-navy-900 bg-navy-900 text-parchment-50"
                  : "border-parchment-400 bg-parchment-50 text-navy-800 hover:border-parchment-500"
              }`}
            >
              {l} · {LEVEL_LABELS[l]}
            </button>
          ))}
        </div>
        <p className="font-ui text-xs text-navy-700 italic mt-2">
          {level === 1 && "Single words and micro-phrases — build your core vocabulary"}
          {level === 2 && "Standard liturgical phrases — the building blocks of every service"}
          {level === 3 && "Complete sentences from the siddur — full thoughts, full meaning"}
          {level === 4 && "Multi-sentence paragraphs — following an entire section of prayer"}
          {level === 5 && "Full Amidah blessings, complete Kaddish, full Aleinu — service-length passages"}
        </p>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-1.5 mb-6">
        <button
          onClick={() => setCategoryFilter("All")}
          className={`px-3 py-1 rounded-lg font-ui text-xs transition-all focus:outline-none ${
            categoryFilter === "All" ? "bg-navy-900 text-parchment-50" : "bg-parchment-100 text-navy-800 hover:bg-parchment-200"
          }`}
        >
          All ({filtered.length})
        </button>
        {availableCategories.map((cat) => {
          const count = PATTERNS.filter((p) => p.level === level && p.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-lg font-ui text-xs transition-all focus:outline-none ${
                categoryFilter === cat ? "bg-navy-900 text-parchment-50" : "bg-parchment-100 text-navy-800 hover:bg-parchment-200"
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-1 bg-parchment-400 rounded-full overflow-hidden">
          <div
            className="h-full bg-navy-900 rounded-full transition-all duration-500"
            style={{ width: filtered.length > 0 ? `${(cardIndex / filtered.length) * 100}%` : "0%" }}
          />
        </div>
        <span className="font-ui text-xs text-navy-700 shrink-0 min-w-28 text-right tabular-nums">
          {mastered.size} mastered · {remaining} left
        </span>
      </div>

      {/* Card */}
      {current ? (
        <div className={`rounded-2xl border border-parchment-400 bg-parchment-100 flex flex-col relative ${isLong ? "p-6" : "p-8 items-center text-center"}`}>
          {/* Badge */}
          <div className="absolute top-4 right-4 flex gap-1.5">
            <span className="font-ui text-xs text-gold-400 bg-gold-400/10 border border-gold-400/20 px-2 py-0.5 rounded-full">
              L{current.level}
            </span>
            <span className="font-ui text-xs text-navy-700 bg-parchment-50 border border-parchment-400 px-2 py-0.5 rounded-full hidden sm:block">
              {current.category}
            </span>
          </div>

          {/* Hebrew text */}
          <div
            className={`font-hebrew text-navy-900 leading-loose mb-4 ${hebrewFontSize(current.hebrew)} ${isLong ? "text-right w-full" : ""}`}
            dir="rtl" lang="he"
          >
            {current.hebrew}
          </div>

          <button
            onClick={() => speak(current.hebrew)}
            className={`font-ui text-xs text-gold-400 hover:text-gold-500 transition-colors mb-5 inline-flex items-center gap-1.5 ${isLong ? "self-end" : ""}`}
          >
            <Icon name="speaker" size={12} /> Listen
          </button>

          {!revealed ? (
            <button
              onClick={() => setRevealed(true)}
              className={`px-8 py-3 rounded-xl bg-navy-900 text-parchment-50 font-ui text-sm font-medium hover:bg-navy-900/90 transition-colors focus:outline-none ${isLong ? "self-center" : ""}`}
            >
              Reveal — space / enter
            </button>
          ) : (
            <div className={`w-full space-y-4 animate-scale-in border-t border-parchment-400 pt-4`}>
              <p className={`font-ui italic text-gold-400 leading-relaxed ${isLong ? "text-sm text-right" : "text-lg text-center"}`} dir={isLong ? "rtl" : undefined}>
                {current.transliteration}
              </p>
              <p className={`font-ui font-semibold text-navy-900 leading-snug tracking-tight ${isLong ? "text-base" : "text-xl text-center"}`}>
                &ldquo;{current.meaning}&rdquo;
              </p>
              {current.note && (
                <p className="font-ui text-xs text-navy-800 leading-relaxed border-l-2 border-gold-400/40 pl-3">
                  {current.note}
                </p>
              )}
              <div className={`flex flex-wrap gap-1.5 ${isLong ? "" : "justify-center"}`}>
                {current.appearsIn.map((loc) => (
                  <span key={loc} className="font-ui text-xs bg-parchment-50 border border-parchment-400 text-navy-700 px-2 py-0.5 rounded-full">
                    {loc}
                  </span>
                ))}
              </div>
              <div className={`flex gap-3 pt-1 ${isLong ? "" : "justify-center"}`}>
                <button
                  onClick={() => advance("again")}
                  className="flex-1 max-w-40 py-2.5 rounded-xl border border-parchment-500 bg-parchment-50 font-ui text-sm text-navy-900 hover:bg-parchment-200 transition-all focus:outline-none"
                >
                  Again ← 1
                </button>
                <button
                  onClick={() => advance("got-it")}
                  className="flex-1 max-w-40 py-2.5 rounded-xl border border-gold-400 bg-gold-400/10 font-ui text-sm text-navy-900 hover:bg-gold-400/20 transition-all focus:outline-none"
                >
                  Got it → 2
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-parchment-400 bg-parchment-100 p-12 flex flex-col items-center text-center gap-4">
          <div className="font-hebrew text-6xl text-navy-900" style={{ opacity: 0.15 }} dir="rtl" lang="he">שָׁלוֹם</div>
          <h3 className="font-ui text-2xl font-semibold tracking-tight text-navy-900">
            {filtered.length === 0 ? "No cards at this level" : mastered.size === filtered.length ? "All mastered!" : "Deck complete"}
          </h3>
          {filtered.length > 0 && (
            <p className="font-ui text-navy-800">
              {mastered.size} of {filtered.length} marked as mastered.
            </p>
          )}
          {filtered.length === 0 ? (
            <p className="font-ui text-sm text-navy-700">Try a different category filter.</p>
          ) : (
            <button
              onClick={reset}
              className="px-6 py-2.5 rounded-xl bg-navy-900 text-parchment-50 font-ui text-sm font-medium hover:bg-navy-900/90 transition-colors focus:outline-none"
            >
              Start over
            </button>
          )}
        </div>
      )}

      <p className="text-center font-ui text-xs text-navy-700 mt-4">
        Space / Enter to reveal · ← 1 = Again · → 2 = Got it
      </p>
    </div>
  );
}
