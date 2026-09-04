import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";
import { readJsonBody, badRequest } from "@/lib/request";

export async function GET(req: NextRequest) {
  const all = req.nextUrl.searchParams.get("all") === "1";
  const session = all ? await requireAdminSession(req) : null;

  const promos = await prisma.promo.findMany({
    where: all && session ? {} : { active: true },
    orderBy: { order: "asc" },
  });
  return NextResponse.json(promos);
}

export async function POST(req: NextRequest) {
  const session = await requireAdminSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await readJsonBody(req);
  if (!body) return badRequest();
  try {
    const promo = await prisma.promo.create({
      data: {
        slug: body.slug,
        title: body.title,
        subtitle: body.subtitle || null,
        image: body.image,
        badge: body.badge || null,
        ctaLabel: body.ctaLabel || null,
        ctaHref: body.ctaHref || null,
        order: Number(body.order ?? 0),
        active: body.active !== false,
      },
    });
    return NextResponse.json(promo, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not create promo. Check the slug is unique." }, { status: 400 });
  }
}
