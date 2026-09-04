const STAR_PATH =
  "M12 2.6l2.9 5.9 6.5.95-4.7 4.6 1.1 6.45L12 17.45 6.2 20.5l1.1-6.45-4.7-4.6 6.5-.95L12 2.6Z";

function StarRow({ className }: { className: string }) {
  return (
    <div className={className} aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} viewBox="0 0 24 24" className="h-[1em] w-[1em] shrink-0 fill-current">
          <path d={STAR_PATH} />
        </svg>
      ))}
    </div>
  );
}

/**
 * Read-only star display.
 *
 * A fractional average (4.3 of 5) is drawn by overlaying a filled row on a
 * faint one and clipping the fill to a percentage width, rather than rounding
 * to the nearest half star — the clip is exact and needs no half-star asset.
 * The stars themselves are decorative; the rating is announced once as text.
 */
export function StarRating({
  rating,
  count,
  size = "text-sm",
  showValue = true,
  className = "",
}: {
  rating: number;
  count?: number;
  /** A Tailwind text size — the stars are sized in `em` so they follow it. */
  size?: string;
  showValue?: boolean;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, (rating / 5) * 100));

  return (
    <div className={`flex items-center gap-2 ${size} ${className}`}>
      <div className="relative inline-block leading-none">
        <StarRow className="flex gap-0.5 text-line-strong" />
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${pct}%` }}
        >
          <StarRow className="flex gap-0.5 text-brand-orange" />
        </div>
      </div>
      {showValue && (
        <span className="text-ink-soft">
          {rating > 0 ? rating.toFixed(1) : "No reviews"}
          {count !== undefined && count > 0 && ` (${count})`}
        </span>
      )}
      <span className="sr-only">
        {count === 0 || rating === 0
          ? "Not yet rated"
          : `Rated ${rating.toFixed(1)} out of 5${
              count === undefined ? "" : ` from ${count} review${count === 1 ? "" : "s"}`
            }`}
      </span>
    </div>
  );
}
