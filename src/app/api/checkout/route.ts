import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRazorpayClient, isRazorpayConfigured } from "@/lib/razorpay";
import { requireCustomerSession } from "@/lib/auth";
import { coinsToDiscountPaise, maxRedeemableCoins } from "@/lib/coins";
import { getAvailableBalance, redeemCoinsForOrder } from "@/lib/coin-service";
import { readJsonBody, badRequest } from "@/lib/request";

type CheckoutItem = { productId: string; quantity: number };

export async function POST(req: NextRequest) {
  const body = await readJsonBody(req);
  if (!body) return badRequest();
  const items: CheckoutItem[] = body.items ?? [];
  const customer = body.customer ?? {};
  const session = await requireCustomerSession(req);

  if (items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  for (const field of ["name", "email", "phone", "addressLine1", "city", "state", "postalCode"]) {
    if (!customer[field]) {
      return NextResponse.json({ error: `Missing field: ${field}` }, { status: 400 });
    }
  }

  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i) => i.productId) }, active: true },
  });

  if (products.length === 0) {
    return NextResponse.json({ error: "No valid products in cart" }, { status: 400 });
  }

  const orderItems = items
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return null;
      // Sold out means sold out — `stock || 999` used to read 0 as "no limit"
      // and let out-of-stock items through, driving stock negative.
      if (product.stock <= 0) return null;
      const requested = Math.floor(Number(item.quantity));
      if (!Number.isFinite(requested) || requested < 1) return null;
      return {
        productId: product.id,
        name: product.name,
        priceCents: product.priceCents,
        quantity: Math.min(requested, product.stock),
      };
    })
    .filter((i): i is NonNullable<typeof i> => i !== null);

  if (orderItems.length === 0) {
    return NextResponse.json(
      { error: "Everything in your cart is out of stock" },
      { status: 400 }
    );
  }

  const subtotalCents = orderItems.reduce((sum, i) => sum + i.priceCents * i.quantity, 0);
  const shippingCents = subtotalCents >= 99900 ? 0 : 6900;

  // Life Coins: only signed-in customers can redeem, and the amount is
  // re-derived from their real balance here — never trusted from the client.
  let coinsRedeemed = 0;
  let discountCents = 0;
  if (session && Number(body.coinsToRedeem) > 0) {
    // Balance comes from live (unexpired) lots, not the cached column, so a
    // stale cache can't let someone spend coins that have already lapsed.
    const available = await getAvailableBalance(prisma, session.sub);
    const requested = Math.floor(Number(body.coinsToRedeem));
    coinsRedeemed = Math.max(0, Math.min(requested, maxRedeemableCoins(available, subtotalCents)));
    discountCents = coinsToDiscountPaise(coinsRedeemed);
  }

  const totalCents = subtotalCents + shippingCents - discountCents;

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        customerId: session?.sub || null,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        addressLine1: customer.addressLine1,
        addressLine2: customer.addressLine2 || null,
        city: customer.city,
        state: customer.state,
        postalCode: customer.postalCode,
        subtotalCents,
        shippingCents,
        coinsRedeemed,
        discountCents,
        totalCents,
        items: { create: orderItems },
      },
    });

    for (const item of orderItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // Debit the coins in the same transaction as the order so the two can
    // never disagree.
    if (session && coinsRedeemed > 0) {
      await redeemCoinsForOrder(tx, {
        customerId: session.sub,
        orderId: created.id,
        coins: coinsRedeemed,
      });
    }

    return created;
  });

  if (!isRazorpayConfigured()) {
    // Demo mode: no Razorpay keys configured — mark the order paid immediately
    // so the storefront and admin flows remain fully clickable end-to-end.
    await prisma.order.update({ where: { id: order.id }, data: { status: "paid" } });
    // Coins are credited on delivery, so nothing is granted here.
    return NextResponse.json({ orderId: order.id, demo: true });
  }

  const razorpay = getRazorpayClient()!;
  const rpOrder = await razorpay.orders.create({
    amount: totalCents,
    currency: "INR",
    receipt: order.id,
  });

  await prisma.order.update({ where: { id: order.id }, data: { razorpayOrderId: rpOrder.id } });

  return NextResponse.json({
    orderId: order.id,
    demo: false,
    razorpayOrderId: rpOrder.id,
    amount: totalCents,
    currency: "INR",
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  });
}
