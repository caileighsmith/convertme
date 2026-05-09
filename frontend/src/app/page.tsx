"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";

type IconName = "sun" | "horizon" | "moon";

interface Feature {
  title: string;
  desc: string;
  icon: string;
  live?: boolean;
  href?: string;
  soon?: boolean;
}

const DAILY_SERVICES: { id: string; name: string; he: string; time: string; icon: IconName }[] = [
  { id: "shacharit", name: "Shacharit", he: "שַׁחֲרִית", time: "Morning · until 11:43am", icon: "sun" },
  { id: "mincha",    name: "Mincha",    he: "מִנְחָה",   time: "Afternoon · until 6:51pm", icon: "horizon" },
  { id: "maariv",    name: "Maariv",    he: "מַעֲרִיב",  time: "Evening · from 7:42pm",   icon: "moon" },
];

function getCurrentServiceId(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "shacharit";
  if (h >= 12 && h < 18) return "mincha";
  return "maariv";
}

const FEATURES: Feature[] = [
  { title: "Hebrew Practice",    desc: "The 22 letters, vowels, and the phrases you'll hear in every service.", icon: "alef",       live: true,  href: "/practice" },
  { title: "Find a Rabbi",       desc: "Connect with rabbis who specialise in guiding conversion candidates.",   icon: "users",      soon: true },
  { title: "Halacha Guide",      desc: "Clear, compassionate explanations of Jewish law and practice.",          icon: "scale",      soon: true },
  { title: "Conversion Roadmap", desc: "Track milestones from first inquiry to mikveh, with your rabbi.",       icon: "milestones", soon: true },
  { title: "Holiday Calendar",   desc: "Shabbat times, festivals, and what to expect at each.",                 icon: "calendar",   soon: true },
  { title: "Community",          desc: "Questions, stories, and support from others on the same path.",         icon: "compass",    soon: true },
];

