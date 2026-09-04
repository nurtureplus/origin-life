"use client";

import { useState } from "react";
import { buttonClass } from "@/lib/button";

type Props = {
  report: "sales" | "customers";
  /** Show the date pickers that narrow the export. */
  withRange?: boolean;
  /** Rendered above the buttons. */
  label?: string;
};

const FORMATS = [
  { format: "xlsx", label: "Excel", hint: "Full data, filterable" },
  { format: "pdf", label: "PDF", hint: "Print-ready summary" },
  { format: "csv", label: "CSV", hint: "For import elsewhere" },
] as const;

const PRESETS = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
] as const;

/** `2026-08-02` in IST, matching what the API expects. */
function istDateString(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Kolkata",
  }).format(d);
}

export function ReportDownload({ report, withRange = false, label }: Props) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  function href(format: string) {
    const params = new URLSearchParams({ format });
    if (withRange && from) params.set("from", from);
    if (withRange && to) params.set("to", to);
    return `/api/admin/reports/${report}?${params}`;
  }

  function applyPreset(days: number) {
    const now = new Date();
    const start = new Date(now.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
    setFrom(istDateString(start));
    setTo(istDateString(now));
  }

  const ranged = withRange && (from || to);

  return (
    <div className="rounded-2xl border border-line bg-paper-soft p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-medium">{label ?? "Download report"}</h2>
          <p className="mt-1 text-xs text-ink-faint">
            {withRange
              ? ranged
                ? "Exporting the selected date range."
                : "Exporting all time — pick dates below to narrow it."
              : "Includes every registered account with contact details."}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {FORMATS.map((f) => (
            <a
              key={f.format}
              href={href(f.format)}
              title={f.hint}
              className={buttonClass({ size: "sm" })}
            >
              ↓ {f.label}
            </a>
          ))}
        </div>
      </div>

      {withRange && (
        <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-line pt-4">
          <label className="text-xs text-ink-soft">
            <span className="block">From</span>
            <input
              type="date"
              value={from}
              max={to || undefined}
              onChange={(e) => setFrom(e.target.value)}
              className="mt-1 rounded-lg border border-line bg-paper px-3 py-1.5 text-sm text-ink outline-none transition focus:border-ink"
            />
          </label>
          <label className="text-xs text-ink-soft">
            <span className="block">To</span>
            <input
              type="date"
              value={to}
              min={from || undefined}
              onChange={(e) => setTo(e.target.value)}
              className="mt-1 rounded-lg border border-line bg-paper px-3 py-1.5 text-sm text-ink outline-none transition focus:border-ink"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.days}
                type="button"
                onClick={() => applyPreset(p.days)}
                className="rounded-full border border-line px-3 py-1.5 text-xs text-ink-soft transition hover:border-ink hover:text-ink"
              >
                {p.label}
              </button>
            ))}
            {ranged && (
              <button
                type="button"
                onClick={() => {
                  setFrom("");
                  setTo("");
                }}
                className="rounded-full border border-line px-3 py-1.5 text-xs text-ink-soft transition hover:border-ink hover:text-ink"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
