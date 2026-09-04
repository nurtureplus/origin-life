import { prisma } from "@/lib/prisma";
import { summarize } from "@/lib/reviews";
import { StarRating } from "@/components/StarRating";
import { ReviewForm } from "@/components/ReviewForm";

const DATE_FORMAT = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export async function getReviewSummary(productId: string) {
  const grouped = await prisma.review.groupBy({
    by: ["rating"],
    where: { productId, status: "approved" },
    _count: { rating: true },
  });
  return summarize(grouped);
}

export async function ProductReviews({ productId }: { productId: string }) {
  const [reviews, summary] = await Promise.all([
    prisma.review.findMany({
      where: { productId, status: "approved" },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    getReviewSummary(productId),
  ]);

  return (
    // scroll-mt clears the sticky header — without it the "4.0 (12)" link in
    // the buy panel jumps here and lands with the heading hidden behind the nav.
    <section id="reviews" className="mt-24 scroll-mt-24 border-t border-line pt-12">
      <h2 className="text-display text-3xl font-medium">Reviews</h2>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,20rem)_1fr]">
        <div>
          {summary.count === 0 ? (
            <p className="text-sm text-ink-soft">
              No reviews yet. If you&apos;ve tried it, yours would be the first.
            </p>
          ) : (
            <>
              <p className="text-display text-5xl font-medium">{summary.average.toFixed(1)}</p>
              <StarRating
                rating={summary.average}
                showValue={false}
                size="text-lg"
                className="mt-2"
              />
              <p className="mt-2 text-sm text-ink-faint">
                Based on {summary.count} review{summary.count === 1 ? "" : "s"}
              </p>

              <ul className="mt-6 space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const n = summary.distribution[star - 1];
                  const pct = summary.count === 0 ? 0 : Math.round((n / summary.count) * 100);
                  return (
                    <li key={star} className="flex items-center gap-3 text-sm">
                      <span className="w-12 shrink-0 text-ink-soft">{star} star</span>
                      <span className="h-2 flex-1 overflow-hidden rounded-full bg-paper-softer">
                        <span
                          className="block h-full rounded-full bg-brand-orange"
                          style={{ width: `${pct}%` }}
                        />
                      </span>
                      {/* The count is the accessible value here — the bar is
                          decorative and carries no text of its own. */}
                      <span className="w-8 shrink-0 text-right text-ink-faint">{n}</span>
                    </li>
                  );
                })}
              </ul>
            </>
          )}

          <div className="mt-8">
            <ReviewForm productId={productId} />
          </div>
        </div>

        <div>
          {reviews.length === 0 ? (
            <p className="text-sm text-ink-soft">
              Approved reviews will show up here.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {reviews.map((review) => (
                <li key={review.id} className="py-6 first:pt-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <StarRating rating={review.rating} showValue={false} />
                    <span className="font-medium">{review.authorName}</span>
                    {review.verifiedPurchase && (
                      <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                        Verified purchase
                      </span>
                    )}
                    <time
                      dateTime={review.createdAt.toISOString()}
                      className="ml-auto text-xs text-ink-faint"
                    >
                      {DATE_FORMAT.format(review.createdAt)}
                    </time>
                  </div>
                  {review.title && (
                    <h3 className="font-heading mt-3 text-base font-medium tracking-tight">
                      {review.title}
                    </h3>
                  )}
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-soft">
                    {review.comment}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
