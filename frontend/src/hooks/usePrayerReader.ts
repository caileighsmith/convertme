"use client";

import { useState, useCallback, useRef } from "react";
import type { ServiceInfo, PrayerSection, WordDefinition } from "@/types/prayer";
import { getPrayerSection, getWordDefinition } from "@/lib/api";

interface PrayerReaderState {
  selectedService: ServiceInfo | null;
  selectedSection: PrayerSection | null;
  selectedWordIndex: number | null;
  wordDefinition: WordDefinition | null;
  showNikud: boolean;
  showTranslation: boolean;
  sectionLoading: boolean;
  wordLoading: boolean;
  sectionError: string | null;
}

export function usePrayerReader() {
  const [state, setState] = useState<PrayerReaderState>({
    selectedService: null,
    selectedSection: null,
    selectedWordIndex: null,
    wordDefinition: null,
    showNikud: true,
    showTranslation: false,
    sectionLoading: false,
    wordLoading: false,
    sectionError: null,
  });

  // Keep a stable ref to current section so selectWord can read it without stale closure
  const sectionRef = useRef<PrayerSection | null>(null);
  sectionRef.current = state.selectedSection;

  const selectService = useCallback((service: ServiceInfo) => {
    setState((prev) => ({
      ...prev,
      selectedService: service,
      selectedSection: null,
      selectedWordIndex: null,
      wordDefinition: null,
      sectionError: null,
    }));
  }, []);

  const loadSection = useCallback(async (ref: string) => {
    setState((prev) => ({
      ...prev,
      sectionLoading: true,
      sectionError: null,
      selectedWordIndex: null,
      wordDefinition: null,
    }));
    try {
      const section = (await getPrayerSection(ref)) as PrayerSection;
      sectionRef.current = section;
      setState((prev) => ({ ...prev, selectedSection: section, sectionLoading: false }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        sectionLoading: false,
        sectionError: err instanceof Error ? err.message : "Failed to load section",
      }));
    }
  }, []);

  const selectWord = useCallback(async (index: number) => {
    const section = sectionRef.current;
    const word = section?.words[index];
    if (!word) return;

    setState((prev) => ({
      ...prev,
      selectedWordIndex: index,
      wordDefinition: null,
      wordLoading: true,
    }));

    try {
      const def = (await getWordDefinition(word.word, section?.ref ?? "")) as WordDefinition;
      setState((prev) => ({
        ...prev,
        wordDefinition: def,
        wordLoading: false,
      }));
    } catch {
      setState((prev) => ({ ...prev, wordLoading: false }));
    }
  }, []);

  const closeWordPopup = useCallback(() => {
    setState((prev) => ({ ...prev, selectedWordIndex: null, wordDefinition: null }));
  }, []);

  const toggleNikud = useCallback(() => {
    setState((prev) => ({ ...prev, showNikud: !prev.showNikud }));
  }, []);

  const toggleTranslation = useCallback(() => {
    setState((prev) => ({ ...prev, showTranslation: !prev.showTranslation }));
  }, []);

  return {
    ...state,
    selectService,
    loadSection,
    selectWord,
    closeWordPopup,
    toggleNikud,
    toggleTranslation,
  };
}
