"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { useCartStore, cartSubtotal } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";
import { useHasMounted } from "@/lib/use-has-mounted";
import { buttonClass } from "@/lib/button";

export function CartDrawer() {
  const { items, isOpen, close, removeItem, setQuantity } = useCartStore();
  const mounted = useHasMounted();
  const panelRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // `inert` keeps the closed drawer out of the tab order, but an open one is a
    // modal: focus has to move into it, stay inside it while it's open, and go
    // back to whatever opened it on close. Without this, opening the cart leaves
    // focus on the header button behind the overlay and Tab walks the page
    // underneath.
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        return;
      }
      if (e.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;
      const focusable = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      restoreFocusRef.current?.focus();
    };
  }, [isOpen, close]);

  if (!mounted) return null;
  const subtotal = cartSubtotal(items);

  return (
    <div
      className={`fixed inset-0 z-50 transition ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={!isOpen}
      // The panel stays mounted so it can slide, which left its links and
      // buttons in the tab order while off-screen — keyboard users would tab
      // into an invisible drawer. `inert` takes the whole subtree out of the
      // tab order and the accessibility tree while it's closed.
      inert={!isOpen}
    >
      <div
        onClick={close}
        className={`absolute inset-0 bg-dark/40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-paper shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 id="cart-drawer-title" className="font-heading text-lg font-medium tracking-tight">
            Your cart
          </h2>
          <button
            ref={closeButtonRef}
            onClick={close}
            aria-label="Close cart"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink-soft transition hover:border-ink hover:text-ink"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <p className="text-ink-soft">Your cart is empty.</p>
              <Link
                href="/products"
                onClick={close}
                className="text-sm font-medium underline underline-offset-4"
              >
                Browse products
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {items.map((item) => (
                <li key={item.productId} className="flex gap-4 py-5">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-line bg-dark">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-ink-faint">{formatPrice(item.priceCents)}</p>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId)}
                        aria-label={`Remove ${item.name}`}
                        className="text-sm text-ink-faint transition hover:text-ink"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center rounded-full border border-line">
                        {/* 44px, matching AddToCartButton — these were 28px,
                            under the touch-target floor and the hardest control
                            in the app to hit on a phone. */}
                        <button
                          onClick={() => setQuantity(item.productId, item.quantity - 1)}
                          className="flex h-11 w-11 items-center justify-center text-ink-soft transition hover:text-ink"
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          −
                        </button>
                        <span className="w-6 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => setQuantity(item.productId, item.quantity + 1)}
                          className="flex h-11 w-11 items-center justify-center text-ink-soft transition hover:text-ink"
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-line px-6 py-6">
            <div className="mb-4 flex items-center justify-between text-sm">
              <span className="text-ink-soft">Subtotal</span>
              <span className="text-base font-semibold">{formatPrice(subtotal)}</span>
            </div>
            <Link
              href="/checkout"
              onClick={close}
              className={buttonClass({ size: "lg", full: true })}
            >
              Checkout
            </Link>
            <p className="mt-3 text-center text-xs text-ink-faint">
              Shipping and taxes calculated at checkout.
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
