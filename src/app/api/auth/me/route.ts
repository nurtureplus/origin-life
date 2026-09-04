import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCustomerSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await requireCustomerSession(req);
  if (!session) return NextResponse.json({ customer: null });

  // Read the balance fresh so the nav/checkout never show stale coins.
  const customer = await prisma.customer.findUnique({
    where: { id: session.sub },
    select: { name: true, email: true, phone: true, lifeCoins: true },
  });
  if (!customer) return NextResponse.json({ customer: null });

  return NextResponse.json({ customer });
}
