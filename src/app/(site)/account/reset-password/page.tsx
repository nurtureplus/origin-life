"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PasswordField } from "@/components/PasswordField";
import { buttonClass } from "@/lib/button";

function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  // With no token in the URL there is nothing to verify, so skip the check
  // rather than flipping this off inside the effect.
  const [checking, setChecking] = useState(Boolean(token));
  const [valid, setValid] = useState(false);
  const [scope, setScope] = useState<"customer" | "admin" | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // Check the link before showing the form, so an expired link says so
  // immediately rather than after the user types a new password.
  useEffect(() => {
    if (!token) return;
    fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => {
        setValid(Boolean(d.valid));
        setScope(d.scope ?? null);
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      setScope(data.scope ?? scope);
      setDone(true);
    } else {
      setError(data.error || "Could not reset password.");
      setLoading(false);
    }
  }

  const loginHref = scope === "admin" ? "/admin/login" : "/account/login";

  if (checking) {
    return <Shell><p className="text-center text-sm text-ink-soft">Checking your link…</p></Shell>;
  }

  if (done) {
    return (
      <Shell>
        <h1 className="text-display text-center text-3xl font-medium">Password updated</h1>
        <p className="mt-3 text-center text-sm text-ink-soft">
          You can now sign in with your new password.
        </p>
        <Link
          href={loginHref}
          className={buttonClass({ full: true, className: "mt-8" })}
        >
          Go to sign in
        </Link>
      </Shell>
    );
  }

  if (!valid) {
    return (
      <Shell>
        <h1 className="text-display text-center text-3xl font-medium">Link expired</h1>
        <p className="mt-3 text-center text-sm text-ink-soft">
          This reset link is invalid or has already been used. Request a new one — links are
          valid for one hour.
        </p>
        <Link
          href="/account/forgot-password"
          className={buttonClass({ full: true, className: "mt-8" })}
        >
          Request a new link
        </Link>
      </Shell>
    );
  }

  return (
    <Shell>
      <h1 className="text-display text-center text-3xl font-medium">Set a new password</h1>
      <p className="mt-2 text-center text-sm text-ink-soft">
        Choose something you haven&apos;t used before.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <PasswordField
          label="New password"
          autoComplete="new-password"
          minLength={8}
          hint="At least 8 characters."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <PasswordField
          label="Confirm new password"
          autoComplete="new-password"
          minLength={8}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className={buttonClass({ full: true })}
        >
          {loading ? "Updating…" : "Update password"}
        </button>
      </form>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetForm />
    </Suspense>
  );
}
