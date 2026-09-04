"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore, cartSubtotal } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";
import { useHasMounted } from "@/lib/use-has-mounted";
import { buttonClass } from "@/lib/button";
import {
  coinsToDiscountPaise,
  maxRedeemableCoins,
  orderQualifiesForRedemption,
  MIN_ORDER_TO_REDEEM_PAISE,
} from "@/lib/coins";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-checkout-js")) return resolve(true);
    const script = document.createElement("script");
    script.id = "razorpay-checkout-js";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const initialForm = {
  name: "",
  email: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clear } = useCartStore();
  const mounted = useHasMounted();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coinBalance, setCoinBalance] = useState(0);
  const [useCoins, setUseCoins] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.customer) {
          setForm((f) => ({
            ...f,
            name: f.name || data.customer.name,
            email: f.email || data.customer.email,
            phone: f.phone || data.customer.phone || "",
          }));
          setCoinBalance(data.customer.lifeCoins ?? 0);
        }
      })
      .catch(() => {});
  }, []);

  if (mounted && items.length === 0) {
    return (
      <div className="container-page flex flex-col items-center gap-4 py-32 text-center">
        <h1 className="text-2xl font-medium">Your cart is empty</h1>
        <Link href="/products" className="text-sm font-medium underline underline-offset-4">
          Browse products
        </Link>
      </div>
    );
  }

  const subtotal = cartSubtotal(items);
  const shipping = subtotal >= 99900 ? 0 : 6900;
  // Mirrors the server-side cap in /api/checkout — the server still re-derives
  // this from the real balance, so this is display only.
  const redeemableCoins = maxRedeemableCoins(coinBalance, subtotal);
  const coinsToRedeem = useCoins ? redeemableCoins : 0;
  const discount = coinsToDiscountPaise(coinsToRedeem);
  const total = subtotal + shipping - discount;

  function update(field: keyof typeof initialForm) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          customer: form,
          coinsToRedeem,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      if (data.demo) {
        clear();
        router.push(`/order/${data.orderId}?demo=1`);
        return;
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        setError("Could not load the payment gateway. Please try again.");
        setLoading(false);
        return;
      }

      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "OriginLife",
        description: "Order payment",
        order_id: data.razorpayOrderId,
        prefill: { name: form.name, email: form.email, contact: form.phone },
        theme: { color: "#3d5b2a" },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          const verifyRes = await fetch("/api/checkout/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId: data.orderId, ...response }),
          });
          if (verifyRes.ok) {
            clear();
            router.push(`/order/${data.orderId}`);
          } else {
            setError("Payment verification failed. Please contact support.");
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      });
      rzp.open();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="container-page py-16">
      <h1 className="text-display text-4xl font-medium md:text-5xl">Checkout</h1>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1.3fr_1fr]">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h2 className="text-sm font-medium uppercase tracking-widest text-ink-faint">
              Contact
            </h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <Field label="Full name" value={form.name} onChange={update("name")} required />
              <Field label="Phone" value={form.phone} onChange={update("phone")} required type="tel" />
              <Field
                label="Email"
                value={form.email}
                onChange={update("email")}
                required
                type="email"
                className="sm:col-span-2"
              />
            </div>
          </div>

          <div>
            <h2 className="text-sm font-medium uppercase tracking-widest text-ink-faint">
              Shipping address
            </h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <Field
                label="Address line 1"
                value={form.addressLine1}
                onChange={update("addressLine1")}
                required
                className="sm:col-span-2"
              />
              <Field
                label="Address line 2 (optional)"
                value={form.addressLine2}
                onChange={update("addressLine2")}
                className="sm:col-span-2"
              />
              <Field label="City" value={form.city} onChange={update("city")} required />
              <Field label="State" value={form.state} onChange={update("state")} required />
              <Field
                label="Postal code"
                value={form.postalCode}
                onChange={update("postalCode")}
                required
              />
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
            className={buttonClass({ size: "lg", full: true })}
          >
            {loading ? "Processing…" : `Pay ${formatPrice(total)}`}
          </button>
        </form>

        <div className="h-fit rounded-2xl border border-line p-6">
          <h2 className="text-sm font-medium uppercase tracking-widest text-ink-faint">
            Order summary
          </h2>
          <ul className="mt-4 space-y-3">
            {items.map((item) => (
              <li key={item.productId} className="flex items-center justify-between text-sm">
                <span>
                  {item.name} <span className="text-ink-faint">× {item.quantity}</span>
                </span>
                <span>{formatPrice(item.priceCents * item.quantity)}</span>
              </li>
            ))}
          </ul>
          {coinBalance > 0 && (
            <div className="mt-6 rounded-xl border border-line bg-paper-soft p-4">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={useCoins}
                  disabled={redeemableCoins === 0}
                  onChange={(e) => setUseCoins(e.target.checked)}
                  className="mt-0.5"
                />
                <span className="text-sm">
                  <span className="font-medium">Use Life Coins</span>
                  <span className="mt-0.5 block text-xs text-ink-soft">
                    You have <strong className="text-ink">{coinBalance}</strong> coins (1 coin
                    = ₹1).{" "}
                    {redeemableCoins > 0 ? (
                      <>
                        Apply {redeemableCoins} for{" "}
                        {formatPrice(coinsToDiscountPaise(redeemableCoins))} off — up to 2% of
                        this order.
                      </>
                    ) : !orderQualifiesForRedemption(subtotal) ? (
                      <>
                        Orders of {formatPrice(MIN_ORDER_TO_REDEEM_PAISE)} or more can redeem
                        coins.
                      </>
                    ) : (
                      <>This order is too small to redeem any coins yet.</>
                    )}
                  </span>
                </span>
              </label>
            </div>
          )}

          <div className="mt-6 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between text-ink-soft">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-ink-soft">
              <span>Shipping</span>
              <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-accent">
                <span>Life Coins ({coinsToRedeem})</span>
                <span>−{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  type = "text",
  className = "",
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  type?: string;
  className?: string;
}) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="text-ink-soft">{label}</span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="mt-1.5 w-full rounded-xl border border-line bg-paper-soft px-4 py-2.5 outline-none transition focus:border-ink"
      />
    </label>
  );
}
