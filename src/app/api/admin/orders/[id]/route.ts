import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";
import { awardCoinsForDeliveredOrder, reverseCoinsForCancelledOrder } from "@/lib/coin-service";
import { readJsonBody, badRequest } from "@/lib/request";

const VALID_STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled"];

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(order);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await readJsonBody<{ status?: string }>(req);
  if (!body) return badRequest();
  const { status } = body;
  if (!status || !VALID_STATUSES.includes(status)) {
    return NextResponse.json(
      { error: `Status must be one of: ${VALID_STATUSES.join(", ")}` },
      { status: 400 }
    );
  }

  const previous = await prisma.order.findUnique({ where: { id } });
  if (!previous) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const order = await prisma.order.update({ where: { id }, data: { status } });

  // Keep Life Coins in step with the order's real state. Coins are credited on
  // DELIVERY, not payment — the programme pays out on fulfilment.
  if (status === "cancelled" && previous.status !== "cancelled") {
    await reverseCoinsForCancelledOrder(order.id);
  } else if (status === "delivered" && previous.status !== "delivered") {
    await awardCoinsForDeliveredOrder(order.id);
  }

  return NextResponse.json(order);
}
