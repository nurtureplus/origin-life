"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Promo } from "@prisma/client";
import { FloatingIcons } from "@/components/FloatingIcons";
import { InteractiveDotGrid } from "@/components/InteractiveDotGrid";
import { buttonClass } from "@/lib/button";

const AUTOPLAY_MS = 6500;

export type HeroSlide = {
  id: string;
  badge: string | null;
  title: string; // "\n" renders as a line break
  subtitle: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  secondaryLabel: string | null;
  secondaryHref: string | null;
  /** Optional artwork used as a soft colour wash behind the slide. */
  image: string | null;
};

/** The always-present brand slide the carousel opens on. */
const BRAND_SLIDE: HeroSlide = {
  id: "brand",
  badge: "Nurturing Body, Mind & Soul",
  title: "Formulated\nto elevate.",
  subtitle:
    "Clinically dosed supplements for energy, sleep, focus, and recovery. No fillers, no proprietary blends — just what works, at doses that work.",
  ctaLabel: "Shop the lineup",
  ctaHref: "/products",
  secondaryLabel: "See the science",
  secondaryHref: "#science",
  image: null,
};

export function heroSlidesFromPromos(promos: Promo[]): HeroSlide[] {
  return [
    BRAND_SLIDE,
    ...promos.map((p) => ({
      id: p.id,
      badge: p.badge,
      title: p.title,
      subtitle: p.subtitle,
      ctaLabel: p.ctaLabel,
      ctaHref: p.ctaHref,
      secondaryLabel: null,
      secondaryHref: null,
      image: p.image,
    })),
  ];
}

export function HeroCarousel({ promos }: { promos: Promo[] }) {
  const slides = heroSlidesFromPromos(promos);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (slides.length <= 1 || paused) return;
    // Honour a reduced-motion preference by not auto-advancing.
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, AUTOPLAY_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // `index` is a dependency so the timer restarts whenever the slide changes.
    // Without it, jumping via a dot or arrow keeps the old countdown and the
    // hero can skip onward a moment after the user picked a slide.
  }, [slides.length, paused, index]);

  const go = (next: number) => setIndex((next + slides.length) % slides.length);
  const multiple = slides.length > 1;

  return (
    <section
      className="relative overflow-hidden bg-paper text-ink"
      aria-roledescription="carousel"
      aria-label="Featured"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      // Pause for keyboard focus only. A mouse click also focuses the arrows
      // and dots, and since that focus lingers it would otherwise stop
      // autoplay permanently after a single click.
      onFocusCapture={(e) => {
        if (e.target instanceof HTMLElement && e.target.matches(":focus-visible")) {
          setPaused(true);
        }
      }}
      onBlurCapture={() => setPaused(false)}
    >
      {/* Per-slide colour wash, cross-faded underneath the shared texture. */}
      {slides.map((slide, i) =>
        slide.image ? (
          <div
            key={`wash-${slide.id}`}
            aria-hidden="true"
            className={`pointer-events-none absolute inset-0 transition-opacity duration-1000 ease-out ${
              i === index ? "opacity-70" : "opacity-0"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide.image}
              alt=""
              className="h-full w-full object-cover [mask-image:radial-gradient(ellipse_75%_75%_at_50%_40%,black,transparent)]"
            />
          </div>
        ) : null
      )}

      {/* Dot texture and floating icons belong to the plain brand slide only —
          over a promo's colour wash they read as noise, so both fade out as
          the wash fades in. */}
      <InteractiveDotGrid
        className={`transition-opacity duration-1000 ease-out ${
          slides[index]?.image ? "opacity-0" : "opacity-100"
        }`}
      />
      <FloatingIcons
        className={`transition-opacity duration-1000 ease-out ${
          slides[index]?.image ? "opacity-0" : "opacity-100"
        }`}
      />

      {/* Slides are stacked in one grid cell so the section is as tall as the
          tallest slide and never jumps height mid-rotation. */}
      <div className="container-page relative grid min-h-[34rem] place-items-center py-24 md:min-h-[40rem] md:py-28">
        {slides.map((slide, i) => {
          const active = i === index;
          return (
            <div
              key={slide.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${slides.length}`}
              aria-hidden={!active}
              className={`col-start-1 row-start-1 flex w-full flex-col items-center text-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                active
                  ? "translate-y-0 opacity-100"
                  : "pointer-events-none translate-y-3 opacity-0"
              }`}
            >
              {slide.badge && (
                <span className="rounded-full border border-line bg-paper/80 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-ink-soft backdrop-blur-sm">
                  {slide.badge}
                </span>
              )}

              {/* Only the brand slide is the page's h1 — the rotating promo
                  slides are secondary, so they use h2. Four h1s would confuse
                  both screen readers and crawlers. */}
              {i === 0 ? (
                <h1 className="text-display mt-8 max-w-4xl text-5xl font-medium sm:text-6xl md:text-8xl">
                  {slide.title.split("\n").map((line, li) => (
                    <span key={li} className="block">
                      {line}
                    </span>
                  ))}
                </h1>
              ) : (
                <h2 className="text-display mt-8 max-w-4xl text-5xl font-medium sm:text-6xl md:text-8xl">
                  {slide.title.split("\n").map((line, li) => (
                    <span key={li} className="block">
                      {line}
                    </span>
                  ))}
                </h2>
              )}

              {slide.subtitle && (
                <p className="mt-8 max-w-lg text-lg text-ink-soft">{slide.subtitle}</p>
              )}

              {(slide.ctaLabel || slide.secondaryLabel) && (
                <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                  {slide.ctaLabel && slide.ctaHref && (
                    <Link
                      href={slide.ctaHref}
                      tabIndex={active ? undefined : -1}
                      className={buttonClass({ size: "lg" })}
                    >
                      {slide.ctaLabel}
                    </Link>
                  )}
                  {slide.secondaryLabel && slide.secondaryHref && (
                    <Link
                      href={slide.secondaryHref}
                      tabIndex={active ? undefined : -1}
                      className={buttonClass({ variant: "secondary", size: "lg" })}
                    >
                      {slide.secondaryLabel}
                    </Link>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {multiple && (
        <>
          <button
            onClick={() => go(index - 1)}
            aria-label="Previous slide"
            className="absolute left-4 top-1/2 hidden -translate-y-1/2 rounded-full border border-line bg-paper/80 p-2.5 text-ink shadow-sm backdrop-blur transition hover:border-ink lg:flex"
          >
            ←
          </button>
          <button
            onClick={() => go(index + 1)}
            aria-label="Next slide"
            className="absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-full border border-line bg-paper/80 p-2.5 text-ink shadow-sm backdrop-blur transition hover:border-ink lg:flex"
          >
            →
          </button>

          <div className="absolute inset-x-0 bottom-8 flex justify-center gap-2">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                onClick={() => go(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-7 bg-ink" : "w-1.5 bg-ink/25 hover:bg-ink/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
