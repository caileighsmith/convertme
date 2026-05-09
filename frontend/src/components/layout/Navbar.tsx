"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { useLocation } from "@/context/LocationContext";

const LINKS = [
  { href: "/prayer-reader", label: "Prayer Reader" },
  { href: "/practice",      label: "Hebrew Practice" },
  { href: "#",              label: "Find a Rabbi", disabled: true },
  { href: "#",              label: "Halacha",      disabled: true },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const { info } = useLocation();

  return (
    <nav className="sticky top-0 z-40 border-b border-parchment-400 bg-parchment-50">
      <div className="flex items-center justify-between px-6 sm:px-8 h-[60px]">
        {/* Brand + desktop nav */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <span
              className="w-[26px] h-[26px] rounded-[6px] bg-navy-900 text-parchment-50 grid place-items-center font-hebrew text-[18px] leading-none"
              style={{ paddingBottom: 2 }}
              lang="he"
            >
              א
            </span>
            <span className="font-ui text-[17px] font-semibold tracking-tight text-navy-900">
              Convertme
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-0.5">
            {LINKS.map((l) => (
              <NavLink key={l.href + l.label} href={l.href} active={path === l.href} disabled={l.disabled}>
                {l.label}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {info?.shabbatText && (
            <span className="hidden lg:block font-ui text-sm text-navy-700">
              {info.shabbatText}
            </span>
          )}
          <button
            onClick={() => setOpen((o) => !o)}
            className="md:hidden p-2 rounded-lg text-navy-800 hover:bg-parchment-200 transition-colors focus:outline-none"
            aria-label="Toggle menu"
          >
            <Icon name={open ? "x" : "menu"} size={18} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-parchment-400 bg-parchment-50 px-4 py-2 flex flex-col gap-0.5">
          {LINKS.map((l) => (
            <NavLink
              key={l.href + l.label}
              href={l.href}
              active={path === l.href}
              disabled={l.disabled}
              onClick={() => setOpen(false)}
              mobile
            >
              {l.label}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  );
}

function NavLink({
  href, children, active, disabled, onClick, mobile,
}: {
  href: string; children: React.ReactNode; active?: boolean;
  disabled?: boolean; onClick?: () => void; mobile?: boolean;
}) {
  const base = mobile
    ? "block px-3 py-2.5 rounded-lg text-sm font-ui tracking-tight transition-colors"
    : "px-3 py-2 rounded-lg text-sm font-ui tracking-tight transition-colors";

  if (disabled) {
    return (
      <span className={`${base} text-navy-600 cursor-not-allowed`}>
        {children}
        <span className="ml-1.5 text-[10px] text-navy-600">soon</span>
      </span>
    );
  }
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`${base} ${
        active
          ? "bg-parchment-200 text-navy-900 font-semibold"
          : "text-navy-800 hover:text-navy-900"
      }`}
    >
      {children}
    </Link>
  );
}
