"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/cart-store";
import type { ProductDTO } from "@/lib/format";
import { buttonClass } from "@/lib/button";

export function AddToCartButton({ product }: { product: ProductDTO }) {
  const addItem = useCartStore((s) => s.addItem);
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center rounded-full border border-line">
        <button
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="flex h-11 w-11 items-center justify-center text-ink-soft transition hover:text-ink"
          aria-label="Decrease quantity"
        >
          −
        </button>
        <span className="w-8 text-center text-sm">{quantity}</span>
        <button
          onClick={() => setQuantity((q) => q + 1)}
          className="flex h-11 w-11 items-center justify-center text-ink-soft transition hover:text-ink"
          aria-label="Increase quantity"
        >
          +
        </button>
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
            quantity
          )
        }
        disabled={product.stock <= 0}
        className={buttonClass({ size: "lg", className: "flex-1" })}
      >
        {product.stock > 0 ? "Add to cart" : "Out of stock"}
      </button>
    </div>
  );
}
