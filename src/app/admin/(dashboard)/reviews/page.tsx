import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { isReviewStatus } from "@/lib/reviews";
import { ReviewModerationRow } from "@/components/admin/ReviewModerationRow";

export const dynamic = "force-dynamic";

const FILTERS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "all", label: "All" },
];

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const active = isReviewStatus(status) ? status : status === "all" ? "all" : "pending";

  const [reviews, counts] = await Promise.all([
    prisma.review.findMany({
      where: active === "all" ? {} : { status: active },
      orderBy: { createdAt: "desc" },
      include: { product: { select: { name: true, slug: true } } },
      take: 200,
    }),
    prisma.review.groupBy({ by: ["status"], _count: { status: true } }),
  ]);

  const countFor = (value: string) =>
    value === "all"
      ? counts.reduce((sum, c) => sum + c._count.status, 0)
      : (counts.find((c) => c.status === value)?._count.status ?? 0);

  return (
    <div>
      <div>
        <h1 className="text-display text-3xl font-medium">Reviews</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Nothing is published until it is approved here. Reject anything that makes a medical
          claim — those cannot go on the site.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={`/admin/reviews?status=${f.value}`}
            className={`rounded-full border px-4 py-2 text-sm transition ${
              active === f.value
                ? "border-ink bg-ink text-paper"
                : "border-line text-ink-soft hover:border-ink hover:text-ink"
            }`}
          >
            {f.label} ({countFor(f.value)})
          </Link>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {reviews.length === 0 && (
          <p className="rounded-2xl border border-line bg-paper-soft px-6 py-10 text-center text-ink-faint">
            Nothing here.
          </p>
        )}
        {reviews.map((review) => (
          <ReviewModerationRow
            key={review.id}
            review={{
              id: review.id,
              authorName: review.authorName,
              rating: review.rating,
              title: review.title,
              comment: review.comment,
              verifiedPurchase: review.verifiedPurchase,
              status: review.status,
              createdAt: review.createdAt.toISOString(),
              productName: review.product.name,
              productSlug: review.product.slug,
            }}
          />
        ))}
      </div>
    </div>
  );
}
