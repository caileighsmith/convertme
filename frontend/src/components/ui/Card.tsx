import { HTMLAttributes } from "react";

interface Props extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
}

export function Card({ elevated = false, className = "", children, ...props }: Props) {
  return (
    <div
      className={`rounded-xl bg-parchment-50 border border-parchment-200 ${
        elevated ? "shadow-lg" : "shadow-sm"
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
