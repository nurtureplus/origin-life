"use client";

import { useEffect, useRef } from "react";
import type { Reel } from "@prisma/client";

function ReelCard({ reel }: { reel: Reel }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.6 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="group relative aspect-[9/16] w-56 shrink-0 snap-start overflow-hidden rounded-2xl bg-dark-soft sm:w-64">
      <video
        ref={videoRef}
        src={reel.videoUrl}
        poster={reel.thumbnail || undefined}
        muted
        loop
        playsInline
        preload="metadata"
        className="h-full w-full object-cover"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-dark/85 via-transparent to-transparent" />

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4">
        <p className="text-sm font-medium text-dark-text">{reel.title}</p>
        {reel.instagramUrl && (
          <a
            href={reel.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View on Instagram"
            className="shrink-0 rounded-full border border-dark-line bg-dark/60 p-2 text-dark-text backdrop-blur transition hover:bg-dark/90"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
              <path d="M12 2.2c3.2 0 3.6 0 4.85.07 1.25.06 2.1.25 2.84.54.77.3 1.42.7 2.07 1.35.65.65 1.05 1.3 1.35 2.07.29.74.48 1.59.54 2.84.07 1.25.07 1.65.07 4.85s0 3.6-.07 4.85c-.06 1.25-.25 2.1-.54 2.84a5.7 5.7 0 01-1.35 2.07 5.7 5.7 0 01-2.07 1.35c-.74.29-1.59.48-2.84.54-1.25.07-1.65.07-4.85.07s-3.6 0-4.85-.07c-1.25-.06-2.1-.25-2.84-.54a5.7 5.7 0 01-2.07-1.35 5.7 5.7 0 01-1.35-2.07c-.29-.74-.48-1.59-.54-2.84C2.2 15.6 2.2 15.2 2.2 12s0-3.6.07-4.85c.06-1.25.25-2.1.54-2.84a5.7 5.7 0 011.35-2.07A5.7 5.7 0 016.23 .89c.74-.29 1.59-.48 2.84-.54C10.32 .28 10.72.28 13.92.28M12 5.84A6.16 6.16 0 1012 18.16 6.16 6.16 0 0012 5.84m0 10.16a4 4 0 110-8 4 4 0 010 8m6.4-10.4a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0" />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
}

export function ReelsSlider({ reels }: { reels: Reel[] }) {
  if (reels.length === 0) return null;

  return (
    <section className="bg-dark py-24 text-dark-text">
      <div className="container-page">
        <p className="text-xs uppercase tracking-widest text-dark-text-soft">From the &apos;gram</p>
        <h2 className="text-display mt-3 max-w-2xl text-4xl font-medium md:text-5xl">
          Watch OriginLife in motion.
        </h2>
      </div>

      <div className="container-page mt-10 flex gap-4 overflow-x-auto pb-4 [scrollbar-width:none] snap-x snap-mandatory [&::-webkit-scrollbar]:hidden">
        {reels.map((reel) => (
          <ReelCard key={reel.id} reel={reel} />
        ))}
      </div>
    </section>
  );
}
