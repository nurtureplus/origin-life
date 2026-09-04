"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { PasswordField } from "@/components/PasswordField";
import { FloatingIcons } from "@/components/FloatingIcons";
import { InteractiveDotGrid } from "@/components/InteractiveDotGrid";
import { safeNextPath } from "@/lib/safe-redirect";
import { buttonClass } from "@/lib/button";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      router.push(safeNextPath(searchParams.get("next"), "/admin", "/admin"));
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Invalid email or password");
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-paper px-6 text-ink">
      <InteractiveDotGrid />
      <FloatingIcons />

      <div className="relative w-full max-w-sm">
        <div className="flex justify-center">
          <Logo variant="light" size="lg" href={null} showTagline={false} />
        </div>
        <h1 className="text-display mt-4 text-center text-3xl font-medium">Admin sign in</h1>
        <p className="mt-2 text-center text-sm text-ink-soft">
          Sign in to manage products, orders and content.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <label className="block text-sm">
            <span className="text-ink-soft">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-line bg-paper-soft px-4 py-2.5 outline-none transition focus:border-ink"
            />
          </label>
          <div>
            <PasswordField value={password} onChange={(e) => setPassword(e.target.value)} />
            <div className="mt-2 text-right">
              <Link
                href="/admin/forgot-password"
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

        <p className="mt-6 text-center text-xs text-ink-faint">
          Default: admin@originlife.co / ChangeMe123! (set in .env)
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
