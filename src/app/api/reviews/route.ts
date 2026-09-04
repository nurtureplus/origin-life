import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCustomerSession } from "@/lib/auth";
import { readJsonBody, badRequest } from "@/lib/request";
import { parseRating, summarize, type ReviewDTO } from "@/lib/reviews";

/** Orders that count as a purchase for the "verified" badge. */
const PURCHASED_STATUSES = ["paid", "shipped", "delivered"];

const MAX_COMMENT = 2000;
const MAX_TITLE = 120;

export async function GET(req: NextRequest) {
  const productId = req.nextUrl.searchParams.get("productId");
  if (!productId) return badRequest("productId is required");

  const [reviews, grouped] = await Promise.all([
    prisma.review.findMany({
      where: { productId, status: "approved" },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.review.groupBy({
      by: ["rating"],
      where: { productId, status: "approved" },
      _count: { rating: true },
    }),
  ]);

  const items: ReviewDTO[] = reviews.map((r) => ({
    id: r.id,
    authorName: r.authorName,
    rating: r.rating,
    title: r.title,
    comment: r.comment,
    verifiedPurchase: r.verifiedPurchase,
    createdAt: r.createdAt.toISOString(),
  }));

  return NextResponse.json({ reviews: items, summary: summarize(grouped) });
}

export async function POST(req: NextRequest) {
  const session = await requireCustomerSession(req);
  if (!session) {
    return NextResponse.json({ error: "Sign in to leave a review." }, { status: 401 });
  }

  const body = await readJsonBody(req);
  if (!body) return badRequest();

  const productId = typeof body.productId === "string" ? body.productId : "";
  const rating = parseRating(body.rating);
  const comment = typeof body.comment === "string" ? body.comment.trim() : "";
  const title = typeof body.title === "string" ? body.title.trim() : "";

  if (!productId) return badRequest("productId is required");
  if (rating === null) return badRequest("Rating must be a whole number from 1 to 5.");
  if (comment.length < 10) return badRequest("Please write at least 10 characters.");
  if (comment.length > MAX_COMMENT) return badRequest("Review is too long.");

  const [product, customer] = await Promise.all([
    prisma.product.findUnique({ where: { id: productId }, select: { id: true } }),
    prisma.customer.findUnique({ where: { id: session.sub }, select: { id: true, name: true } }),
  ]);
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  if (!customer) return NextResponse.json({ error: "Account not found" }, { status: 401 });

  // Derived from the order history, never taken from the request — the badge is
  // the only thing that makes a review worth trusting, so the client must not
  // be able to set it.
  const purchase = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: { customerId: customer.id, status: { in: PURCHASED_STATUSES } },
    },
    select: { id: true },
  });

  const data = {
    rating,
    title: title ? title.slice(0, MAX_TITLE) : null,
    comment,
    authorName: customer.name,
    verifiedPurchase: Boolean(purchase),
    // Every edit re-enters moderation; otherwise an approved review could be
    // rewritten into anything after the fact.
    status: "pending",
  };

  await prisma.review.upsert({
    where: { productId_customerId: { productId, customerId: customer.id } },
    create: { productId, customerId: customer.id, ...data },
    update: data,
  });

  return NextResponse.json(
    { ok: true, message: "Thanks — your review will appear once it's approved." },
    { status: 201 }
  );
}
