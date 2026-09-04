import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { toProductDTO } from "@/lib/format";
import { ProductCard } from "@/components/ProductCard";
import { HeroCarousel } from "@/components/HeroCarousel";
import { ReelsSlider } from "@/components/ReelsSlider";
import { buttonClass } from "@/lib/button";
import { getRatingsFor } from "@/lib/review-queries";

export default async function Home() {
  const [featured, promos, reels] = await Promise.all([
    prisma.product.findMany({
      where: { active: true, featured: true },
      orderBy: { createdAt: "asc" },
      take: 4,
    }),
    prisma.promo.findMany({ where: { active: true }, orderBy: { order: "asc" } }),
    prisma.reel.findMany({ where: { active: true }, orderBy: { order: "asc" } }),
  ]);

  const ratings = await getRatingsFor(featured.map((p) => p.id));

  const stats = [
    { value: "6", label: "Active formulas" },
    { value: "500mg+", label: "Clinical-dose ingredients" },
    { value: "0", label: "Proprietary blends" },
    { value: "3rd", label: "Party lab tested" },
  ];

  return (
    <>
      {/* Hero — auto-rotating banner: brand statement, then live promos */}
      <HeroCarousel promos={promos} />

      {/* Stats strip */}
      <section className="hairline border-b border-line bg-paper">
        <div className="container-page grid grid-cols-2 gap-8 py-12 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center md:text-left">
              <p className="text-3xl font-semibold tracking-tight md:text-4xl">{s.value}</p>
              <p className="mt-1 text-sm text-ink-faint">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="container-page py-24">
        <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-xs uppercase tracking-widest text-ink-faint">The lineup</p>
            <h2 className="text-display mt-3 text-4xl font-medium md:text-5xl">
              Six formulas.
              <br />
              One standard.
            </h2>
          </div>
          <Link href="/products" className="text-sm font-medium underline underline-offset-4">
            View all products →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={toProductDTO(p)} rating={ratings.get(p.id)} />
          ))}
        </div>
      </section>

      {/* Science section */}
      <section id="science" className="bg-paper-soft py-24 text-ink">
        <div className="container-page">
          <p className="text-xs uppercase tracking-widest text-ink-faint">Why OriginLife</p>
          <h2 className="text-display mt-3 max-w-2xl text-4xl font-medium md:text-5xl">
            Full doses. Full transparency. Nothing hidden behind a blend.
          </h2>

          <div className="mt-16 grid gap-10 border-t border-line pt-12 md:grid-cols-3">
            <div>
              <p className="text-5xl font-medium text-ink-muted">01</p>
              <h3 className="font-heading mt-4 text-lg font-medium tracking-tight">
                Clinical doses only
              </h3>
              <p className="mt-2 text-sm text-ink-soft">
                Every active ingredient is dosed at the level used in the research
                that backs it — never a token amount.
              </p>
            </div>
            <div>
              <p className="text-5xl font-medium text-ink-muted">02</p>
              <h3 className="font-heading mt-4 text-lg font-medium tracking-tight">
                Nothing proprietary
              </h3>
              <p className="mt-2 text-sm text-ink-soft">
                Every gram of every ingredient is listed on the label. If we can&apos;t
                show you the dose, it doesn&apos;t go in the formula.
              </p>
            </div>
            <div>
              <p className="text-5xl font-medium text-ink-muted">03</p>
              <h3 className="font-heading mt-4 text-lg font-medium tracking-tight">
                Third-party verified
              </h3>
              <p className="mt-2 text-sm text-ink-soft">
                Every batch is tested by an independent lab for purity and potency
                before it ships.
              </p>
            </div>
          </div>
        </div>
      </section>

      <ReelsSlider reels={reels} />

      {/* CTA */}
      <section className="relative overflow-hidden bg-paper py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="animate-glow-a absolute -top-24 left-1/4 h-80 w-80 rounded-full bg-brand-teal/50 blur-[110px]" />
          <div className="animate-glow-b absolute -bottom-24 left-0 h-80 w-80 rounded-full bg-brand-orange/45 blur-[110px]" />
          <div className="animate-glow-c absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-accent/45 blur-[110px]" />
        </div>

        <div className="container-page relative flex flex-col items-center gap-6 text-center">
          <h2 className="text-display text-4xl font-medium md:text-5xl">Ready to feel it?</h2>
          <p className="max-w-md text-ink-soft">
            Start with Core, our daily foundation — then build your stack around
            what your body needs.
          </p>
          <Link
            href="/products"
            className={buttonClass({ size: "lg" })}
          >
            Shop the lineup
          </Link>
        </div>
      </section>
    </>
  );
}
