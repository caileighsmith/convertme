"use client";

import { useRef, useCallback } from "react";
import type { PrayerSection, WordDefinition } from "@/types/prayer";
import { WordPopup } from "./WordPopup";
import { stripNikud } from "@/lib/transliteration";
import { Icon } from "@/components/ui/Icon";

export type ReaderMode = "study" | "reading";

export const READING_LEVELS = [
  { level: 1, label: "Word",   chunkSize: 1,        description: "1 word at a time" },
  { level: 2, label: "Phrase", chunkSize: 3,        description: "3-word phrases" },
  { level: 3, label: "Line",   chunkSize: 7,        description: "Full lines" },
  { level: 4, label: "Verse",  chunkSize: 15,       description: "Full verses" },
  { level: 5, label: "All",    chunkSize: Infinity, description: "Whole section" },
] as const;

const PACE_LABELS = ["Word", "Phrase", "Line", "Verse", "All"] as const;

interface Props {
  section: PrayerSection;
  serviceName?: string;
  mode: ReaderMode;
  showNikud: boolean;
  onToggleNikud: () => void;
  onToggleMode: () => void;
  selectedWordIndex: number | null;
  wordDefinition: WordDefinition | null;
  wordLoading: boolean;
  onWordClick: (index: number) => void;
  onClosePopup: () => void;
  readingLevel: number;
  readingChunk: number;
  onLevelChange: (level: number) => void;
  onChunkJump: (chunk: number) => void;
}

