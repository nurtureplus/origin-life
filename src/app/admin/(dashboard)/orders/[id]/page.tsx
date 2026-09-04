import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";
import { pendingCoinsForOrder } from "@/lib/coins";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) notFound();

  return (
    <div className="max-w-3xl">
      <Link href="/admin/orders" className="text-sm text-ink-soft transition hover:text-ink">
        ← All orders
      </Link>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <h1 className="text-display text-3xl font-medium">Order #{order.id.slice(-8)}</h1>
          <p className="mt-1 text-sm text-ink-faint">
            Placed {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <OrderStatusSelect orderId={order.id} status={order.status} />
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-line bg-paper-soft p-6">
          <h2 className="text-sm font-medium uppercase tracking-widest text-ink-faint">
            Customer
          </h2>
          <p className="mt-3 text-sm">{order.customerName}</p>
          <p className="text-sm text-ink-soft">{order.customerEmail}</p>
          <p className="text-sm text-ink-soft">{order.customerPhone}</p>
        </div>
        <div className="rounded-2xl border border-line bg-paper-soft p-6">
          <h2 className="text-sm font-medium uppercase tracking-widest text-ink-faint">
            Shipping address
          </h2>
          <p className="mt-3 text-sm text-ink-soft">
            {order.addressLine1}
            {order.addressLine2 ? `, ${order.addressLine2}` : ""}
          </p>
          <p className="text-sm text-ink-soft">
            {order.city}, {order.state} {order.postalCode}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-paper-soft p-6">
        <h2 className="text-sm font-medium uppercase tracking-widest text-ink-faint">Items</h2>
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
              <span>Life Coins redeemed ({order.coinsRedeemed})</span>
              <span>−{formatPrice(order.discountCents)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span>{formatPrice(order.totalCents)}</span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 border-t border-line pt-4 text-xs text-ink-faint">
          <span>Life Coins earned: {order.coinsEarned}</span>
          <span>Life Coins redeemed: {order.coinsRedeemed}</span>
          {order.status === "cancelled" && <span>Coins reversed on cancellation.</span>}
        </div>

        {pendingCoinsForOrder(order) > 0 &&
          (order.customerId ? (
            <p className="mt-3 rounded-xl border border-line bg-paper-soft px-4 py-3 text-xs text-ink-soft">
              <strong className="text-ink">{pendingCoinsForOrder(order)} Life Coins</strong> are
              waiting on this order. They reach {order.customerName} the moment you set the status
              to <strong className="text-ink">Delivered</strong>.
            </p>
          ) : (
            <p className="mt-3 rounded-xl border border-line bg-paper-soft px-4 py-3 text-xs text-ink-soft">
              Guest checkout — there is no account to credit, so this order earns no Life Coins.
            </p>
          ))}

        {order.razorpayPaymentId && (
          <p className="mt-4 text-xs text-ink-faint">
            Razorpay payment: {order.razorpayPaymentId}
          </p>
        )}
      </div>
    </div>
  );
}
