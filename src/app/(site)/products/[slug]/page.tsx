import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatPrice, toProductDTO } from "@/lib/format";
import { AddToCartButton } from "@/components/AddToCartButton";
import { ProductCard } from "@/components/ProductCard";
import { StickyBuyBar } from "@/components/StickyBuyBar";
import { StarRating } from "@/components/StarRating";
import { ProductReviews, getReviewSummary } from "@/components/ProductReviews";
import { ProductLabelPanel } from "@/components/ProductLabelPanel";
import { getRatingsFor } from "@/lib/review-queries";
import { JsonLd } from "@/components/JsonLd";
import { productJsonLd, breadcrumbJsonLd } from "@/lib/structured-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product || !product.active) return { title: "Product" };

  return {
    title: `${product.name} — ${product.tagline}`,
    description: product.description.slice(0, 160),
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      type: "website",
      title: product.name,
      description: product.tagline,
      url: `/products/${product.slug}`,
      images: [{ url: product.image }],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product || !product.active) notFound();

  const dto = toProductDTO(product);

  const [related, summary] = await Promise.all([
    prisma.product.findMany({
      where: { active: true, category: product.category, id: { not: product.id } },
      take: 3,
    }),
    getReviewSummary(product.id),
  ]);

  const relatedRatings = await getRatingsFor(related.map((p) => p.id));

  return (
    // Bottom padding on mobile keeps the last section clear of the sticky buy bar.
    <div className="container-page py-16 pb-28 md:pb-16">
      <JsonLd data={productJsonLd({ ...product, summary })} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Shop", path: "/products" },
          { name: product.category, path: `/products?category=${product.category}` },
          { name: product.name, path: `/products/${product.slug}` },
        ])}
      />

      <Link href="/products" className="text-sm text-ink-soft transition hover:text-ink">
        ← All products
      </Link>

      <div className="mt-8 grid gap-12 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-3xl border border-line bg-dark">
          {/* This is the LCP element on the page. `preload` replaces the
              `priority` prop, which Next 16 deprecated. */}
          <Image
            src={dto.image}
            alt={dto.name}
            fill
            preload
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>

        <div className="flex flex-col">
          <p className="text-xs uppercase tracking-widest text-ink-faint">{dto.category}</p>
          <h1 className="text-display mt-3 text-5xl font-medium">{dto.name}</h1>

          {/* Social proof sits above the price, before the buy decision — it is
              the first thing a shopper looks for after the name. */}
          {summary.count > 0 && (
            <a
              href="#reviews"
              aria-label={`Read ${summary.count} customer review${summary.count === 1 ? "" : "s"}`}
              className="mt-3 inline-flex w-fit items-center hover:underline"
            >
              <StarRating rating={summary.average} count={summary.count} />
            </a>
          )}

          <p className="mt-3 text-lg text-ink-soft">{dto.tagline}</p>

          <div className="mt-6 flex items-center gap-3">
            <span className="text-2xl font-medium">{formatPrice(dto.priceCents)}</span>
            {dto.compareAtCents && (
              <span className="text-lg text-ink-faint line-through">
                {formatPrice(dto.compareAtCents)}
              </span>
            )}
          </div>

          <p className="mt-6 leading-relaxed text-ink-soft">{dto.description}</p>

          <div className="mt-8" id="buy-panel">
            <AddToCartButton product={dto} />
            <p className="mt-3 text-xs text-ink-faint">
              {dto.stock > 0 ? `${dto.stock} in stock` : "Currently out of stock"} · Free shipping
              over ₹999
            </p>
          </div>

          <div className="mt-10 grid gap-8 border-t border-line pt-8 sm:grid-cols-2">
            <div>
              <h2 className="text-sm font-medium uppercase tracking-widest text-ink-faint">
                Benefits
              </h2>
              <ul className="mt-3 space-y-2 text-sm">
                {dto.benefits.map((b) => (
                  <li key={b} className="flex gap-2">
                    <span className="text-accent">✓</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-sm font-medium uppercase tracking-widest text-ink-faint">
                Key ingredients
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-ink-soft">
                {dto.ingredients.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <ProductLabelPanel product={product} />

      <ProductReviews productId={product.id} />

      {related.length > 0 && (
        <div className="mt-24">
          <h2 className="text-display mb-8 text-3xl font-medium">You might also like</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <ProductCard
                key={p.id}
                product={toProductDTO(p)}
                rating={relatedRatings.get(p.id)}
              />
            ))}
          </div>
        </div>
      )}

      <StickyBuyBar product={dto} anchorId="buy-panel" />
    </div>
  );
}
