import Link from "next/link";
import Image from "next/image";
import { formatPrice, type ProductDTO } from "@/lib/format";
import { QuickAddButton } from "@/components/QuickAddButton";
import { StarRating } from "@/components/StarRating";
import type { ReviewSummary } from "@/lib/reviews";

export function ProductCard({
  product,
  rating,
}: {
  product: ProductDTO;
  /** Omitted, or a summary with no reviews, hides the rating row entirely. */
  rating?: ReviewSummary;
}) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-paper-soft transition hover:border-ink"
    >
      <div className="relative aspect-square overflow-hidden bg-dark">
        {/* Cards run four-up on desktop, two-up on tablet, full-bleed on phones —
            without `sizes` the browser assumes 100vw and pulls the largest
            variant for a 300px slot. Seeded products still use .svg art, which
            next/image passes through unoptimised automatically. */}
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition duration-500 group-hover:scale-[1.04]"
        />
        {product.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-ink">
            {product.badge}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-5">
        <p className="text-xs uppercase tracking-widest text-ink-faint">{product.category}</p>
        <h3 className="font-heading text-lg font-medium tracking-tight">{product.name}</h3>
        {rating && rating.count > 0 && (
          <StarRating rating={rating.average} count={rating.count} size="text-xs" className="mt-1" />
        )}
        <p className="text-sm text-ink-soft">{product.tagline}</p>
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <span className="font-medium">{formatPrice(product.priceCents)}</span>
            {product.compareAtCents && (
              <span className="text-sm text-ink-faint line-through">
                {formatPrice(product.compareAtCents)}
              </span>
            )}
          </div>
          <QuickAddButton product={product} />
        </div>
      </div>
    </Link>
  );
}
