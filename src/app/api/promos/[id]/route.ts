import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";
import { readJsonBody, badRequest } from "@/lib/request";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const promo = await prisma.promo.findUnique({ where: { id } });
  if (!promo) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(promo);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await readJsonBody(req);
  if (!body) return badRequest();
  const data: Record<string, unknown> = {};

  for (const key of ["slug", "title", "subtitle", "image", "badge", "ctaLabel", "ctaHref"] as const) {
    if (body[key] !== undefined) data[key] = body[key] || null;
  }
  if (body.order !== undefined) data.order = Number(body.order);
  if (body.active !== undefined) data.active = Boolean(body.active);

  try {
    const promo = await prisma.promo.update({ where: { id }, data });
    return NextResponse.json(promo);
  } catch {
    return NextResponse.json({ error: "Could not update promo" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    await prisma.promo.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not delete promo" }, { status: 400 });
  }
}
