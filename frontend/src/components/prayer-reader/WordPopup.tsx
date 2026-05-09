"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { HebrewWord, WordDefinition } from "@/types/prayer";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Icon } from "@/components/ui/Icon";
import { sanitizeForSpeech } from "@/lib/speech";

interface Props {
  word: HebrewWord;
  definition: WordDefinition | null;
  loading: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
}

function useSpeech() {
  const [speaking, setSpeaking] = useState(false);
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;
  const speak = useCallback((text: string) => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(sanitizeForSpeech(text));
    utt.lang = "he-IL"; utt.rate = 0.85;
    utt.onstart = () => setSpeaking(true);
    utt.onend = () => setSpeaking(false);
    utt.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utt);
  }, [supported]);
  return { speak, speaking, supported };
}

function PopupInner({
  word, definition, loading, onClose, speak, speaking, supported,
}: {
  word: HebrewWord; definition: WordDefinition | null; loading: boolean;
  onClose: () => void; speak: (t: string) => void; speaking: boolean; supported: boolean;
}) {
  const transliteration = definition?.transliteration ?? word.transliteration;
  const definitions = definition?.definitions ?? [];

  return (
    <div className="p-[18px]">
      <div className="flex justify-between items-start">
        <div>
          <p
            className="font-hebrew text-[36px] text-navy-900 leading-none mb-1.5"
            dir="rtl" lang="he"
          >
            {word.word}
          </p>
          {transliteration && (
            <p className="font-ui text-sm italic text-gold-400" style={{ letterSpacing: "0.005em" }}>
              {transliteration}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-navy-700 hover:text-navy-900 mt-0.5 focus:outline-none"
          aria-label="Close"
        >
          <Icon name="x" size={14} />
        </button>
      </div>

      <hr className="border-parchment-400 my-3.5" />

      {loading ? (
        <div className="flex justify-center py-3"><LoadingSpinner size="sm" /></div>
      ) : definitions.length > 0 ? (
        <ul className="space-y-1.5 mb-0">
          {definitions.slice(0, 3).map((def, i) => (
            <li key={i} className={`font-ui text-[13px] leading-[1.5] ${i === 0 ? "text-navy-900 font-semibold" : "text-navy-800"}`}>
              {def}
            </li>
          ))}
        </ul>
      ) : (
        <p className="font-ui text-sm text-navy-700 italic text-center py-2">No definition found</p>
      )}

      <button
        onClick={() => speak(word.word)}
        disabled={!supported || speaking}
        className={`mt-3.5 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border font-ui text-xs font-medium transition-colors focus:outline-none ${
          speaking
            ? "border-gold-400 bg-gold-400/10 text-navy-900"
            : supported
            ? "border-parchment-500 bg-parchment-50 text-navy-900 hover:border-gold-400 hover:bg-gold-400/10"
            : "border-parchment-400 bg-parchment-50 text-navy-700 cursor-not-allowed"
        }`}
      >
        <Icon name="speaker" size={14} />
        {speaking ? "Playing…" : "Hear pronunciation"}
      </button>
    </div>
  );
}

export function WordPopup({ word, definition, loading, onClose, anchorRef }: Props) {
  const desktopRef = useRef<HTMLDivElement>(null);
  const mobileRef  = useRef<HTMLDivElement>(null);
  const { speak, speaking, supported } = useSpeech();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        !desktopRef.current?.contains(target) &&
        !mobileRef.current?.contains(target) &&
        !anchorRef.current?.contains(target)
      ) onClose();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose, anchorRef]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const innerProps = { word, definition, loading, onClose, speak, speaking, supported };

  return (
    <>
      {/* Mobile: bottom sheet */}
      <div
        ref={mobileRef}
        className="sm:hidden fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-parchment-100 border-t border-parchment-400 shadow-2xl animate-scale-in"
        role="dialog"
        aria-label={`Definition for ${word.word}`}
      >
        <div className="w-10 h-1 bg-parchment-400 rounded-full mx-auto mt-3 mb-1" />
        <PopupInner {...innerProps} />
      </div>
      <div className="sm:hidden fixed inset-0 z-40 bg-navy-900/20" onClick={onClose} />

      {/* Desktop: anchored popover centered under word */}
      <div
        ref={desktopRef}
        className="hidden sm:block absolute z-30 w-[280px] rounded-xl bg-parchment-100 border border-parchment-500 shadow-2xl animate-scale-in"
        style={{
          top: "calc(100% + 14px)",
          left: "50%",
          transform: "translateX(-50%)",
          direction: "ltr",
          textAlign: "left",
        }}
        role="dialog"
        aria-label={`Definition for ${word.word}`}
      >
        {/* Caret */}
        <span
          className="absolute bg-parchment-100 border-t border-l border-parchment-500"
          style={{
            top: -7, left: "50%", transform: "translateX(-50%) rotate(45deg)",
            width: 12, height: 12,
          }}
        />
        <PopupInner {...innerProps} />
      </div>
    </>
  );
}