export function HebrewTextDisplay({
  section,
  serviceName,
  mode,
  showNikud,
  onToggleNikud,
  onToggleMode,
  selectedWordIndex,
  wordDefinition,
  wordLoading,
  onWordClick,
  onClosePopup,
  readingLevel,
  readingChunk,
  onLevelChange,
  onChunkJump,
}: Props) {
  const anchorRef = useRef<HTMLButtonElement | null>(null);

  const handleStudyClick = useCallback(
    (index: number, el: HTMLButtonElement | null) => {
      if (el) anchorRef.current = el;
      onWordClick(index);
    },
    [onWordClick]
  );

  const isReading = mode === "reading";
  const totalWords = section.words.length;
  const levelConfig = READING_LEVELS[readingLevel - 1];
  const chunkSize = levelConfig.chunkSize;
  const isFullSection = chunkSize === Infinity;

  const totalChunks = isFullSection ? 1 : Math.ceil(totalWords / chunkSize);
  const chunkStart = isFullSection ? 0 : readingChunk * chunkSize;
  const chunkEnd = isFullSection ? totalWords : Math.min(chunkStart + chunkSize, totalWords);

  return (
    <div className="flex flex-col h-full">

      {/* ── Header ── */}
      <div className="px-6 sm:px-10 py-5 border-b border-parchment-400 flex items-center justify-between gap-4 flex-shrink-0 bg-parchment-100">
        <div className="min-w-0">
          {serviceName && (
            <p className="font-ui text-xs text-navy-700 mb-1">
              {serviceName}{section.title ? <> <span className="text-navy-600 mx-1">/</span> {section.title}</> : ""}
            </p>
          )}
          <h1 className="font-ui text-xl font-semibold tracking-tight text-navy-900 truncate">
            {section.title}
          </h1>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap justify-end">
          {/* Study / Follow-along segmented control */}
          <div className="flex p-0.5 rounded-lg bg-parchment-200 text-xs">
            {(["study", "reading"] as const).map((m) => (
              <button
                key={m}
                onClick={() => mode !== m && onToggleMode()}
                className={`px-3 py-1.5 rounded-md font-ui transition-all focus:outline-none ${
                  mode === m
                    ? "bg-parchment-100 text-navy-900 font-semibold shadow-sm"
                    : "text-navy-800 hover:text-navy-900"
                }`}
              >
                {m === "study" ? "Study" : "Follow-along"}
              </button>
            ))}
          </div>

          {/* Pace selector (reading mode only) */}
          {isReading && (
            <div className="flex items-center gap-1">
              <span className="font-ui text-[11px] uppercase tracking-[0.08em] text-navy-700 mr-1">Pace</span>
              {PACE_LABELS.map((label, i) => (
                <button
                  key={label}
                  onClick={() => onLevelChange(i + 1)}
                  title={READING_LEVELS[i].description}
                  className={`px-2 py-1 rounded font-ui text-xs transition-all focus:outline-none ${
                    readingLevel === i + 1
                      ? "bg-navy-900 text-parchment-50 font-semibold"
                      : "text-navy-800 hover:bg-parchment-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Vowels toggle */}
          <div className="flex items-center gap-2">
            <span className="font-ui text-xs text-navy-800 hidden sm:block">Vowels</span>
            <button
              onClick={onToggleNikud}
              role="switch"
              aria-checked={showNikud}
              aria-label="Toggle vowels"
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                showNikud ? "bg-navy-900" : "bg-parchment-400"
              }`}
            >
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                showNikud ? "translate-x-[18px]" : "translate-x-[2px]"
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Hebrew text ── */}
      <div className="flex-1 overflow-y-auto px-6 sm:px-14 py-12" dir="rtl" lang="he">
        <div
          className="font-hebrew text-navy-900 mx-auto flex flex-wrap"
          style={{
            fontSize: 40,
            lineHeight: isReading ? 2.6 : 1.85,
            direction: "rtl",
            gap: isReading ? "8px 16px" : "0 14px",
            maxWidth: 720,
          }}
        >
          {section.words.map((word, index) => {
            const displayWord = showNikud ? word.word : stripNikud(word.word);

            if (isReading) {
              const inChunk   = index >= chunkStart && index < chunkEnd;
              const isPast    = !isFullSection && index < chunkStart;
              const showTranslit = inChunk || isFullSection;

              return (
                <span key={index} className="relative inline-flex flex-col items-center">
                  <button
                    onClick={() => {
                      if (!isFullSection) onChunkJump(Math.floor(index / chunkSize));
                    }}
                    className={`px-2 py-0.5 rounded-md transition-all duration-150 focus:outline-none ${
                      inChunk && !isFullSection
                        ? "text-navy-900"
                        : isPast
                        ? "text-navy-700"
                        : "hover:bg-parchment-200/60"
                    }`}
                    style={
                      inChunk && !isFullSection
                        ? { background: "rgba(168,101,31,0.10)", boxShadow: "inset 0 -2px 0 #a8651f" }
                        : undefined
                    }
                  >
                    {displayWord}
                  </button>
                  <span
                    className={`font-ui text-xs leading-none mt-1 transition-all ${
                      showTranslit
                        ? inChunk && !isFullSection
                          ? "text-gold-400 font-semibold opacity-100"
                          : "text-navy-700 opacity-70"
                        : "opacity-0 select-none pointer-events-none"
                    }`}
                    dir="ltr"
                    aria-hidden={!showTranslit}
                    style={{ letterSpacing: "0.01em" }}
                  >
                    {word.transliteration}
                  </span>
                </span>
              );
            }

            // Study mode
            const isSelected = selectedWordIndex === index;
            return (
              <span key={index} className="relative inline-block">
                <button
                  ref={(el) => { if (isSelected) anchorRef.current = el; }}
                  onClick={(e) => handleStudyClick(index, e.currentTarget)}
                  className={`relative px-2 py-0.5 rounded-md transition-all duration-150 cursor-pointer focus:outline-none group ${
                    isSelected ? "scale-110" : ""
                  }`}
                  style={
                    isSelected
                      ? { background: "rgba(168,101,31,0.10)", boxShadow: "inset 0 -3px 0 #a8651f" }
                      : undefined
                  }
                >
                  <span className={`absolute inset-x-2 bottom-0 h-[2px] bg-gold-400 transition-all duration-200 ${
                    isSelected ? "opacity-0" : "opacity-0 group-hover:opacity-100"
                  }`} />
                  {displayWord}
                </button>
                {isSelected && (
                  <WordPopup
                    word={word}
                    definition={wordDefinition}
                    loading={wordLoading}
                    onClose={onClosePopup}
                    anchorRef={anchorRef as React.RefObject<HTMLButtonElement | null>}
                  />
                )}
              </span>
            );
          })}
        </div>
      </div>

      {/* ── Reading mode nav ── */}
      {isReading && !isFullSection && (
        <div className="flex-shrink-0 border-t border-parchment-400 bg-parchment-50 px-6 sm:px-10 py-3.5 flex items-center justify-between">
          <button
            onClick={() => onChunkJump(Math.max(0, readingChunk - 1))}
            disabled={readingChunk === 0}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-parchment-500 font-ui text-sm text-navy-900 hover:bg-parchment-100 disabled:opacity-30 transition-all focus:outline-none"
          >
            <Icon name="chevL" size={13} /> Previous
          </button>

          {/* Progress dots or counter */}
          <div className="flex items-center gap-1.5">
            {totalChunks <= 20 ? (
              <>
                {Array.from({ length: totalChunks }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => onChunkJump(i)}
                    className={`rounded-full transition-all focus:outline-none ${
                      i === readingChunk
                        ? "w-2 h-2 bg-gold-400 scale-125"
                        : i < readingChunk
                        ? "w-1.5 h-1.5 bg-navy-600"
                        : "w-1.5 h-1.5 bg-parchment-500"
                    }`}
                    aria-label={`Jump to chunk ${i + 1}`}
                  />
                ))}
                <span className="font-ui text-xs text-navy-700 tabular-nums ml-3">
                  {readingChunk + 1} / {totalChunks}
                </span>
              </>
            ) : (
              <span className="font-ui text-xs text-navy-700 tabular-nums">
                {readingChunk + 1} / {totalChunks}
              </span>
            )}
          </div>

          <button
            onClick={() => onChunkJump(Math.min(totalChunks - 1, readingChunk + 1))}
            disabled={readingChunk >= totalChunks - 1}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-navy-900 text-parchment-50 font-ui text-sm hover:bg-navy-900/90 disabled:opacity-30 transition-all focus:outline-none"
          >
            Next <Icon name="chevR" size={13} />
          </button>
        </div>
      )}
    </div>
  );
}
