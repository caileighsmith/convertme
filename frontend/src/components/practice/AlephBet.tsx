"use client";

import { useState, useCallback } from "react";
import { LETTERS, VOWELS } from "@/data/alephbet";
import { Icon } from "@/components/ui/Icon";

type Tab = "letters" | "vowels";

function useSpeech() {
  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = "he-IL";
    utt.rate = 0.75;
    window.speechSynthesis.speak(utt);
  }, []);
  return speak;
}

export function AlephBet() {
  const [tab, setTab] = useState<Tab>("letters");
  const [selected, setSelected] = useState<number | null>(7); // Chet selected by default (like design)
  const speak = useSpeech();

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-0 mb-8 border-b border-parchment-400 -mx-6 sm:-mx-14 px-6 sm:px-14">
        {(["letters", "vowels"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setSelected(null); }}
            className={`relative px-4 py-3 font-ui text-sm transition-colors focus:outline-none ${
              tab === t ? "text-navy-900 font-semibold" : "text-navy-800 hover:text-navy-900"
            }`}
            style={{
              borderBottom: tab === t ? "2px solid #1a1612" : "2px solid transparent",
              marginBottom: -1,
            }}
          >
            {t === "letters" ? "The 22 Letters" : "Vowels (Nikud)"}
          </button>
        ))}
      </div>

      {tab === "letters" && (
        <div className="grid grid-cols-1 lg:grid-cols-[1.45fr_1fr] gap-8">
          {/* Letter grid */}
          <div>
            <p className="font-ui text-sm text-navy-800 mb-4 leading-[1.55]">
              Hebrew reads <strong className="font-semibold">right to left</strong>.
              Tap any letter to hear it and see where it appears in the prayers.
            </p>
            <div className="grid grid-cols-5 sm:grid-cols-7 gap-2 bg-parchment-100 border border-parchment-400 rounded-2xl p-3">
              {LETTERS.map((l, i) => (
                <button
                  key={i}
                  onClick={() => { setSelected(i); speak(l.letter); }}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-all focus:outline-none border ${
                    selected === i
                      ? "bg-navy-900 text-parchment-50 border-transparent"
                      : "bg-transparent border-transparent hover:bg-parchment-200/60 text-navy-900"
                  }`}
                >
                  <span className="font-hebrew text-[26px] sm:text-[30px] leading-none" dir="rtl" lang="he">
                    {l.letter}
                  </span>
                  <span className={`font-ui text-[10px] uppercase tracking-[0.06em] font-medium ${
                    selected === i ? "text-parchment-50/60" : "text-navy-700"
                  }`}>
                    {l.name.split(" / ")[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Detail panel */}
          {selected !== null ? (
            <aside className="bg-parchment-100 border border-parchment-400 rounded-2xl p-7 lg:sticky lg:top-[60px] self-start animate-scale-in">
              {/* Header: position + nav */}
              <div className="flex items-center justify-between mb-2">
                <p className="font-ui text-[11px] uppercase tracking-[0.14em] text-navy-700">
                  Letter {selected + 1} of {LETTERS.length}
                </p>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => { setSelected(Math.max(0, selected - 1)); speak(LETTERS[Math.max(0, selected - 1)].letter); }}
                    disabled={selected === 0}
                    className="w-7 h-7 rounded-md border border-parchment-400 grid place-items-center text-navy-800 hover:bg-parchment-200 disabled:opacity-30 focus:outline-none"
                  >
                    <Icon name="chevL" size={13} />
                  </button>
                  <button
                    onClick={() => { setSelected(Math.min(LETTERS.length - 1, selected + 1)); speak(LETTERS[Math.min(LETTERS.length - 1, selected + 1)].letter); }}
                    disabled={selected === LETTERS.length - 1}
                    className="w-7 h-7 rounded-md border border-parchment-400 grid place-items-center text-navy-800 hover:bg-parchment-200 disabled:opacity-30 focus:outline-none"
                  >
                    <Icon name="chevR" size={13} />
                  </button>
                </div>
              </div>

              {/* Letter display */}
              <div className="grid grid-cols-[auto_1fr] gap-6 items-center py-6 border-y border-parchment-400 mb-5">
                <span
                  className="font-hebrew text-navy-900 leading-[0.85]"
                  style={{ fontSize: 100 }}
                  dir="rtl" lang="he"
                >
                  {LETTERS[selected].letter}
                </span>
                <div>
                  <h2 className="font-heading font-normal text-[28px] tracking-tight text-navy-900 mb-0.5">
                    {LETTERS[selected].name}
                  </h2>
                  <p className="font-hebrew text-lg text-navy-700 mb-3" dir="rtl" lang="he">
                    {LETTERS[selected].hebrewName}
                  </p>
                  <p className="font-ui text-[11px] uppercase tracking-[0.08em] text-navy-700 mb-1">Sound</p>
                  <p className="font-ui text-base font-medium text-navy-900">
                    <code className="font-mono">{LETTERS[selected].sound}</code>
                    {LETTERS[selected].note && (
                      <span className="ml-2 font-ui text-sm text-navy-700 font-normal italic">{LETTERS[selected].note}</span>
                    )}
                  </p>
                </div>
              </div>

              {/* From the prayers */}
              <div className="bg-parchment-50 border border-parchment-400 rounded-xl p-4 mb-4">
                <p className="font-ui text-[11px] uppercase tracking-[0.14em] text-navy-700 mb-2.5">
                  From the prayers
                </p>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-hebrew text-[26px] text-navy-900" dir="rtl" lang="he">
                    {LETTERS[selected].example.hebrew}
                  </span>
                  <button
                    onClick={() => speak(LETTERS[selected].example.hebrew)}
                    className="text-navy-700 hover:text-navy-900 transition-colors focus:outline-none"
                  >
                    <Icon name="speaker" size={16} />
                  </button>
                </div>
                <p className="font-ui text-sm italic text-gold-400 mt-1">{LETTERS[selected].example.transliteration}</p>
                <p className="font-ui text-sm text-navy-800 mt-0.5">
                  <em>{LETTERS[selected].example.meaning}</em>
                </p>
              </div>

              <button
                onClick={() => speak(LETTERS[selected].letter)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-navy-900 text-parchment-50 font-ui text-sm font-medium hover:bg-navy-900/90 transition-colors focus:outline-none"
              >
                <Icon name="speaker" size={14} />
                Hear pronunciation
              </button>
            </aside>
          ) : (
            <div className="bg-parchment-100 border border-parchment-400 rounded-2xl p-7 flex items-center justify-center text-navy-700 font-ui text-sm">
              Select a letter to see details
            </div>
          )}
        </div>
      )}

      {tab === "vowels" && (
        <div>
          <p className="font-ui text-sm text-navy-800 mb-6 leading-[1.55]">
            Vowels (<em>nikud</em>) are small marks written below or above letters. Once you know these,
            you can pronounce almost any Hebrew word. Siddur text always includes nikud — a major advantage for learners.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {VOWELS.map((v, i) => (
              <div key={i} className="rounded-xl border border-parchment-400 bg-parchment-100 p-5 flex gap-4 items-start">
                <button
                  onClick={() => speak(v.example.hebrew)}
                  className="font-hebrew text-5xl text-navy-900 leading-none shrink-0 hover:scale-110 transition-transform focus:outline-none"
                  dir="rtl" lang="he" title="Click to hear"
                >
                  {v.displayOn}
                </button>
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <span className="font-ui font-semibold text-navy-900 text-sm tracking-tight">{v.name}</span>
                    <span className="font-hebrew text-sm text-navy-700" dir="rtl" lang="he">{v.hebrewName}</span>
                  </div>
                  <p className="font-ui text-xs text-gold-400 italic mb-1.5">"{v.sound}"</p>
                  {(v as any).note && (
                    <p className="font-ui text-xs text-navy-800 leading-relaxed mb-2">{(v as any).note}</p>
                  )}
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-hebrew text-base text-navy-900" dir="rtl" lang="he">{v.example.hebrew}</span>
                    <span className="font-ui text-xs text-gold-400 italic">{v.example.transliteration}</span>
                    <span className="font-ui text-xs text-navy-700">— {v.example.meaning}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
