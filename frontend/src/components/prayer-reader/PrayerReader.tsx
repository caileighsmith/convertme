"use client";

import { useEffect, useState, useCallback } from "react";
import type { ServiceInfo } from "@/types/prayer";
import { getServices, getService } from "@/lib/api";
import { usePrayerReader } from "@/hooks/usePrayerReader";
import { ServiceSelector } from "./ServiceSelector";
import { SectionList } from "./SectionList";
import { HebrewTextDisplay, READING_LEVELS, type ReaderMode } from "./HebrewTextDisplay";
import { TranslationPanel } from "./TranslationPanel";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/ToastContainer";

export function PrayerReader() {
  const [services, setServices] = useState<ServiceInfo[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [loadingRef, setLoadingRef] = useState<string | null>(null);
  const [mode, setMode] = useState<ReaderMode>("study");
  const [readingLevel, setReadingLevel] = useState(1);
  const [readingChunk, setReadingChunk] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { addToast, toasts, removeToast } = useToast();

  const {
    selectedService, selectedSection, selectedWordIndex,
    wordDefinition, showNikud, showTranslation,
    sectionLoading, wordLoading, sectionError,
    selectService, loadSection, selectWord,
    closeWordPopup, toggleNikud, toggleTranslation,
  } = usePrayerReader();

  useEffect(() => {
    getServices()
      .then(async (svcList) => {
        const full = await Promise.all(
          (svcList as ServiceInfo[]).map((s: ServiceInfo) => getService(s.id))
        );
        setServices(full as ServiceInfo[]);
      })
      .catch(() => addToast("Could not load services. Is the backend running?", "error"))
      .finally(() => setServicesLoading(false));
  }, [addToast]);

  const handleSectionSelect = useCallback(
    async (ref: string) => {
      setLoadingRef(ref);
      setReadingChunk(0);
      setSidebarOpen(false);
      await loadSection(ref);
      setLoadingRef(null);
      if (sectionError) addToast(sectionError, "error");
    },
    [loadSection, sectionError, addToast]
  );

  const toggleMode = useCallback(() => {
    setMode((m) => (m === "study" ? "reading" : "study"));
    setReadingChunk(0);
  }, []);

  const handleLevelChange = useCallback((level: number) => {
    setReadingLevel(level);
    setReadingChunk(0);
  }, []);

  useEffect(() => {
    if (mode !== "reading" || !selectedSection) return;
    const chunkSize = READING_LEVELS[readingLevel - 1].chunkSize;
    if (chunkSize === Infinity) return;
    const totalChunks = Math.ceil(selectedSection.words.length / chunkSize);
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") setReadingChunk((c) => Math.max(0, c - 1));
      if (e.key === "ArrowLeft")  setReadingChunk((c) => Math.min(totalChunks - 1, c + 1));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, selectedSection, readingLevel]);

  return (
    <div className="bg-parchment-50 relative" style={{ height: "calc(100vh - 60px)" }}>
      <div className="relative z-10 flex h-full overflow-hidden">

        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-navy-900/40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Sidebar ── */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-50 w-[304px] flex flex-col overflow-hidden
            border-r border-parchment-400 bg-parchment-50
            transition-transform duration-300
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            lg:static lg:translate-x-0 lg:z-auto
          `}
          style={{ top: "60px" }}
        >
          {/* Search bar */}
          <div className="px-4 py-4 pb-3">
            <div className="flex items-center gap-2.5 bg-parchment-100 border border-parchment-400 rounded-lg px-3 py-2.5 font-ui text-sm text-navy-700">
              <Icon name="search" size={14} color="#8a8170" />
              <span>Search prayers, words…</span>
              <span className="ml-auto font-ui text-[11px] px-1.5 py-0.5 border border-parchment-400 rounded text-navy-700">⌘K</span>
            </div>
          </div>

          {/* Mobile close */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden absolute top-4 right-4 text-navy-700 hover:text-navy-900 focus:outline-none"
            aria-label="Close menu"
          >
            <Icon name="x" size={16} />
          </button>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-3 pb-4">
            {servicesLoading ? (
              <div className="flex justify-center pt-12"><LoadingSpinner size="lg" /></div>
            ) : (
              <>
                <ServiceSelector
                  services={services}
                  selectedId={selectedService?.id ?? null}
                  onSelect={(svc) => { selectService(svc); setSidebarOpen(false); }}
                  fullServices={services}
                />
                {selectedService && (
                  <SectionList
                    service={selectedService}
                    activeRef={selectedSection?.ref ?? null}
                    loadingRef={loadingRef}
                    onSelect={handleSectionSelect}
                  />
                )}
              </>
            )}
          </div>

          {/* Sidebar footer */}
          <div className="border-t border-parchment-400 px-5 py-3.5 flex items-center justify-between font-ui text-xs text-navy-700 shrink-0">
            <span>Ashkenazi · Nusach Ashkenaz</span>
            <button className="inline-flex items-center gap-1 hover:text-navy-900 transition-colors focus:outline-none">
              Change <Icon name="chevR" size={11} />
            </button>
          </div>
        </aside>

        {/* ── Main area ── */}
        <main className="flex-1 overflow-hidden flex flex-col min-w-0 bg-parchment-100">

          {/* Mobile menu toggle */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-3 border-b border-parchment-400 bg-parchment-50 text-navy-900 font-ui text-sm hover:bg-parchment-200/60 transition-colors focus:outline-none"
          >
            <Icon name="menu" size={16} />
            <span className="truncate">{selectedSection?.title ?? selectedService?.name ?? "Choose service"}</span>
          </button>

          {sectionLoading ? (
            <div className="flex flex-col items-center justify-center flex-1 gap-4">
              <LoadingSpinner size="lg" />
              <p className="font-ui text-sm text-navy-700">Loading from Sefaria…</p>
            </div>
          ) : sectionError ? (
            <div className="flex items-center justify-center flex-1">
              <div className="max-w-md text-center rounded-2xl bg-parchment-50 border border-parchment-400 p-8">
                <p className="font-ui text-lg font-semibold text-navy-900 mb-2">Section unavailable</p>
                <p className="font-ui text-sm text-navy-700 leading-relaxed">
                  This section isn't yet in the digital library.
                </p>
              </div>
            </div>
          ) : selectedSection ? (
            <div className="flex-1 overflow-hidden flex flex-col">
              <HebrewTextDisplay
                section={selectedSection}
                serviceName={selectedService?.name}
                mode={mode}
                selectedWordIndex={selectedWordIndex}
                wordDefinition={wordDefinition}
                wordLoading={wordLoading}
                showNikud={showNikud}
                readingLevel={readingLevel}
                readingChunk={readingChunk}
                onWordClick={selectWord}
                onClosePopup={closeWordPopup}
                onToggleNikud={toggleNikud}
                onToggleMode={toggleMode}
                onLevelChange={handleLevelChange}
                onChunkJump={setReadingChunk}
              />
            </div>
          ) : (
            <EmptyState hasService={!!selectedService} onOpenMenu={() => setSidebarOpen(true)} />
          )}
        </main>

        {/* Translation panel */}
        {showTranslation && selectedSection && (
          <aside className="hidden sm:block w-80 lg:w-96 shrink-0 border-l border-parchment-400 bg-parchment-50 overflow-y-auto">
            <TranslationPanel
              english={selectedSection.english}
              title={selectedSection.title}
              onClose={toggleTranslation}
            />
          </aside>
        )}

        {/* English toggle button */}
        {selectedSection && (
          <button
            onClick={toggleTranslation}
            className="hidden sm:flex fixed right-0 top-1/2 -translate-y-1/2 z-20 bg-navy-900 text-parchment-50 font-ui text-xs px-3 py-2 rounded-l-lg shadow-lg hover:bg-navy-900/90 transition-colors focus:outline-none"
            style={{ writingMode: "vertical-rl" }}
          >
            {showTranslation ? "Hide English" : "English ↔"}
          </button>
        )}
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

function EmptyState({ hasService, onOpenMenu }: { hasService: boolean; onOpenMenu: () => void }) {
  return (
    <div className="flex items-center justify-center flex-1">
      <div className="max-w-lg text-center px-4">
        <div
          className="font-hebrew text-[80px] sm:text-[100px] mb-6 select-none text-navy-900"
          style={{ opacity: 0.07 }}
          dir="rtl" lang="he"
        >
          שָׁלוֹם
        </div>
        <h2 className="font-ui text-xl sm:text-2xl font-semibold tracking-tight text-navy-900 mb-3">
          {hasService ? "Choose a section" : "Choose a service"}
        </h2>
        <p className="font-ui text-navy-700 leading-relaxed text-sm sm:text-base mb-6">
          {hasService
            ? "Select a prayer section from the sidebar to begin reading."
            : "Select a daily service to begin your prayer study."}
        </p>
        <button
          onClick={onOpenMenu}
          className="lg:hidden inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-navy-900 text-parchment-50 font-ui text-sm hover:bg-navy-900/90 transition-colors"
        >
          <Icon name="menu" size={14} />
          {hasService ? "Browse sections" : "Browse services"}
        </button>
      </div>
    </div>
  );
}
