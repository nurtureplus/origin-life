"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { StarRating } from "@/components/StarRating";
import { buttonClass } from "@/lib/button";

type ModeratedReview = {
  id: string;
  authorName: string;
  rating: number;
  title: string | null;
  comment: string;
  verifiedPurchase: boolean;
  status: string;
  createdAt: string;
  productName: string;
  productSlug: string;
};

export function ReviewModerationRow({ review }: { review: ModeratedReview }) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function setStatus(status: string) {
    setPending(status);
    setError(null);
    try {
      const res = await fetch(`/api/admin/reviews/${review.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        setError("Could not update this review.");
        return;
      }
      router.refresh();
    } finally {
      setPending(null);
    }
  }

  async function remove() {
    // Deleting is permanent and there is no undo, so it asks first.
    if (!window.confirm(`Delete ${review.authorName}'s review permanently?`)) return;
    setPending("delete");
    setError(null);
    try {
      const res = await fetch(`/api/admin/reviews/${review.id}`, { method: "DELETE" });
      if (!res.ok) {
        setError("Could not delete this review.");
        return;
      }
      router.refresh();
    } finally {
      setPending(null);
    }
  }

  return (
    <article className="rounded-2xl border border-line bg-paper-soft p-6">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <StarRating rating={review.rating} showValue={false} />
        <span className="font-medium">{review.authorName}</span>
        {review.verifiedPurchase && (
          <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
            Verified purchase
          </span>
        )}
        <span className="rounded-full border border-line px-2 py-0.5 text-xs capitalize text-ink-soft">
          {review.status}
        </span>
        <Link
          href={`/products/${review.productSlug}`}
          className="text-sm text-ink-soft underline underline-offset-4 hover:text-ink"
        >
          {review.productName}
        </Link>
        <time dateTime={review.createdAt} className="ml-auto text-xs text-ink-faint">
          {new Date(review.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </time>
      </div>

      {review.title && <h2 className="font-heading mt-3 font-medium tracking-tight">{review.title}</h2>}
      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-soft">
        {review.comment}
      </p>

      {error && (
        <p role="alert" className="mt-3 text-sm text-ink">
          {error}
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        {review.status !== "approved" && (
          <button
            onClick={() => setStatus("approved")}
            disabled={pending !== null}
            className={buttonClass({ size: "md" })}
          >
            {pending === "approved" ? "Approving…" : "Approve"}
          </button>
        )}
        {review.status !== "rejected" && (
          <button
            onClick={() => setStatus("rejected")}
            disabled={pending !== null}
            className={buttonClass({ variant: "secondary", size: "md" })}
          >
            {pending === "rejected" ? "Rejecting…" : "Reject"}
          </button>
        )}
        {review.status !== "pending" && (
          <button
            onClick={() => setStatus("pending")}
            disabled={pending !== null}
            className={buttonClass({ variant: "secondary", size: "md" })}
          >
            Back to pending
          </button>
        )}
        <button
          onClick={remove}
          disabled={pending !== null}
          className={buttonClass({ variant: "secondary", size: "md", className: "ml-auto" })}
        >
          {pending === "delete" ? "Deleting…" : "Delete"}
        </button>
      </div>
    </article>
  );
}
