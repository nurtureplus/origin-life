"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PasswordField } from "@/components/PasswordField";
import { safeNextPath } from "@/lib/safe-redirect";
import { refreshCustomer } from "@/lib/use-customer";
import { buttonClass } from "@/lib/button";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });

    if (res.ok) {
      // The header lives in the root layout and won't remount on this
      // navigation, so tell it about the new session directly.
      await refreshCustomer();
      router.push(safeNextPath(searchParams.get("next"), "/account"));
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Invalid mobile number/email or password");
      setLoading(false);
    }
  }

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-sm">
        <h1 className="text-display text-center text-3xl font-medium">Sign in</h1>
        <p className="mt-2 text-center text-sm text-ink-soft">
          Welcome back to OriginLife.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <label className="block text-sm">
            <span className="text-ink-soft">Mobile number or email</span>
            <input
              type="text"
              required
              autoComplete="username"
              placeholder="10-digit mobile number"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-line bg-paper-soft px-4 py-2.5 outline-none transition focus:border-ink"
            />
          </label>
          <div>
            <PasswordField value={password} onChange={(e) => setPassword(e.target.value)} />
            <div className="mt-2 text-right">
              <Link
                href="/account/forgot-password"
                className="text-xs text-ink-soft underline underline-offset-4 hover:text-ink"
              >
                Forgot password?
              </Link>
            </div>
          </div>

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
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-soft">
          New here?{" "}
          <Link href="/account/register" className="font-medium text-ink underline underline-offset-4">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function AccountLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
