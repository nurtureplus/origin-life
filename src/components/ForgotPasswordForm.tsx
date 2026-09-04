"use client";

import Link from "next/link";
import { useState } from "react";
import { buttonClass } from "@/lib/button";

export function ForgotPasswordForm({
  scope,
  label,
  placeholder,
  backHref,
  backLabel,
}: {
  scope: "customer" | "admin";
  label: string;
  placeholder: string;
  backHref: string;
  backLabel: string;
}) {
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [devUrl, setDevUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    setDevUrl(null);

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, scope }),
    });
    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      setMessage(data.message || "If that account exists, we've sent a reset link.");
      if (data.devPreviewUrl) setDevUrl(data.devPreviewUrl);
    } else {
      setError(data.error || "Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-sm">
        <h1 className="text-display text-center text-3xl font-medium">Forgot password</h1>
        <p className="mt-2 text-center text-sm text-ink-soft">
          Enter your {label.toLowerCase()}{" "}
          and we&apos;ll send you a link to set a new password.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <label className="block text-sm">
            <span className="text-ink-soft">{label}</span>
            <input
              type="text"
              required
              autoComplete="username"
              placeholder={placeholder}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-line bg-paper-soft px-4 py-2.5 outline-none transition focus:border-ink"
            />
          </label>

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          {message && (
            <div className="rounded-xl border border-line bg-paper-soft px-4 py-3 text-sm text-ink-soft">
              <p>{message}</p>
              {devUrl && (
                <>
                  <a
                    href={devUrl}
                    className="mt-2 block break-all font-medium text-ink underline underline-offset-4"
                  >
                    {devUrl}
                  </a>
                  <p className="mt-2 text-xs text-ink-faint">
                    Shown because email delivery isn&apos;t configured yet. Set
                    RESEND_API_KEY to email this link instead.
                  </p>
                </>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={buttonClass({ full: true })}
          >
            {loading ? "Sending…" : "Send reset link"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-soft">
          <Link href={backHref} className="font-medium text-ink underline underline-offset-4">
            {backLabel}
          </Link>
        </p>
      </div>
    </div>
  );
}
