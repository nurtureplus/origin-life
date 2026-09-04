import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CONCERNS } from "@/lib/concerns";
import { WellnessIcon } from "@/components/icons";
import { ProductCard } from "@/components/ProductCard";
import { toProductDTO } from "@/lib/format";

export const metadata: Metadata = {
  title: "Shop by Concern",
  description:
    "Find the right OriginLife formula for energy, sleep, focus, recovery, beauty, or your daily foundation.",
};

export default async function ShopByConcernPage() {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { createdAt: "asc" },
  });

  // Count and preview per concern from real data, so an empty category can't
  // silently advertise products that don't exist.
  const byCategory = new Map<string, typeof products>();
  for (const p of products) {
    const list = byCategory.get(p.category) ?? [];
    list.push(p);
    byCategory.set(p.category, list);
  }

  return (
    <div>
      <section className="container-page py-16 text-center">
        <p className="text-xs uppercase tracking-widest text-ink-faint">Shop by Concern</p>
        <h1 className="text-display mx-auto mt-4 max-w-3xl text-5xl font-medium md:text-6xl">
          What are you solving for?
        </h1>
        <p className="mx-auto mt-6 max-w-lg text-ink-soft">
          Six formulas, each built for one job. Start with the concern that matters most —
          they&apos;re designed to stack cleanly with each other.
        </p>
      </section>

      <section className="container-page pb-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CONCERNS.map((c) => {
            const count = byCategory.get(c.category)?.length ?? 0;
            return (
              <Link
                key={c.category}
                href={c.href}
                className="group flex flex-col gap-4 rounded-2xl border border-line bg-paper-soft p-6 transition hover:border-ink"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-chip-border bg-chip-bg text-ink-soft transition group-hover:text-ink">
                  <WellnessIcon name={c.icon} size={22} />
                </span>
                <div>
                  <div className="flex items-baseline justify-between gap-2">
                    <h2 className="font-heading text-lg font-medium tracking-tight">{c.label}</h2>
                    <span className="text-xs text-ink-faint">
                      {count} {count === 1 ? "formula" : "formulas"}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm text-ink-soft">{c.description}</p>
                </div>
                <span className="mt-auto text-sm font-medium text-ink underline underline-offset-4 opacity-0 transition group-hover:opacity-100">
                  Shop {c.label} →
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="container-page py-16">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs uppercase tracking-widest text-ink-faint">The full lineup</p>
            <h2 className="text-display mt-3 text-3xl font-medium md:text-4xl">
              Every formula, side by side
            </h2>
          </div>
          <Link href="/products" className="text-sm font-medium underline underline-offset-4">
            View all products →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={toProductDTO(p)} />
          ))}
        </div>
      </section>
    </div>
  );
}
