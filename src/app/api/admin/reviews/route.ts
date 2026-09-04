import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";
import { isReviewStatus } from "@/lib/reviews";

export async function GET(req: NextRequest) {
  const session = await requireAdminSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const status = req.nextUrl.searchParams.get("status");
  const reviews = await prisma.review.findMany({
    where: isReviewStatus(status) ? { status } : {},
    orderBy: { createdAt: "desc" },
    include: { product: { select: { name: true, slug: true } } },
    take: 200,
  });

  return NextResponse.json(reviews);
}
