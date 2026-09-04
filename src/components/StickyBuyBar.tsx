"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice, type ProductDTO } from "@/lib/format";
import { buttonClass } from "@/lib/button";

/**
 * Mobile-only purchase bar for the product page.
 *
 * On a phone the buy panel scrolls out of view long before the ingredient,
 * dosage and review sections end, which leaves the highest-intent page on the
 * site with no call to action for most of its height. The bar appears once the
 * inline Add to Cart has left the viewport and hides again when it returns, so
 * the two are never on screen at the same time.
 *
 * `anchorId` is the element to watch — normally the wrapper around the inline
 * AddToCartButton.
 */
export function StickyBuyBar({
  product,
  anchorId,
}: {
  product: ProductDTO;
  anchorId: string;
}) {
  const addItem = useCartStore((s) => s.addItem);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const anchor = document.getElementById(anchorId);
    if (!anchor) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Only show the bar once the anchor has scrolled off the *top*. Without
        // the boundingClientRect check the bar also appears while the anchor is
        // still below the fold on first paint, covering the hero.
        setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0 }
    );

    observer.observe(anchor);
    return () => observer.disconnect();
  }, [anchorId]);

  const soldOut = product.stock <= 0;

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 backdrop-blur-md transition-transform duration-300 md:hidden ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
      // Off-screen it must not be tabbable — the buttons inside duplicate the
      // inline ones and would otherwise appear twice in the tab order.
      inert={!visible}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="container-page flex items-center gap-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{product.name}</p>
          <div className="flex items-baseline gap-2">
            <span className="font-medium">{formatPrice(product.priceCents)}</span>
            {product.compareAtCents && (
              <span className="text-xs text-ink-faint line-through">
                {formatPrice(product.compareAtCents)}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() =>
            addItem(
              {
                productId: product.id,
                slug: product.slug,
                name: product.name,
                priceCents: product.priceCents,
                image: product.image,
              },
              1
            )
          }
          disabled={soldOut}
          className={buttonClass({ size: "md", className: "ml-auto shrink-0" })}
        >
          {soldOut ? "Out of stock" : "Add to cart"}
        </button>
      </div>
    </div>
  );
}
