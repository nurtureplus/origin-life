import type { Metadata } from "next";
import Link from "next/link";
import { WellnessIcon } from "@/components/icons";
import { buttonClass } from "@/lib/button";

export const metadata: Metadata = {
  title: "About Us",
  description: "Why OriginLife exists, and how we formulate.",
};

const values = [
  {
    icon: "molecule",
    title: "Science first",
    copy: "Every formula starts with the research, not the marketing. If a dose isn't backed by a clinical study, it doesn't make the cut.",
  },
  {
    icon: "leaf",
    title: "Nothing hidden",
    copy: "No proprietary blends, no fractional doses hiding behind a label. Every ingredient and every milligram is listed in full.",
  },
  {
    icon: "sparkle",
    title: "Third-party verified",
    copy: "Every batch is tested by an independent lab for purity and potency before it's cleared to ship.",
  },
] as const;

const stats = [
  { value: "6", label: "Precision formulas" },
  { value: "2026", label: "Founded" },
  { value: "500mg+", label: "Clinical-dose ingredients" },
  { value: "0", label: "Proprietary blends, ever" },
];

export default function AboutPage() {
  return (
    <div>
      <section className="container-page py-20 text-center">
        <p className="text-xs uppercase tracking-widest text-ink-faint">About us</p>
        <h1 className="text-display mx-auto mt-4 max-w-2xl text-5xl font-medium md:text-6xl">
          We started OriginLife because most labels don&apos;t tell you the truth.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-ink-soft">
          Scan the back of most supplement bottles and you&apos;ll find a &ldquo;proprietary
          blend&rdquo; — a list of ingredients with no doses attached. We built OriginLife
          on the opposite idea: formulate at the doses the research actually calls for,
          publish every milligram, and let the label do the talking.
        </p>
      </section>

      <section className="container-page grid gap-12 pb-24 md:grid-cols-2 md:items-center">
        <div className="aspect-[4/3] overflow-hidden rounded-3xl border border-line bg-paper-soft">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/icon-color.png" alt="" className="h-full w-full object-contain p-16" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-ink-faint">Our story</p>
          <h2 className="text-display mt-3 text-3xl font-medium md:text-4xl">
            Nurturing body, mind &amp; soul.
          </h2>
          <p className="mt-4 text-ink-soft">
            OriginLife started with a simple frustration: nutraceutical labels that
            hid more than they revealed. So we set out to build a line of formulas
            where every ingredient, every dose, and every source is fully visible —
            six precise formulas for energy, sleep, focus, recovery, beauty, and daily
            foundations, each built to stack cleanly with the others.
          </p>
          <p className="mt-4 text-ink-soft">
            We&apos;re not chasing trends or filling a shelf. We formulate for the
            handful of things that genuinely move the needle, at doses that actually
            do something, verified by people who don&apos;t work for us.
          </p>
          <Link
            href="/blog"
            className="mt-6 inline-block text-sm font-medium text-ink underline underline-offset-4"
          >
            Read our latest insights →
          </Link>
        </div>
      </section>

      <section className="bg-dark py-24 text-dark-text">
        <div className="container-page">
          <p className="text-xs uppercase tracking-widest text-dark-text-soft">What we stand for</p>
          <h2 className="text-display mt-3 max-w-2xl text-4xl font-medium md:text-5xl">
            Three rules we don&apos;t break.
          </h2>

          <div className="mt-16 grid gap-10 border-t border-dark-line pt-12 md:grid-cols-3">
            {values.map((v) => (
              <div key={v.title}>
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-dark-line bg-white/5 text-dark-text">
                  <WellnessIcon name={v.icon} size={22} />
                </span>
                <h3 className="font-heading mt-4 text-lg font-medium tracking-tight">{v.title}</h3>
                <p className="mt-2 text-sm text-dark-text-soft">{v.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-paper">
        <div className="container-page grid grid-cols-2 gap-8 py-16 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center md:text-left">
              <p className="text-3xl font-semibold tracking-tight md:text-4xl">{s.value}</p>
              <p className="mt-1 text-sm text-ink-faint">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20">
        <div className="container-page flex flex-col items-center gap-6 text-center">
          <h2 className="text-display max-w-md text-3xl font-medium md:text-4xl">
            Come feel the difference doses make.
          </h2>
          <Link
            href="/products"
            className={buttonClass({ size: "lg" })}
          >
            Shop the lineup
          </Link>
        </div>
      </section>
    </div>
  );
}
