import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";

/** Constant-time compare of two hex digests of the same length. */
function signaturesMatch(expected: string, received: unknown): boolean {
  if (typeof received !== "string" || received.length !== expected.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(received, "hex"));
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
  if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ error: "Missing payment details" }, { status: 400 });
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Razorpay is not configured" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // The signature only proves that `razorpay_order_id` was paid — it says
  // nothing about which of our orders that was. Without tying the two together,
  // a valid signature from any cheap order could be replayed to mark a
  // different, expensive order as paid.
  if (!order.razorpayOrderId || order.razorpayOrderId !== razorpay_order_id) {
    return NextResponse.json(
      { error: "Payment does not belong to this order" },
      { status: 400 }
    );
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (!signaturesMatch(expectedSignature, razorpay_signature)) {
    return NextResponse.json({ error: "Payment signature verification failed" }, { status: 400 });
  }

  if (order.status === "cancelled") {
    return NextResponse.json({ error: "This order was cancelled" }, { status: 409 });
  }

  // Razorpay can call back more than once; only the first transition writes.
  if (order.status !== "pending") {
    return NextResponse.json({ ok: true, orderId: order.id, alreadyRecorded: true });
  }

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { status: "paid", razorpayPaymentId: razorpay_payment_id },
  });

  // No coins here — they're credited when the order is marked delivered.
  return NextResponse.json({ ok: true, orderId: updated.id });
}
