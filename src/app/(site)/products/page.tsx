import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { toProductDTO } from "@/lib/format";
import { ProductCard } from "@/components/ProductCard";
import { getRatingsFor } from "@/lib/review-queries";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd } from "@/lib/structured-data";
import Link from "next/link";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; bestseller?: string }>;
}): Promise<Metadata> {
  const { category, bestseller } = await searchParams;

  if (bestseller === "1") {
    return {
      title: "Best sellers",
      description: "The OriginLife formulas customers reorder most.",
      alternates: { canonical: "/products?bestseller=1" },
    };
  }

  if (category && CATEGORIES.includes(category)) {
    return {
      title: `${category} supplements`,
      description: `Clinically dosed ${category.toLowerCase()} formulas from OriginLife — full doses, no proprietary blends.`,
      alternates: { canonical: `/products?category=${category}` },
    };
  }

  return {
    title: "Shop all supplements",
    description:
      "Every OriginLife formula in one place — energy, sleep, focus, recovery, beauty and daily foundations.",
    // Unrecognised filter values collapse onto the plain listing so junk query
    // strings can't mint duplicate indexable URLs.
    alternates: { canonical: "/products" },
  };
}

const CATEGORIES = ["All", "Energy", "Sleep", "Focus", "Recovery", "Beauty", "Foundations"];

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; bestseller?: string }>;
}) {
  const { category, bestseller } = await searchParams;
  const bestsellerOnly = bestseller === "1";
  const active = !bestsellerOnly && category && CATEGORIES.includes(category) ? category : "All";

  const products = await prisma.product.findMany({
    where: {
      active: true,
      ...(bestsellerOnly ? { badge: "Bestseller" } : active !== "All" ? { category: active } : {}),
    },
    orderBy: { createdAt: "asc" },
  });

  const ratings = await getRatingsFor(products.map((p) => p.id));

  return (
    <div className="container-page py-16">
      <JsonLd
        data={breadcrumbJsonLd(
          active === "All"
            ? [
                { name: "Home", path: "/" },
                { name: "Shop", path: "/products" },
              ]
            : [
                { name: "Home", path: "/" },
                { name: "Shop", path: "/products" },
                { name: active, path: `/products?category=${active}` },
              ]
        )}
      />

      <div className="mb-10">
        <p className="text-xs uppercase tracking-widest text-ink-faint">
          {bestsellerOnly ? "Best sellers" : "Shop"}
        </p>
        <h1 className="text-display mt-3 text-5xl font-medium md:text-6xl">
          {bestsellerOnly ? "Customer favorites" : "The full lineup"}
        </h1>
      </div>

      <div className="mb-10 flex flex-wrap gap-2">
        <Link
          href="/products?bestseller=1"
          className={`rounded-full border px-4 py-2 text-sm transition ${
            bestsellerOnly
              ? "border-ink bg-ink text-paper"
              : "border-line text-ink-soft hover:border-ink hover:text-ink"
          }`}
        >
          Best Sellers
        </Link>
        {CATEGORIES.map((c) => (
          <Link
            key={c}
            href={c === "All" ? "/products" : `/products?category=${c}`}
            className={`rounded-full border px-4 py-2 text-sm transition ${
              !bestsellerOnly && active === c
                ? "border-ink bg-ink text-paper"
                : "border-line text-ink-soft hover:border-ink hover:text-ink"
            }`}
          >
            {c}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <p className="py-20 text-center text-ink-soft">
          {bestsellerOnly ? "No best sellers yet — check back soon." : "No products in this category yet."}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={toProductDTO(p)} rating={ratings.get(p.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
