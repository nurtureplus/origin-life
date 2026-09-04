import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";
import { readJsonBody, badRequest } from "@/lib/request";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const reel = await prisma.reel.findUnique({ where: { id } });
  if (!reel) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(reel);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await readJsonBody(req);
  if (!body) return badRequest();
  const data: Record<string, unknown> = {};

  for (const key of ["title", "videoUrl", "thumbnail", "instagramUrl"] as const) {
    if (body[key] !== undefined) data[key] = body[key] || null;
  }
  if (body.order !== undefined) data.order = Number(body.order);
  if (body.active !== undefined) data.active = Boolean(body.active);

  try {
    const reel = await prisma.reel.update({ where: { id }, data });
    return NextResponse.json(reel);
  } catch {
    return NextResponse.json({ error: "Could not update reel" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    await prisma.reel.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not delete reel" }, { status: 400 });
  }
}
