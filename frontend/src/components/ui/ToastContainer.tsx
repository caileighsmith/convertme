"use client";

import type { Toast } from "@/hooks/useToast";

interface Props {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const typeStyles = {
  error: "bg-red-50 border-red-300 text-red-800",
  info: "bg-parchment-100 border-parchment-300 text-navy-800",
  success: "bg-green-50 border-green-300 text-green-800",
};

export function ToastContainer({ toasts, onRemove }: Props) {
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg animate-fade-in font-body text-sm max-w-sm ${typeStyles[toast.type]}`}
        >
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={() => onRemove(toast.id)}
            className="shrink-0 text-current opacity-60 hover:opacity-100"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
