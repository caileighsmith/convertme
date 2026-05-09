"use client";

import type { ServiceInfo, ServiceSectionMeta } from "@/types/prayer";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface Props {
  service: ServiceInfo;
  activeRef: string | null;
  loadingRef: string | null;
  onSelect: (ref: string) => void;
}

export function SectionList({ service, activeRef, loadingRef, onSelect }: Props) {
  const grouped: { group: string; sections: ServiceSectionMeta[] }[] = [];
  for (const section of service.sections) {
    const groupName = section.group ?? service.name;
    const last = grouped[grouped.length - 1];
    if (last && last.group === groupName) {
      last.sections.push(section);
    } else {
      grouped.push({ group: groupName, sections: [section] });
    }
  }

  const total = service.sections.filter((s) => !s.is_rubric).length;
  let num = 0;

  return (
    <div className="flex flex-col pt-4 border-t border-parchment-400">
      <div className="flex items-baseline justify-between px-2 pb-2">
        <p className="font-ui text-[11px] uppercase tracking-[0.14em] text-navy-700">
          {service.name} · Sections
        </p>
        <span className="font-ui text-[11px] text-navy-700">{total}</span>
      </div>

      {grouped.map(({ group, sections }) => (
        <div key={group} className="mb-2">
          <p className="font-ui text-[10px] font-semibold uppercase tracking-[0.06em] text-navy-700 px-2 py-1">
            {group}
          </p>
          {sections.map((section) => {
            if (!section.is_rubric) num++;
            const isActive = activeRef === section.ref;
            const isLoading = loadingRef === section.ref;
            return (
              <button
                key={section.ref}
                onClick={() => onSelect(section.ref)}
                disabled={isLoading}
                className={`w-full text-left px-2 py-1.5 rounded-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/50 ${
                  isActive
                    ? "bg-navy-900 text-parchment-50"
                    : section.is_rubric
                    ? "text-navy-700 hover:bg-parchment-200/60"
                    : "text-navy-900 hover:bg-parchment-200/60"
                }`}
                style={{ display: "grid", gridTemplateColumns: "20px 1fr auto", gap: "0 10px", alignItems: "center" }}
              >
                <span className={`font-ui text-[11px] tabular-nums ${isActive ? "text-parchment-50/55" : "text-navy-600"}`}>
                  {section.is_rubric ? "" : String(num).padStart(2, "0")}
                </span>
                <span className={`font-ui text-[13px] tracking-tight leading-snug ${
                  isActive ? "font-medium" : "font-normal"
                } ${section.is_rubric && !isActive ? "italic" : ""}`}>
                  {section.title}
                </span>
                <span className="flex items-center justify-end">
                  {isLoading && <LoadingSpinner size="sm" />}
                  {isActive && !isLoading && (
                    <span className="w-[5px] h-[5px] rounded-full bg-gold-400" />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
