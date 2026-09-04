import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";
import { readJsonBody, badRequest } from "@/lib/request";
import { labelDataFrom } from "@/lib/product-label";

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category");
  const products = await prisma.product.findMany({
    where: {
      active: true,
      ...(category ? { category } : {}),
    },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const session = await requireAdminSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await readJsonBody(req);
  if (!body) return badRequest();
  try {
    const product = await prisma.product.create({
      data: {
        slug: body.slug,
        name: body.name,
        tagline: body.tagline,
        description: body.description,
        benefits: JSON.stringify(body.benefits ?? []),
        ingredients: JSON.stringify(body.ingredients ?? []),
        priceCents: Number(body.priceCents),
        compareAtCents: body.compareAtCents ? Number(body.compareAtCents) : null,
        category: body.category,
        badge: body.badge || null,
        image: body.image || "/products/core.svg",
        stock: Number(body.stock ?? 100),
        featured: Boolean(body.featured),
        active: body.active !== false,
        ...labelDataFrom(body, "create"),
      },
    });
    return NextResponse.json(product, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not create product. Check the slug is unique." }, { status: 400 });
  }
}
