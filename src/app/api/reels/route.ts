import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";
import { readJsonBody, badRequest } from "@/lib/request";

export async function GET(req: NextRequest) {
  const all = req.nextUrl.searchParams.get("all") === "1";
  const session = all ? await requireAdminSession(req) : null;

  const reels = await prisma.reel.findMany({
    where: all && session ? {} : { active: true },
    orderBy: { order: "asc" },
  });
  return NextResponse.json(reels);
}

export async function POST(req: NextRequest) {
  const session = await requireAdminSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await readJsonBody(req);
  if (!body) return badRequest();
  if (!body.title || !body.videoUrl) {
    return NextResponse.json({ error: "Title and video are required" }, { status: 400 });
  }

  const reel = await prisma.reel.create({
    data: {
      title: body.title,
      videoUrl: body.videoUrl,
      thumbnail: body.thumbnail || null,
      instagramUrl: body.instagramUrl || null,
      order: Number(body.order ?? 0),
      active: body.active !== false,
    },
  });
  return NextResponse.json(reel, { status: 201 });
}
