"use client";

import type { ServiceInfo } from "@/types/prayer";
import { Icon } from "@/components/ui/Icon";

interface Props {
  services: Pick<ServiceInfo, "id" | "name" | "hebrew_name" | "description">[];
  selectedId: string | null;
  onSelect: (service: ServiceInfo) => void;
  fullServices: ServiceInfo[];
}

const SERVICE_ICONS: Record<string, string> = {
  shacharit:           "sun",
  mincha:              "horizon",
  maariv:              "moon",
  "shabbat-kabbalat":  "candle",
  "shabbat-maariv":    "moon",
  "shabbat-shacharit": "sun",
  "shabbat-musaf":     "book",
  "shabbat-mincha":    "horizon",
};

function ServiceRow({
  svc, isSelected, onSelect,
}: {
  svc: Pick<ServiceInfo, "id" | "name" | "hebrew_name">;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const icon = SERVICE_ICONS[svc.id] ?? "book";
  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center gap-3 px-2 py-2.5 rounded-lg transition-all focus:outline-none text-left ${
        isSelected
          ? "bg-parchment-200 text-navy-900"
          : "hover:bg-parchment-200/60 text-navy-900"
      }`}
    >
      <span className={`w-[26px] h-[26px] rounded-md grid place-items-center shrink-0 transition-colors ${
        isSelected
          ? "bg-navy-900 text-parchment-50"
          : "border border-parchment-400 text-navy-800"
      }`}>
        <Icon name={icon} size={14} />
      </span>
      <span className={`flex-1 font-ui text-sm tracking-tight ${isSelected ? "font-semibold" : "font-medium"}`}>
        {svc.name}
      </span>
      <span className="font-hebrew text-base text-navy-700" lang="he" dir="rtl">
        {svc.hebrew_name}
      </span>
    </button>
  );
}

export function ServiceSelector({ services, selectedId, onSelect, fullServices }: Props) {
  const weekday = services.filter((s) => !s.id.startsWith("shabbat-"));
  const shabbat  = services.filter((s) =>  s.id.startsWith("shabbat-"));

  const handleSelect = (id: string) => {
    const full = fullServices.find((s) => s.id === id);
    if (full) onSelect(full);
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="font-ui text-[11px] uppercase tracking-[0.14em] text-navy-700 px-2 mb-1.5">Daily</p>
        <div className="flex flex-col gap-0.5">
          {weekday.map((svc) => (
            <ServiceRow
              key={svc.id}
              svc={svc}
              isSelected={selectedId === svc.id}
              onSelect={() => handleSelect(svc.id)}
            />
          ))}
        </div>
      </div>

      {shabbat.length > 0 && (
        <div>
          <p className="font-ui text-[11px] uppercase tracking-[0.14em] text-navy-700 px-2 mb-1.5">Shabbat</p>
          <div className="flex flex-col gap-0.5">
            {shabbat.map((svc) => (
              <ServiceRow
                key={svc.id}
                svc={svc}
                isSelected={selectedId === svc.id}
                onSelect={() => handleSelect(svc.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
