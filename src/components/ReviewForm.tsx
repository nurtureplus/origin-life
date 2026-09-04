"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCustomer } from "@/lib/use-customer";
import { buttonClass } from "@/lib/button";

const STAR_PATH =
  "M12 2.6l2.9 5.9 6.5.95-4.7 4.6 1.1 6.45L12 17.45 6.2 20.5l1.1-6.45-4.7-4.6 6.5-.95L12 2.6Z";

const RATING_LABELS = ["Poor", "Fair", "Good", "Very good", "Excellent"];

export function ReviewForm({ productId }: { productId: string }) {
  const { customer, loaded } = useCustomer();
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  // Rendering the signed-out prompt before the session has resolved makes the
  // form flash "sign in" for customers who are already signed in.
  if (!loaded) return <div className="h-32" aria-hidden="true" />;

  if (!customer) {
    return (
      <div className="rounded-2xl border border-line bg-paper-soft p-6">
        <p className="text-sm text-ink-soft">
          Only signed-in customers can review a product.
        </p>
        <Link href="/account/login" className={buttonClass({ size: "md", className: "mt-4" })}>
          Sign in to write a review
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-line bg-paper-soft p-6">
        <p className="font-medium">Review submitted</p>
        <p className="mt-1 text-sm text-ink-soft">{done}</p>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (rating === 0) {
      setError("Please choose a rating.");
      return;
    }

    setPending(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, title, comment }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setDone(data.message ?? "Thanks for your review.");
      router.refresh();
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setPending(false);
    }
  }

  const shown = hovered || rating;

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-line bg-paper-soft p-6">
      <h3 className="font-heading text-lg font-medium tracking-tight">Write a review</h3>

      {/* Radios rather than buttons: the group is a single required choice, so
          arrow keys move between stars and the label is read out properly. */}
      <fieldset className="mt-4">
        <legend className="text-sm font-medium">Your rating</legend>
        <div className="mt-2 flex items-center gap-1" onMouseLeave={() => setHovered(0)}>
          {[1, 2, 3, 4, 5].map((value) => (
            <label
              key={value}
              onMouseEnter={() => setHovered(value)}
              className="cursor-pointer p-1 text-2xl leading-none"
            >
              <input
                type="radio"
                name="rating"
                value={value}
                checked={rating === value}
                onChange={() => setRating(value)}
                className="sr-only peer"
              />
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className={`h-8 w-8 transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink ${
                  value <= shown ? "fill-brand-orange" : "fill-line-strong"
                }`}
              >
                <path d={STAR_PATH} />
              </svg>
              <span className="sr-only">
                {value} star{value > 1 ? "s" : ""} — {RATING_LABELS[value - 1]}
              </span>
            </label>
          ))}
          <span className="ml-2 text-sm text-ink-soft">
            {shown > 0 ? RATING_LABELS[shown - 1] : "Select a rating"}
          </span>
        </div>
      </fieldset>

      <div className="mt-5">
        <label htmlFor="review-title" className="text-sm font-medium">
          Title <span className="text-ink-faint">(optional)</span>
        </label>
        <input
          id="review-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          className="mt-2 w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm outline-none focus-visible:border-ink"
        />
      </div>

      <div className="mt-4">
        <label htmlFor="review-comment" className="text-sm font-medium">
          Your review
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
          minLength={10}
          maxLength={2000}
          rows={5}
          aria-describedby="review-comment-help"
          className="mt-2 w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm outline-none focus-visible:border-ink"
        />
        <p id="review-comment-help" className="mt-2 text-xs text-ink-faint">
          Tell other customers how you used it and what you noticed. Please don&apos;t describe
          treating or curing a medical condition — we can&apos;t publish those.
        </p>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-paper-softer px-4 py-3 text-sm text-ink">
          {error}
        </p>
      )}

      <button type="submit" disabled={pending} className={buttonClass({ size: "lg", className: "mt-5" })}>
        {pending ? "Submitting…" : "Submit review"}
      </button>
      <p className="mt-3 text-xs text-ink-faint">
        Reviews are checked before they appear.
      </p>
    </form>
  );
}
