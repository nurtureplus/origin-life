// Server-side only: importing this from a client component pulls Prisma into
// the browser bundle. It has no "server-only" guard because the package isn't a
// dependency here — keep the import list of client components clean by hand.
import { prisma } from "@/lib/prisma";
import { summarize, EMPTY_SUMMARY, type ReviewSummary } from "@/lib/reviews";

/**
 * Rating summaries for a list of products, in one query.
 *
 * Product grids ask for a rating per card; doing that per card is a query per
 * product on every listing page. One `groupBy` over the whole page's ids costs
 * the same as one card's would.
 */
export async function getRatingsFor(productIds: string[]): Promise<Map<string, ReviewSummary>> {
  const map = new Map<string, ReviewSummary>();
  if (productIds.length === 0) return map;

  const grouped = await prisma.review.groupBy({
    by: ["productId", "rating"],
    where: { productId: { in: productIds }, status: "approved" },
    _count: { rating: true },
  });

  const byProduct = new Map<string, { rating: number; _count: { rating: number } }[]>();
  for (const row of grouped) {
    const rows = byProduct.get(row.productId) ?? [];
    rows.push({ rating: row.rating, _count: { rating: row._count.rating } });
    byProduct.set(row.productId, rows);
  }

  for (const id of productIds) {
    const rows = byProduct.get(id);
    map.set(id, rows ? summarize(rows) : EMPTY_SUMMARY);
  }

  return map;
}
