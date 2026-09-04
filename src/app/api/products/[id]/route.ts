import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";
import { readJsonBody, badRequest } from "@/lib/request";
import { labelDataFrom } from "@/lib/product-label";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await readJsonBody(req);
  if (!body) return badRequest();
  const data: Record<string, unknown> = {};

  for (const key of ["slug", "name", "tagline", "description", "category", "badge", "image"] as const) {
    if (body[key] !== undefined) data[key] = body[key] || null;
  }
  if (body.benefits !== undefined) data.benefits = JSON.stringify(body.benefits);
  if (body.ingredients !== undefined) data.ingredients = JSON.stringify(body.ingredients);
  if (body.priceCents !== undefined) data.priceCents = Number(body.priceCents);
  if (body.compareAtCents !== undefined) data.compareAtCents = body.compareAtCents ? Number(body.compareAtCents) : null;
  if (body.stock !== undefined) data.stock = Number(body.stock);
  if (body.featured !== undefined) data.featured = Boolean(body.featured);
  if (body.active !== undefined) data.active = Boolean(body.active);
  Object.assign(data, labelDataFrom(body, "update"));

  try {
    const product = await prisma.product.update({ where: { id }, data });
    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: "Could not update product" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not delete product" }, { status: 400 });
  }
}
