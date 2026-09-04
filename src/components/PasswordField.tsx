"use client";

import { useId, useState } from "react";

function EyeIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {open ? (
        <>
          <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z" />
          <circle cx="12" cy="12" r="2.8" />
        </>
      ) : (
        <>
          <path d="M3 3l18 18" />
          <path d="M10.6 6.1A9.9 9.9 0 0 1 12 6c6.4 0 10 6 10 6a17.6 17.6 0 0 1-3.4 4.1" />
          <path d="M6.5 7.6A17.3 17.3 0 0 0 2 12s3.6 6 10 6a9.6 9.6 0 0 0 3.6-.7" />
          <path d="M9.9 10a2.8 2.8 0 0 0 3.9 3.9" />
        </>
      )}
    </svg>
  );
}

/**
 * Password input with a reveal toggle.
 *
 * The toggle is a real button so it's keyboard reachable, but it's kept out of
 * the tab order (tabIndex -1) so Tab still goes straight from the password
 * field to the submit button — the toggle is a convenience, not a step.
 */
export function PasswordField({
  label = "Password",
  value,
  onChange,
  autoComplete = "current-password",
  required = true,
  minLength,
  hint,
  className = "",
}: {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  hint?: string;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);
  const id = useId();

  return (
    <div className={`block text-sm ${className}`}>
      <label htmlFor={id} className="text-ink-soft">
        {label}
      </label>
      <div className="relative mt-1.5">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          className="w-full rounded-xl border border-line bg-paper-soft px-4 py-2.5 pr-11 outline-none transition focus:border-ink"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setVisible(!visible)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-ink-faint transition hover:text-ink"
        >
          <EyeIcon open={visible} />
        </button>
      </div>
      {hint && <span className="mt-1 block text-xs text-ink-faint">{hint}</span>}
    </div>
  );
}
