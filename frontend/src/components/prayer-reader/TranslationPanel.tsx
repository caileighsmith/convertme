"use client";

import { Icon } from "@/components/ui/Icon";

interface Props {
  english: string;
  title: string;
  onClose: () => void;
}

export function TranslationPanel({ english, title, onClose }: Props) {
  return (
    <div className="h-full flex flex-col animate-slide-in-right">
      <div className="flex items-start justify-between p-5 pb-4 border-b border-parchment-400">
        <div>
          <p className="font-ui text-[11px] uppercase tracking-[0.14em] text-navy-700 mb-1">
            English · Sefaria
          </p>
          <h3 className="font-ui text-sm font-semibold tracking-tight text-navy-900">
            {title}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-navy-700 hover:text-navy-900 mt-0.5 focus:outline-none"
          aria-label="Close translation panel"
        >
          <Icon name="x" size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 pb-8">
        {english ? (
          <p className="font-ui text-[15px] leading-[1.7] text-navy-800 whitespace-pre-wrap">
            {english}
          </p>
        ) : (
          <p className="font-ui text-sm text-navy-700 italic">
            No English translation available for this section.
          </p>
        )}
        <hr className="border-parchment-400 mt-6 mb-4" />
        <p className="font-ui text-xs text-navy-700">
          Translation from Sefaria Open Content Library
        </p>
      </div>
    </div>
  );
}
