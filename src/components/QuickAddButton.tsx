"use client";

import { useEffect, useRef, useState } from "react";
import { useCartStore } from "@/lib/cart-store";
import type { ProductDTO } from "@/lib/format";

/**
 * Compact add-to-cart control for product grid cards.
 *
 * The card itself is a link to the PDP, so this swallows the click to avoid
 * navigating away when someone just wants the item in their basket.
 */
export function QuickAddButton({ product }: { product: ProductDTO }) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const soldOut = product.stock <= 0;

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (soldOut) return;

    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      priceCents: product.priceCents,
      image: product.image,
    });

    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={soldOut}
      aria-label={soldOut ? `${product.name} is out of stock` : `Add ${product.name} to cart`}
      className={`flex h-8 shrink-0 items-center gap-1 rounded-full border px-3 text-xs font-medium transition ${
        soldOut
          ? "cursor-not-allowed border-line text-ink-faint"
          : added
            ? "border-accent bg-accent text-accent-ink"
            : "border-line text-ink hover:border-ink"
      }`}
    >
      {soldOut ? (
        "Sold out"
      ) : added ? (
        <>
          <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 8.5 6.5 12 13 4.5" />
          </svg>
          Added
        </>
      ) : (
        <>
          <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M8 3.5v9M3.5 8h9" />
          </svg>
          Add
        </>
      )}
    </button>
  );
}
