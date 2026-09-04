import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { isRazorpayConfigured } from "@/lib/razorpay";
import { verifyCustomerSessionToken, CUSTOMER_SESSION_COOKIE } from "@/lib/auth";
import { pendingCoinsForOrder } from "@/lib/coins";

export default async function OrderSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ demo?: string }>;
}) {
  const { id } = await params;
  const { demo } = await searchParams;
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) notFound();

  // This page shows a delivery address, so an order that belongs to an account
  // is only visible to that account. Guest orders have no owner to check
  // against — their unguessable id is the only key the buyer ever gets.
  if (order.customerId) {
    const token = (await cookies()).get(CUSTOMER_SESSION_COOKIE)?.value;
    const session = token ? await verifyCustomerSessionToken(token) : null;
    if (session?.sub !== order.customerId) notFound();
  }

  const showDemoBanner = demo === "1" || !isRazorpayConfigured();

  return (
    <div className="container-page py-20">
      <div className="mx-auto max-w-xl text-center">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent text-2xl text-accent-ink">
          ✓
        </span>
        <h1 className="text-display mt-6 text-4xl font-medium">Order confirmed</h1>
        <p className="mt-3 text-ink-soft">
          Thanks, {order.customerName.split(" ")[0]}. A confirmation has been sent to{" "}
          {order.customerEmail}.
        </p>
        <p className="mt-1 text-xs text-ink-faint">Order #{order.id}</p>

        {showDemoBanner && (
          <div className="mt-6 rounded-xl border border-line bg-paper-soft px-4 py-3 text-left text-sm text-ink-soft">
            <strong className="text-ink">Demo mode.</strong> No Razorpay keys are configured, so
            this order was recorded and marked paid without a real charge. Add your Razorpay test
            keys to <code className="rounded bg-line/60 px-1">.env</code> to run a real sandbox
            payment.
          </div>
        )}
      </div>

      <div className="mx-auto mt-12 max-w-xl rounded-2xl border border-line p-6">
        <h2 className="text-sm font-medium uppercase tracking-widest text-ink-faint">
          Order details
        </h2>
        <ul className="mt-4 space-y-3">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center justify-between text-sm">
              <span>
                {item.name} <span className="text-ink-faint">× {item.quantity}</span>
              </span>
              <span>{formatPrice(item.priceCents * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6 space-y-2 border-t border-line pt-4 text-sm">
          <div className="flex justify-between text-ink-soft">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotalCents)}</span>
          </div>
          <div className="flex justify-between text-ink-soft">
            <span>Shipping</span>
            <span>{order.shippingCents === 0 ? "Free" : formatPrice(order.shippingCents)}</span>
          </div>
          {order.discountCents > 0 && (
            <div className="flex justify-between text-accent">
              <span>Life Coins ({order.coinsRedeemed})</span>
              <span>−{formatPrice(order.discountCents)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span>{formatPrice(order.totalCents)}</span>
          </div>
        </div>

        {order.coinsEarned > 0 ? (
          <div className="mt-6 flex items-center justify-between rounded-xl border border-line bg-paper-soft px-4 py-3 text-sm">
            <span className="text-ink-soft">Life Coins earned</span>
            <span className="font-medium text-accent">+{order.coinsEarned}</span>
          </div>
        ) : (
          pendingCoinsForOrder(order) > 0 && (
            <div className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-line bg-paper-soft px-4 py-3 text-sm">
              <span className="text-ink-soft">
                Life Coins on the way
                <span className="mt-0.5 block text-xs text-ink-faint">
                  Credited once this order is delivered.
                </span>
              </span>
              <span className="shrink-0 font-medium text-accent">
                +{pendingCoinsForOrder(order)}
              </span>
            </div>
          )
        )}
        <div className="mt-6 border-t border-line pt-4 text-sm text-ink-soft">
          <p>{order.addressLine1}{order.addressLine2 ? `, ${order.addressLine2}` : ""}</p>
          <p>
            {order.city}, {order.state} {order.postalCode}
          </p>
        </div>
      </div>

      <div className="mt-10 text-center">
        <Link href="/products" className="text-sm font-medium underline underline-offset-4">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
