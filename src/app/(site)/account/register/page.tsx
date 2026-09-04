"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PasswordField } from "@/components/PasswordField";
import { refreshCustomer } from "@/lib/use-customer";
import { buttonClass } from "@/lib/button";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function field(key: keyof typeof form) {
    return {
      value: form[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm((f) => ({ ...f, [key]: e.target.value })),
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      // Registering signs you in, so the header needs the new session too.
      await refreshCustomer();
      router.push("/account");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Could not create account");
      setLoading(false);
    }
  }

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-sm">
        <h1 className="text-display text-center text-3xl font-medium">Create account</h1>
        <p className="mt-2 text-center text-sm text-ink-soft">
          Track orders, check out faster, and start earning Life Coins.
        </p>

        <div className="mt-6 rounded-2xl border border-line bg-paper-soft px-4 py-3 text-center text-xs text-ink-soft">
          Earn <strong className="text-ink">2% back</strong> in Life Coins on every order.
          <br />1 Life Coin = ₹1 off a future order.
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <label className="block text-sm">
            <span className="text-ink-soft">Full name</span>
            <input
              required
              {...field("name")}
              className="mt-1.5 w-full rounded-xl border border-line bg-paper-soft px-4 py-2.5 outline-none transition focus:border-ink"
            />
          </label>
          <label className="block text-sm">
            <span className="text-ink-soft">Mobile number</span>
            <input
              type="tel"
              required
              inputMode="numeric"
              autoComplete="tel"
              placeholder="10-digit mobile number"
              {...field("phone")}
              className="mt-1.5 w-full rounded-xl border border-line bg-paper-soft px-4 py-2.5 outline-none transition focus:border-ink"
            />
            <span className="mt-1 block text-xs text-ink-faint">
              You&apos;ll use this to sign in.
            </span>
          </label>
          <label className="block text-sm">
            <span className="text-ink-soft">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              {...field("email")}
              className="mt-1.5 w-full rounded-xl border border-line bg-paper-soft px-4 py-2.5 outline-none transition focus:border-ink"
            />
          </label>
          <PasswordField
            minLength={8}
            autoComplete="new-password"
            hint="At least 8 characters."
            {...field("password")}
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
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-soft">
          Already have an account?{" "}
          <Link href="/account/login" className="font-medium text-ink underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
