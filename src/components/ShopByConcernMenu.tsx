"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { WellnessIcon } from "@/components/icons";
import { CONCERNS } from "@/lib/concerns";

/** Delay before a hover-out closes the menu, so crossing the gap doesn't. */
const CLOSE_DELAY_MS = 160;

export function ShopByConcernMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function cancelClose() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  function scheduleClose() {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS);
  }

  useEffect(() => cancelClose, []);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    // `self-stretch` makes this wrapper span the full header row, so the panel's
    // `top-full` lands at the bottom of the header rather than mid-way up it.
    <div
      className="relative flex items-center self-stretch"
      ref={ref}
      onMouseEnter={() => {
        cancelClose();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
    >
      <div className="flex items-center gap-1">
        {/* The label is a real link to its own page — the dropdown is a
            shortcut, not the only way in. */}
        <Link href="/shop-by-concern" className="transition hover:text-ink">
          Shop by Concern
        </Link>
        {/* Separate control so keyboard and touch users can open the submenu
            without it hijacking the link. */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-haspopup="true"
          aria-label="Show concern categories"
          className="flex h-5 w-5 items-center justify-center rounded transition hover:text-ink"
        >
          <svg
            viewBox="0 0 12 8"
            width="10"
            height="7"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform ${open ? "rotate-180" : ""}`}
            aria-hidden="true"
          >
            <path d="M1 1.5 6 6.5 11 1.5" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="absolute left-1/2 top-full z-50 w-[34rem] -translate-x-1/2 pt-3">
          <div className="rounded-2xl border border-line bg-paper p-3 shadow-xl">
            <div className="grid grid-cols-2 gap-1">
              {CONCERNS.map((c) => (
                <Link
                  key={c.href}
                  href={c.href}
                  onClick={() => setOpen(false)}
                  className="group flex items-start gap-3 rounded-xl px-3 py-2.5 transition hover:bg-paper-soft"
                >
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-chip-border bg-chip-bg text-ink-soft transition group-hover:text-ink">
                    <WellnessIcon name={c.icon} size={16} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-ink">{c.label}</span>
                    <span className="block text-xs text-ink-faint">{c.blurb}</span>
                  </span>
                </Link>
              ))}
            </div>

            <Link
              href="/shop-by-concern"
              onClick={() => setOpen(false)}
              className="mt-2 block border-t border-line px-3 pb-1 pt-3 text-sm text-ink-soft transition hover:text-ink"
            >
              Browse all concerns →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
