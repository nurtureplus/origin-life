export type ReviewDTO = {
  id: string;
  authorName: string;
  rating: number;
  title: string | null;
  comment: string;
  verifiedPurchase: boolean;
  createdAt: string;
};

export type ReviewSummary = {
  /** Mean rating rounded to one decimal, or 0 when there are none. */
  average: number;
  count: number;
  /** Index 0 = one star … index 4 = five stars. */
  distribution: [number, number, number, number, number];
};

export const EMPTY_SUMMARY: ReviewSummary = {
  average: 0,
  count: 0,
  distribution: [0, 0, 0, 0, 0],
};

export const REVIEW_STATUSES = ["pending", "approved", "rejected"] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export function isReviewStatus(value: unknown): value is ReviewStatus {
  return typeof value === "string" && (REVIEW_STATUSES as readonly string[]).includes(value);
}

/**
 * Builds the rating summary from a `groupBy(rating)` result.
 *
 * The counts come out of the database as one row per distinct rating, so a
 * product with only 5-star reviews returns a single row — the caller still
 * needs all five buckets to draw the breakdown bars.
 */
export function summarize(rows: { rating: number; _count: { rating: number } }[]): ReviewSummary {
  const distribution: [number, number, number, number, number] = [0, 0, 0, 0, 0];
  let total = 0;
  let count = 0;

  for (const row of rows) {
    const index = Math.min(5, Math.max(1, row.rating)) - 1;
    distribution[index] += row._count.rating;
    total += row.rating * row._count.rating;
    count += row._count.rating;
  }

  return {
    average: count === 0 ? 0 : Math.round((total / count) * 10) / 10,
    count,
    distribution,
  };
}

/** Clamps arbitrary input to a whole 1–5 rating, or null if it isn't one. */
export function parseRating(value: unknown): number | null {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1 || n > 5) return null;
  return n;
}