export default function HomePage() {
  const [currentId, setCurrentId] = useState<string | null>(null);

  useEffect(() => { setCurrentId(getCurrentServiceId()); }, []);

  const doneIds = currentId === "mincha"
    ? ["shacharit"]
    : currentId === "maariv"
    ? ["shacharit", "mincha"]
    : [];

  return (
    <div className="bg-parchment-50 px-6 sm:px-8 lg:px-14">
      {/* ── Hero ── */}
      <section className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-14 items-end pt-16 pb-16 border-b border-parchment-400">
        <div>
          <p className="font-ui text-[11px] uppercase tracking-[0.14em] text-navy-700 mb-5">
            A guide for the journey
          </p>
          <h1 className="font-heading font-normal text-[clamp(44px,5.5vw,76px)] leading-[1.05] tracking-tight text-navy-900 mb-6 max-w-2xl">
            The siddur,<br/>
            <em className="text-navy-800">open</em> for you.
          </h1>
          <p className="font-ui text-lg leading-[1.55] text-navy-800 max-w-[480px] mb-8">
            Convertme is a quiet companion for people coming to Judaism. Read the prayers
            word by word, learn the alphabet at your own pace, and follow the service with confidence.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/prayer-reader"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-navy-900 text-parchment-50 font-ui text-sm font-medium hover:bg-navy-900/90 transition-colors"
            >
              Open prayer reader <Icon name="chevR" size={14} />
            </Link>
            <Link
              href="/practice"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-parchment-500 font-ui text-sm font-medium text-navy-900 hover:bg-parchment-100 transition-colors"
            >
              Start with Aleph
            </Link>
          </div>
        </div>

        {/* Today panel */}
        <aside className="bg-parchment-100 border border-parchment-400 rounded-2xl p-7 mt-6 lg:mt-0">
          <div className="flex items-baseline justify-between mb-5">
            <p className="font-ui text-[11px] uppercase tracking-[0.14em] text-navy-700">
              Today · {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
            <p className="font-ui text-xs text-navy-700">Brooklyn, NY</p>
          </div>
          <div className="flex flex-col gap-0">
            {DAILY_SERVICES.map((s) => {
              const isCurrent = s.id === currentId;
              const isDone = doneIds.includes(s.id);
              return (
                <Link
                  key={s.id}
                  href="/prayer-reader"
                  className={`grid grid-cols-[auto_1fr_auto] items-center gap-4 px-1 py-4 border-t border-parchment-400 transition-opacity ${isDone ? "opacity-55" : "hover:opacity-80"}`}
                >
                  <span className={`w-8 h-8 rounded-lg grid place-items-center shrink-0 ${
                    isCurrent ? "bg-navy-900 text-parchment-50" : "border border-parchment-400 text-navy-800"
                  }`}>
                    <Icon name={s.icon} size={16} />
                  </span>
                  <div>
                    <div className="flex items-baseline gap-2.5 flex-wrap">
                      <span className="font-ui text-base font-semibold tracking-tight text-navy-900">{s.name}</span>
                      <span className="font-hebrew text-lg text-navy-700" lang="he" dir="rtl">{s.he}</span>
                      {isCurrent && (
                        <span className="font-ui text-[10px] font-semibold uppercase tracking-[0.1em] text-gold-400 bg-gold-400/10 px-1.5 py-0.5 rounded">
                          Now
                        </span>
                      )}
                    </div>
                    <p className="font-ui text-sm text-navy-700 mt-0.5">{s.time}</p>
                  </div>
                  <span className="text-navy-700 shrink-0">
                    {isDone ? <span className="font-ui text-xs">Read</span> : <Icon name="chevR" size={16} />}
                  </span>
                </Link>
              );
            })}
          </div>
        </aside>
      </section>

      {/* ── Prayer reader preview ── */}
      <section className="pt-16 pb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-2 mb-7">
          <div>
            <p className="font-ui text-[11px] uppercase tracking-[0.14em] text-navy-700 mb-2">Live now</p>
            <h2 className="font-heading text-[clamp(28px,3vw,36px)] font-normal tracking-tight text-navy-900">
              The Hebrew Prayer Reader
            </h2>
          </div>
          <Link href="/prayer-reader" className="font-ui text-sm text-navy-800 inline-flex items-center gap-1.5 shrink-0">
            Open reader <Icon name="chevR" size={13} />
          </Link>
        </div>

        <div className="border border-parchment-400 rounded-2xl bg-parchment-100 grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] overflow-hidden">
          <div className="p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-parchment-400">
            <p className="font-ui text-base leading-[1.6] text-navy-800 mb-7">
              Follow Shacharit, Mincha, and Maariv word by word. Tap any Hebrew word to see
              its Ashkenazi pronunciation and English meaning. Toggle vowel marks on or off
              as you grow in confidence — and switch into <em>follow-along</em> mode to keep pace with the room.
            </p>
            <div className="flex gap-8 flex-wrap">
              {[["8", "services covered"], ["1,402", "words explorable"], ["Sefaria", "open library"]].map(([n, l]) => (
                <div key={l}>
                  <div className="font-heading text-[28px] font-normal text-navy-900">{n}</div>
                  <div className="font-ui text-xs text-navy-700 mt-1">{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="p-8 lg:p-10 relative bg-parchment-100">
            <div
              className="font-hebrew text-[clamp(28px,3.5vw,38px)] text-navy-900 text-right leading-[1.9]"
              dir="rtl" lang="he"
            >
              בָּרוּךְ אַתָּה{" "}
              <span className="bg-gold-400/10 rounded-lg px-1.5" style={{ boxShadow: "inset 0 -2px 0 #a8651f" }}>
                יְיָ
              </span>{" "}
              אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם
            </div>
            <p className="absolute right-8 bottom-6 font-ui text-xs text-navy-700 italic">
              Birkat HaMazon — opening blessing
            </p>
          </div>
        </div>
      </section>

      {/* ── Coming soon ── */}
      <section className="pt-14 pb-24">
        <div className="mb-7">
          <p className="font-ui text-[11px] uppercase tracking-[0.14em] text-navy-700 mb-2">What&apos;s next</p>
          <h2 className="font-heading text-[clamp(24px,2.5vw,30px)] font-normal tracking-tight text-navy-900">
            Convertme is growing.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border border-parchment-400 rounded-2xl bg-parchment-100 overflow-hidden">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className={`p-7 ${i % 3 !== 2 ? "lg:border-r border-parchment-400" : ""} ${i < 3 ? "border-b border-parchment-400" : ""} ${f.live ? "" : "opacity-70"}`}
            >
              {f.live && f.href ? (
                <Link href={f.href} className="block">
                  <FeatureContent f={f} />
                </Link>
              ) : (
                <FeatureContent f={f} />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-parchment-400 py-8 flex flex-col sm:flex-row justify-between gap-2 font-ui text-xs text-navy-700">
        <span>Convertme · A companion for the journey</span>
        <span>Texts from Sefaria, the open Jewish library</span>
      </footer>
    </div>
  );
}

function FeatureContent({ f }: { f: Feature }) {
  return (
    <>
      <div className={`w-8 h-8 rounded-lg grid place-items-center mb-4 ${
        f.live ? "bg-navy-900 text-parchment-50" : "bg-parchment-200 text-navy-800"
      }`}>
        <Icon name={f.icon} size={16} />
      </div>
      <div className="flex items-center gap-2 mb-1.5">
        <h3 className="font-ui text-[15px] font-semibold tracking-tight text-navy-900">{f.title}</h3>
        {f.live && (
          <span className="font-ui text-[10px] font-semibold uppercase tracking-[0.1em] text-gold-400 bg-gold-400/10 px-1.5 py-0.5 rounded">
            Live
          </span>
        )}
        {f.soon && (
          <span className="font-ui text-[10px] font-medium uppercase tracking-[0.1em] text-navy-700">
            Soon
          </span>
        )}
      </div>
      <p className="font-ui text-sm leading-[1.55] text-navy-800">{f.desc}</p>
    </>
  );
}
